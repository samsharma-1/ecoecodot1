# EcoTrack AI: Carbon Footprint Assistant

EcoTrack AI helps users log everyday activities, calculate kg CO2e impact, understand their biggest emission sources, and get practical reduction advice from an AI-style sustainability coach.

## Problem Statement

Most people do not get immediate feedback on how daily choices affect their carbon footprint. EcoTrack AI turns transport, energy, diet, and waste activity into measurable emissions, then converts that data into scorecards, trends, goals, achievements, and personalized recommendations.

## Features

- Activity logging for transport, energy, diet, and waste.
- Category-specific CO2e calculation factors.
- Dashboard with total emissions, carbon score, category breakdown, daily trend, monthly projection, top recommendation, goal tracking, and achievements.
- Eco AI Coach with conversation history, deterministic sustainability guidance, and optional OpenAI integration through `OPENAI_API_KEY`.
- Production-ready single-service deployment for Google Cloud Run.
- Input validation, parameterized SQLite queries, API rate limiting, CORS controls, and security headers.
- Backend API tests for calculation, validation, summary insights, and chat fallback.

## Architecture

```text
React + Vite frontend
        |
        | /api/*
        v
Node.js + Express API
        |
        v
SQLite activity and emissions database
        |
        v
Insights engine + optional OpenAI chat completion
```

In production, Express serves the built Vite frontend and the API from one Cloud Run container.

## Local Development

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

The frontend dev server runs at `http://localhost:5173` and proxies API calls by using `VITE_API_BASE_URL` when needed. By default, production uses same-origin `/api/*` routes.

## Environment Variables

Backend:

- `PORT`: server port. Cloud Run sets this automatically.
- `DB_PATH`: SQLite database path. Defaults to `backend/ecotrack.sqlite`.
- `CORS_ORIGIN`: allowed browser origin. Defaults to local Vite origin in development and same-origin in production.
- `RATE_LIMIT_PER_MINUTE`: per-IP API limit. Defaults to `90`.
- `MONTHLY_GOAL_KG`: monthly footprint goal. Defaults to `120`.
- `OPENAI_API_KEY`: optional key for real LLM chat responses.
- `OPENAI_MODEL`: optional OpenAI chat model. Defaults to `gpt-4o-mini`.

Frontend:

- `VITE_API_BASE_URL`: optional API origin for local split-server development.

## Testing

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Google Cloud Run Deployment

The repository includes a root `Dockerfile` that builds the Vite frontend and runs the Express backend as a single production service.

Set your Google Cloud project:

```bash
gcloud config set project YOUR_PROJECT_ID
```

Deploy:

```bash
gcloud run deploy ecotrack-ai \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,RATE_LIMIT_PER_MINUTE=120,MONTHLY_GOAL_KG=120
```

With OpenAI enabled:

```bash
gcloud run services update ecotrack-ai \
  --region asia-south1 \
  --set-env-vars OPENAI_API_KEY=YOUR_KEY,OPENAI_MODEL=gpt-4o-mini
```

For a hackathon demo, the default SQLite file is acceptable. For durable production data, mount a managed database or Cloud SQL-backed storage instead of relying on container-local SQLite.

## API

- `GET /api/health`: service health.
- `POST /api/activities`: log an activity.
- `GET /api/emissions`: daily emission totals.
- `GET /api/summary`: activities, emissions, insights, goals, achievements.
- `POST /api/chat`: Eco AI Coach response.

## PromptWars Readiness

- Real-world usability: personalized dashboard and reduction plan.
- AI design: optional LLM integration with a strong deterministic fallback.
- Security: validation, rate limiting, secure headers, parameterized queries.
- Testing: focused backend coverage and clean frontend lint/build.
- Deployment: Cloud Run-ready container configuration.
