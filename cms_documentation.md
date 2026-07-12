# KIO Git-Based CMS — Technical Documentation

## Overview

The KIO CMS is a **serverless, git-based Content Management System** built directly into the same TanStack Start application it manages. There is no third-party CMS service, no separate backend, and no database. All content is stored as JSON files inside the GitHub repository. When an editor saves a change, the CMS commits the updated JSON directly to GitHub, and Vercel automatically rebuilds and redeploys the site with the new content.

---

## Architecture at a Glance

```
┌───────────────────────────────────────────────────────────────┐
│                        Browser (Editor)                        │
│                                                               │
│   /admin → CMSShell.tsx (React SPA)                           │
│      ├── useEditor.ts   (fetch + dirty track + save)          │
│      └── api-client.ts  (fetch wrapper)                       │
└──────────────────────────┬────────────────────────────────────┘
                           │ HTTP (same origin)
┌──────────────────────────▼────────────────────────────────────┐
│             Vercel Serverless Function (Nitro SSR)             │
│                                                               │
│  Auth routes (server.handlers inside createFileRoute):        │
│    GET /api/admin/auth/login    → redirect to GitHub OAuth    │
│    GET /api/admin/auth/callback → exchange code, set cookie   │
│    GET /api/admin/auth/logout   → clear cookie                │
│    GET /api/admin/me            → return GitHub profile       │
│                                                               │
│  Content routes:                                              │
│    GET /api/admin/content/:file → read JSON from GitHub API   │
│    PUT /api/admin/content/:file → write JSON to GitHub API    │
│                                                               │
│  Auth check: session.ts (HMAC-SHA256 signed HTTP-only cookie) │
│  GitHub calls: github-api.ts (GitHub Contents REST API v3)    │
└──────────────────────────┬────────────────────────────────────┘
                           │ GitHub API v3 (HTTPS)
┌──────────────────────────▼────────────────────────────────────┐
│                   GitHub Repository (main)                     │
│                                                               │
│   src/content/site.json       (home page content)             │
│   src/content/team.json       (team roster)                   │
│   src/content/news.json       (upcoming events)               │
│   src/content/events.json     (past events archive)           │
│   src/content/support.json    (donations & partnerships)       │
│   src/content/resources.json  (learning links)               │
└──────────────────────────┬────────────────────────────────────┘
                           │ GitHub → Vercel webhook
┌──────────────────────────▼────────────────────────────────────┐
│               Vercel (auto-redeploy on push to main)           │
│                                                               │
│   npm run build  →  vite build (Nitro + TanStack Start)       │
│   JSON bundled at build time into the serverless function      │
│   Site goes live with updated content (~1-2 min build time)   │
└───────────────────────────────────────────────────────────────┘
```

---

## Part 1: How Authentication Works

### Technology: GitHub OAuth 2.0 Web Flow + HMAC-Signed Cookies

Rather than managing usernames and passwords, the CMS delegates authentication entirely to GitHub. This is secure, requires no database, and means only people with access to the GitHub repository can log into the CMS.

### Step-by-Step Flow

**Step 1: Editor clicks "Sign in with GitHub"**

The CMS `<a href="/api/admin/auth/login">` link hits the login route.

```typescript
// src/routes/api.admin.auth.login.ts
GET /api/admin/auth/login

// Server generates a random "state" value (CSRF protection)
const state = crypto.randomUUID();

// Stores it in a short-lived HttpOnly cookie
Set-Cookie: kio_oauth_state=<state>; HttpOnly; Max-Age=600

// Redirects to GitHub's OAuth authorization URL
Location: https://github.com/login/oauth/authorize?
  client_id=<GITHUB_CLIENT_ID>&scope=repo&state=<state>
```

**Step 2: GitHub shows the consent screen**

The user approves the scope (`repo` — required to read/write files). GitHub redirects back to the registered callback URL.

**Step 3: GitHub calls the callback**

```typescript
// src/routes/api.admin.auth.callback.ts
GET /api/admin/auth/callback?code=<CODE>&state=<STATE>

// Validate state matches the cookie (CSRF protection)
if (cookies.kio_oauth_state !== state) → show error page

// Exchange the code for a GitHub access token
POST https://github.com/login/oauth/access_token
  { client_id, client_secret, code }

// Returns: { access_token: "ghp_..." }

// Sign the token into a secure cookie and redirect to /admin
Set-Cookie: kio_session=<signed_token>; HttpOnly; SameSite=Lax; Max-Age=604800
Location: /admin
```

