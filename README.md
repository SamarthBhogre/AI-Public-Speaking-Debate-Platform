# SpeakWell

SpeakWell is an AI-inspired public speaking and debate practice platform for students.

It helps learners practice speaking topics, work through debate rounds, review saved sessions, and track performance over time.

## Review 1 status

This version focuses on a functional frontend foundation and an easy-to-demonstrate student workflow.

Implemented:

- Responsive landing page
- Signup and login modal
- Local login persistence
- Student dashboard
- Speaking practice workflow
- Practice timer
- Typed transcript input
- Word counter
- Local session saving
- Multi-round debate workflow
- Debate response input
- Session history
- Dynamic analytics
- Profile view
- Toast notifications
- Light/dark visual mode
- Express API fallback endpoints
- PostgreSQL schema draft

Intentionally left out for this phase:

- Web Speech API
- External AI services
- Live PostgreSQL persistence
- JWT authentication
- Faculty and administrator roles
- Video, pronunciation, emotion, and audio analysis

## Technology

- React
- TypeScript
- Vite
- CSS
- Lucide React
- Node.js
- Express
- PostgreSQL schema preparation

## Getting started

### Requirements

- Node.js 18 or newer
- npm

### Install dependencies

```bash
npm install
```

### Start the frontend

```bash
npm run dev
```

Vite will provide a local development URL, normally:

```text
http://localhost:5173
```

### Start the backend fallback API

In a separate terminal:

```bash
npm run server
```

The API runs on:

```text
http://localhost:4000
```

Available demo endpoints:

- `GET /api/health`
- `POST /api/speaking/topic`
- `POST /api/speaking/evaluate`
- `POST /api/debate/respond`

## Available scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run server    # Start the Express fallback API
```

## Demo flow

1. Open the landing page.
2. Select **Get started**.
3. Create a local student account.
4. Open **Practice**.
5. Select **Use sample topic** or start with the default topic.
6. Start the timer and type a speaking response.
7. Save the session.
8. Open **History** to see the saved session.
9. Open **Analytics** to see updated scores.
10. Open **AI Debate**.
11. Choose **FOR** or **AGAINST**.
12. Complete three typed debate rounds.
13. Confirm that the debate appears in history and analytics.

## Project structure

```text
.
├── backend/
│   ├── schema.sql       # PostgreSQL tables and indexes
│   └── server.js        # Express fallback API
├── src/
│   ├── main.tsx         # React application and screens
│   └── styles.css       # Application styling
├── .env.example         # Environment variable reference
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Local data behavior

The current frontend stores the signed-in user and practice sessions in browser `localStorage`.

This makes the demo interactive without requiring database setup. Clearing browser storage resets the local account and saved sessions.

## PostgreSQL preparation

The schema is available at [`backend/schema.sql`](backend/schema.sql).

It defines the initial relational model for:

- Users
- Speaking sessions
- Speaking reports
- Debate sessions

The PostgreSQL connection and authenticated persistence are planned for the next backend phase.

## Environment variables

Copy `.env.example` to `.env` when configuring the backend:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/speakwell
JWT_SECRET=change-me
AI_API_KEY=
AI_MODEL=
```

The current phase does not require an AI key or database connection to run the frontend demo.

## Verification

Run the production build before submitting changes:

```bash
npm run build
```

## License

This project is an academic college project for Review 1 development and demonstration.
