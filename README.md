# SpeakWell

SpeakWell is a student practice platform for public speaking and structured debate. Students can practice with a typed response or browser speech recognition, receive a structured evaluation, save reports, and review progress.

## Current functionality

- Student signup and login with bcrypt password hashing
- JWT authentication in an HTTP-only cookie
- PostgreSQL-backed users, sessions, rounds, reports, history, and analytics
- Speaking topics by category and difficulty
- Speaking timer, transcript editing, word count, and Web Speech API where supported
- Three-round debate sessions with typed or spoken responses
- Configurable server-side OpenRouter service with a local fallback
- Speaking and debate reports
- Database-driven history and analytics
- Responsive SpeakWell interface and dark mode

Speech recognition depends on browser support and microphone permission. Typed transcript entry remains available as a fallback. AI requests are made by the backend only; when no API key is configured or a provider request fails, the fallback service keeps the workflow available.

## Technology

- Frontend: React, TypeScript, Vite, CSS, Lucide React, Recharts
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Validation: Zod
- Password hashing: bcryptjs
- Authentication: JWT in HTTP-only cookie

## Requirements

- Node.js 18 or newer
- npm
- PostgreSQL 13 or newer

## Setup

Install frontend dependencies from the project root with `npm install`.

Install backend dependencies with `npm run install:backend`.

Create a PostgreSQL database named `speakwell`. Copy `.env.example` to `.env`, then set `DATABASE_URL` and a private `JWT_SECRET` of at least eight characters.

Example environment values:

- `PORT=4000`
- `DATABASE_URL=postgresql://postgres:your-password@localhost:5432/speakwell`
- `JWT_SECRET=use-a-long-random-secret`
- `CLIENT_URL=http://localhost:5173`
- `OPENROUTER_API_KEY=`
- `OPENROUTER_SITE_URL=http://localhost:5173` (optional OpenRouter attribution)
- `OPENROUTER_APP_NAME=SpeakWell` (optional OpenRouter attribution)
- `AI_MODEL=`

The backend applies pending migrations at startup. Migration files are in `backend/src/database/migrations`.

## Run locally

Start the API in one terminal using `npm run server`.

Start the frontend in another terminal using `npm run dev`.

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:4000`.

Set `OPENROUTER_API_KEY` and `AI_MODEL` to an OpenRouter model slug (for example, one listed in your OpenRouter account) to enable AI features. The key is used only by the backend and must never be placed in frontend environment variables. With no provider key/model—or if an AI request fails—SpeakWell uses its built-in fallback service.

## Build

Run `npm run build` to type-check and build the frontend, then type-check and build the backend.

## API endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Speaking

- `POST /api/speaking/topic`
- `POST /api/speaking/session`
- `POST /api/speaking/evaluate`
- `GET /api/speaking/history`
- `GET /api/speaking/:id`

Creating a speaking session also evaluates it and stores the report.

### Debate

- `POST /api/debate/topic`
- `POST /api/debate/session`
- `POST /api/debate/respond`
- `POST /api/debate/evaluate`
- `GET /api/debate/history`
- `GET /api/debate/:id`

### Analytics

- `GET /api/analytics/overview`
- `GET /api/analytics/speaking`
- `GET /api/analytics/debate`
- `GET /api/analytics/streak`

### Health

- `GET /api/health`

Protected routes require the authentication cookie. Session queries are scoped to the authenticated user's ID.

## Database model

Migrations create `users`, `speaking_sessions`, `speaking_reports`, `debate_sessions`, `debate_rounds`, and `debate_reports`.

The consolidated reference schema is in `backend/schema.sql`. Ordered migration files are the source used by the application at startup.

## Demo flow

1. Create an account and sign in.
2. Generate a speaking topic.
3. Start the timer and speak if browser recognition is supported, or type a response.
4. Submit the session and view its evaluation.
5. Complete three debate rounds.
6. View the debate evaluation.
7. Open history and analytics to see database-backed results.

## Project structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/migrations/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   ├── schema.sql
│   └── package.json
└── src/
    ├── components/
    ├── hooks/
    ├── lib/
    ├── pages/
    ├── services/
    ├── types/
    └── styles.css
```

## Current scope limits

- Student accounts only; faculty and admin workflows are not included.
- Speech recognition uses the browser Web Speech API and varies by browser.
- Fallback evaluations provide basic heuristic feedback, not expert linguistic assessment.
- OpenRouter integration is optional and requires a server-side API key.
- The platform does not provide pronunciation, emotion, video, or advanced audio analysis.