**Step 4: Session is maintained via a signed cookie**

The access token is never stored in `localStorage` or `sessionStorage`. It lives only in an HTTP-only cookie (invisible to JavaScript), preventing XSS attacks from stealing it.

### Session Signing: HMAC-SHA256

The session cookie is tamper-proof. The format is:
```
base64url(token) . base64url(HMAC-SHA256(base64url(token), SESSION_SECRET))
```

```typescript
// src/lib/session.ts

// To encode (at login):
const encoded = Buffer.from(token).toString("base64url");
const sig = await crypto.subtle.sign("HMAC", key, enc.encode(encoded));
cookieValue = `${encoded}.${base64url(sig)}`;

// To decode (on every authenticated request):
const [encoded, sig] = cookieValue.split(".");
const valid = await crypto.subtle.verify("HMAC", key, sig, enc.encode(encoded));
if (!valid) return null;
const token = Buffer.from(encoded, "base64url").toString("utf8");
```

If anyone tampers with the cookie value, the HMAC verification fails and the session is rejected. `SESSION_SECRET` must be a long random string set in Vercel's environment variables.

---

## Part 2: How API Routes Work (TanStack Start Server Handlers)

In TanStack Start v1, **API (server) routes** are defined inside `createFileRoute` using a `server.handlers` property. No separate Express server, no special `api/` directory convention — the same file-based routing that serves React pages also serves JSON endpoints.

```typescript
// Pattern for any API route
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/your/path")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return new Response(JSON.stringify({ hello: "world" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async ({ request }) => {
        const body = await request.json();
        // ...
        return new Response(JSON.stringify({ ok: true }));
      },
    },
  },
  // No component needed for pure API routes
});
```

The `request` is a standard Web API `Request` object. Return a standard `Response`. This means this code runs identically on Vercel, Cloudflare Workers, Node.js, or any other platform Nitro targets.

**Key constraint:** Files named `api.*.ts` (using dots instead of slashes) map to `/api/*` URLs. TanStack Start's router plugin converts `api.admin.auth.login.ts` → route path `/api/admin/auth/login`.

---

## Part 3: How Content Read/Write Works

### Reading Content (`GET /api/admin/content/:file`)

The CMS reads content live from the GitHub API (not the bundled copy):

```typescript
// src/lib/github-api.ts — readContentFile()

const url = `https://api.github.com/repos/OWNER/REPO/contents/src/content/${file}.json?ref=main`;
const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
const fileData = await res.json();

// GitHub returns base64-encoded content
const decoded = Buffer.from(fileData.content.replace(/\n/g, ""), "base64").toString("utf8");
return { data: JSON.parse(decoded), sha: fileData.sha };
```

The `sha` is the git blob hash for this exact file version. It is returned to the CMS editor and **must be included when writing** to prevent overwriting concurrent changes (GitHub rejects writes with a stale SHA).

### Writing Content (`PUT /api/admin/content/:file`)

```typescript
// src/lib/github-api.ts — writeContentFile()

const content = Buffer.from(JSON.stringify(data, null, 2) + "\n").toString("base64");

