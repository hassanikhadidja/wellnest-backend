# Wellnest Backend API

Express.js + MongoDB API for the Wellnest Next.js frontend.

## Quick start

```bash
cd "wellnest backend"
npm install
cp .env.example .env   # then fill MongoDB + JWT secrets
npm run dev
```

Default: `http://127.0.0.1:5002`

## Frontend

Set in the Next.js app `.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5002
```

## Main routes

| Area | Base path |
|------|-----------|
| Auth / users | `/user` |
| Articles | `/article` |
| E-books | `/ebook` |
| Newsletter emails | `/newsletter` or `/email` |
| Questionnaire | `/questionnaire` |
| Uploads | `/upload` |

All routes are also available under `/api/*`.

See [spec.md](./spec.md) for field shapes aligned with the dashboard.
