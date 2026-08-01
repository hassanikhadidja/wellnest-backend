# Wellnest Backend — Technical Specification

Express + MongoDB API for the Wellnest Next.js frontend (dashboard CMS, auth, newsletter).

## Entities (aligned with frontend `lib/dashboard-store.ts`)

| Entity | Fields |
|--------|--------|
| **User** | `id`, `name`, `email`, `password` (hashed), `role` (`user` \| `admin`), `createdAt` |
| **Article** | `categories[]`, `image`, `title`, `subtitle`, `keyPoints[]`, `author`, `introduction`, `sections[]`, `tip`, `tags[]`, `createdAt` |
| **Ebook** | `featured`, `categories[]`, `isRecipe`, `recipeMeta`, `title`, `subtitle`, `author`, `delivery`, `pages`, `pdfUrl`, `pdfFileName`, `highlights[]`, `about`, `summary[]`, `tip`, `tags[]`, `createdAt` |
| **Email** | `email`, `name?`, `source` (`newsletter` \| `account`), `createdAt` |
| **Questionnaire** | `profile`, `trimester?`, `goal`, `completedAt` |

Responses use dashboard field names (`id`, French `createdAt` labels). Passwords are never returned.

## Auth

| Method | Path | Notes |
|--------|------|--------|
| POST | `/user/register` | Public signup → `{ token, user }` + newsletter upsert (`account`) |
| POST | `/user/login` | → `{ token, user }` |
| GET | `/user/getcurrentuser` | Bearer JWT |
| GET/PATCH | `/user/profile` | Current user |
| GET/POST | `/user/` | Admin list / create |
| PATCH | `/user/:id` | Self or admin |
| DELETE | `/user/:id` | Admin |

Header: `Authorization: Bearer <token>`

## Content

| Resource | Public read | Admin write |
|----------|-------------|-------------|
| `/article` | GET list / `:id` | POST, PATCH, DELETE |
| `/ebook` | GET list / `:id` | POST, PATCH, DELETE |
| `/newsletter` or `/email` | POST subscribe | GET, PATCH, DELETE, GET `/export` |
| `/questionnaire` | POST submit | GET list (admin) |
| `/upload` | — | POST image/PDF (Cloudinary or data URL) |

All routes are also mounted under `/api/*`.

## Env

See `.env.example`. Mongo URI: `uri` / `MONGODB_URI` / `MONGO_URI`. JWT: `secretKey` / `JWT_SECRET` / `SECRET_KEY`.