await fetch(`https://api.github.com/repos/OWNER/REPO/contents/src/content/${file}.json`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    message: `cms: update ${file}`,   // git commit message
    content,                           // base64-encoded new file content
    sha,                               // current blob SHA (required by GitHub)
    branch: "main",
  }),
});
```

This single API call **creates a git commit on the `main` branch of the repository**. No git binary required on the server. The GitHub API does all the git work.

---

## Part 4: The Editor UI Architecture

### `useEditor.ts` — The Core Hook

Every editor component uses a single shared hook that abstracts:
1. **Loading** data from the API on mount (reads from GitHub live)
2. **Dirty tracking** — knows when the local state differs from saved state
3. **Saving** — PUTs the new data to the API, then re-fetches to get the updated SHA

```typescript
// Simplified structure
function useEditor<T>(fileKey: string) {
  const [data, setData] = useState<T | null>(null);
  const [sha, setSha] = useState("");
  const [dirty, setDirty] = useState(false);

  // On mount: fetch from /api/admin/content/:fileKey
  useEffect(() => {
    fetchContent(fileKey).then(({ data, sha }) => { setData(data); setSha(sha); });
  }, [fileKey]);

  // On change: mark as dirty
  const updateData = (updater) => {
    setData(prev => { const next = updater(prev); setDirty(true); return next; });
  };

  // On save: PUT to API, then re-fetch new SHA
  const save = async () => {
    await saveContent(fileKey, data, sha);
    const { sha: newSha } = await fetchContent(fileKey);
    setSha(newSha);
    setDirty(false);
  };

  return { data, dirty, save, setData: updateData, ... };
}
```

### Editor Components

Each editor receives typed data from `useEditor<MyType>("file-key")` and renders a form. Changes call `setData()` (marks dirty, updates local state). Clicking Save calls `save()` which commits to GitHub.

```typescript
// Pattern for any editor
export function SiteEditor() {
  const { data, dirty, save, setData, saveStatus, loadError } = useEditor<SiteData>("site");

  if (!data) return <div>Loading…</div>;

  return (
    <div>
      <input value={data.hero.title}
             onChange={e => setData(d => ({ ...d, hero: { ...d.hero, title: e.target.value } }))} />
      <SaveBar dirty={dirty} status={saveStatus} onSave={save} />
    </div>
  );
}
```

---

## Part 5: How the Deployment Pipeline Works

### Why Content Appears on the Live Site After a ~2 Minute Delay

The public website pages use **static imports** at the top of each route file:

```typescript
import site from "@/content/site.json";
```

Vite (the bundler) includes the JSON content directly into the JavaScript bundle at **build time**. The live site renders this pre-baked data extremely fast (no runtime DB query). When the CMS commits an update, Vercel detects the new commit on `main`, runs `npm run build`, bundles the updated JSON, and redeploys the serverless function — typically within 1–2 minutes.

### Critical Requirement: Never Commit `.vercel/output/`

During `npm run build`, Nitro generates a `.vercel/output/` directory containing the compiled server bundle. **This directory must never be committed to git.** If it is, Vercel detects it as a pre-built deployment and skips running `npm run build`, meaning content changes are never bundled.

```
# .gitignore — required entries
.output
.vercel
```

---

## Part 6: Replicating This for Another Website

### Prerequisites

- A GitHub repository containing your site source code
- Your JSON content files living inside `src/content/` (or wherever)
- A TanStack Start application (v1.x) deployed on Vercel
- A GitHub OAuth App

### Step 1: Create a GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Fill in:
   - **Application name:** `My Site CMS`
   - **Homepage URL:** `https://your-domain.com`
   - **Authorization callback URL:** `https://your-domain.com/api/admin/auth/callback`
3. Copy the **Client ID** and generate a **Client Secret**.

### Step 2: Set Environment Variables on Vercel

In your Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `GITHUB_CLIENT_ID` | Your OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Your OAuth App Client Secret |
| `SESSION_SECRET` | A long random string (e.g. `openssl rand -hex 32`) |

### Step 3: Copy the Library Files

Copy these files verbatim into your project:

```
src/lib/session.ts       — HMAC cookie management (zero dependencies)
src/lib/github-api.ts    — GitHub Contents API wrapper
src/components/admin/api-client.ts   — fetch wrapper for CMS endpoints
src/components/admin/useEditor.ts    — core editor hook
src/components/admin/FormFields.tsx  — reusable form field components
```

Edit `github-api.ts` to point to your repository:
```typescript
const REPO = "YOUR_GITHUB_USERNAME/YOUR_REPO_NAME";
const BRANCH = "main";
```

Update `CONTENT_FILES` to list your JSON content files:
```typescript
export const CONTENT_FILES = {
  home: "src/content/home.json",
  blog: "src/content/blog.json",
  // add as many as you need
} as const;
```

### Step 4: Create the Auth Routes

Create these four files (copy exactly, they are generic):

```
src/routes/api.admin.auth.login.ts      — initiates OAuth
src/routes/api.admin.auth.callback.ts   — completes OAuth, sets cookie
src/routes/api.admin.auth.logout.ts     — clears cookie
src/routes/api.admin.me.ts              — returns GitHub profile
```

### Step 5: Create the Content Route

