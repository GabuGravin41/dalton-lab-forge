export default async function handler(req: any, res: any) {
  res.setHeader('Set-Cookie', `kio_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`);
  res.writeHead(302, { Location: '/admin' });
  res.end();
}
