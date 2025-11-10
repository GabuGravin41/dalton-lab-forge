# Papers Directory

This directory contains PDF files for research papers displayed in the portfolio.

## Adding Papers

1. Place your PDF files in this directory
2. Use descriptive filenames (e.g., `neural_network_optimization_2024.pdf`)
3. Update the `publications` array in `src/components/Research.tsx` with paper details

## File Naming Convention

- Use lowercase letters and underscores
- Include year if helpful: `paper_title_2024.pdf`
- Keep filenames concise but descriptive

## Example Paper Entry

```typescript
{
  title: "Your Paper Title",
  authors: "Your Name, Co-Author Name",
  venue: "Conference/Journal Name", // optional for drafts
  year: "2024",
  abstract: "Your paper abstract here...",
  tags: ["Machine Learning", "Hardware", "Optimization"],
  pdfPath: "/papers/your_paper_2024.pdf",
  status: "draft" // or "submitted", "preprint", "published"
}
```

## Status Types

- **draft**: Work in progress, not yet submitted
- **submitted**: Under review at a venue
- **preprint**: Available on arXiv or similar
- **published**: Accepted and published