```typescript
// src/routes/api.admin.content.$file.ts
import { createFileRoute } from "@tanstack/react-router";
import { getSession } from "../lib/session";
import { readContentFile, writeContentFile, CONTENT_FILES, type ContentFileKey } from "../lib/github-api";

export const Route = createFileRoute("/api/admin/content/$file")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const json = (body: unknown, status = 200) =>
          new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

        const token = await getSession(request);
        if (!token) return json({ error: "Unauthorized" }, 401);

        const key = params.file as ContentFileKey;
        if (!CONTENT_FILES[key]) return json({ error: "Unknown file" }, 404);

        const { data, sha } = await readContentFile(token, key);
        return json({ data, sha });
      },

      PUT: async ({ request, params }) => {
        const json = (body: unknown, status = 200) =>
          new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

        const token = await getSession(request);
        if (!token) return json({ error: "Unauthorized" }, 401);

        const key = params.file as ContentFileKey;
        if (!CONTENT_FILES[key]) return json({ error: "Unknown file" }, 404);

        const body = await request.json();
        if (!body.sha) return json({ error: "Missing sha" }, 400);

        await writeContentFile(token, key, body.data, body.sha, body.message);
        return json({ ok: true });
      },
    },
  },
});
```

### Step 6: Create the Admin Route

```typescript
// src/routes/admin.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSession } from "../lib/session";

const checkSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const req = getRequest();
  const loggedIn = req ? !!(await getSession(req)) : false;
  return { loggedIn };
});

export const Route = createFileRoute("/admin")({
  loader: async () => await checkSession(),
  component: AdminRoute,
});

function AdminRoute() {
  const { loggedIn } = Route.useLoaderData();
  return loggedIn ? <CMSShell /> : <LoginPage />;
}

function LoginPage() {
  return (
    <div>
      <h1>Admin Login</h1>
      <a href="/api/admin/auth/login">Sign in with GitHub</a>
    </div>
  );
}
```

### Step 7: Create Your Editor Components

For each content file, create an editor component:

```typescript
// src/components/admin/editors/HomeEditor.tsx
import { useEditor } from "../useEditor";

interface HomeData {
  hero: { title: string; subtitle: string };
}

export function HomeEditor() {
  const { data, dirty, save, setData, saveStatus, saveError, loading, loadError } = useEditor<HomeData>("home");

  if (loading) return <div>Loading…</div>;
  if (loadError) return <div>Error: {loadError}</div>;
  if (!data) return null;

  return (
    <div>
      <input
        value={data.hero.title}
        onChange={e => setData(d => ({ ...d, hero: { ...d.hero, title: e.target.value } }))}
      />
      <button onClick={save} disabled={!dirty}>
        {saveStatus === "saving" ? "Saving…" : "Save"}
      </button>
      {saveError && <p style={{ color: "red" }}>{saveError}</p>}
    </div>
  );
}
```

### Step 8: Update `.gitignore`

```gitignore
# Build outputs — NEVER commit these
.output
.vercel
dist
node_modules
```

### Step 9: Update `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

Do **not** add `"framework": "vite"` — Nitro's Build Output API (`vercel` preset) generates `.vercel/output/` automatically, and Vercel will detect and use it without needing a framework hint.

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| Stolen session cookie | HttpOnly cookie — not accessible to JavaScript; HTTPS-only in production (`Secure` flag) |
| Tampered session cookie | HMAC-SHA256 signature — any bit flip fails verification |
| CSRF during OAuth | State parameter stored in HttpOnly cookie; validated in callback |
| Unauthorized content writes | Every API route checks the session cookie; GitHub also enforces that the OAuth token has `repo` scope on the target repository |
| Secret exposure | `SESSION_SECRET` and `GITHUB_CLIENT_SECRET` are environment variables, never in code or git |

---

## Summary: Why This Stack Works

| Property | Benefit |
|---|---|
| **No database** | Zero infrastructure cost, zero connection limits, zero schema migrations |
| **Git as storage** | Full change history, rollback, pull request reviews — all built in |
| **GitHub OAuth** | No password management; GitHub enforces 2FA on your behalf |
| **HTTP-only HMAC cookies** | Stateless sessions that can't be stolen by XSS or CSRF |
| **TanStack Start server.handlers** | API routes live in the same file-based routing system as UI routes — no separate Express server needed |
| **Nitro + Vercel** | Automatic deployment on every commit; scales to zero; no servers to manage |
| **Build-time JSON import** | Pages render instantly from bundled data; no runtime database queries |
