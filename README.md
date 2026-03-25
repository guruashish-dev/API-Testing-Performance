# Advanced API Testing & Monitoring Dashboard

Production-style SaaS dashboard for testing and monitoring APIs with analytics, history tracking, slow API alerts, and optional scheduled auto-testing.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + Recharts + Axios
- Backend: Node.js + Express + Mongoose + Axios
- Database: MongoDB

## Project Structure

```
backend/
  controllers/
  models/
  routes/
  services/
  utils/
  server.js
frontend/
  src/
    components/
    context/
    pages/
    services/
    styles/
  App.jsx
```

## Backend Setup
1. Navigate to `backend`
2. Install dependencies
3. Create `.env` from `.env.example`
4. Run server

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Frontend Setup
1. Navigate to `frontend`
2. Install dependencies
3. Create `.env` from `.env.example`
4. Run Vite app

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Required Backend Endpoints
- `POST /api/test-api` - test API and store result
- `GET /api/history` - fetch test history with optional filters
- `GET /api/analytics` - fetch aggregated dashboard analytics
- `POST /api/monitored-apis` - add monitored API and auto-trigger initial test

## Auto Trigger Testing
- New monitored APIs are auto-tested immediately.
- Scheduled interval tests can be enabled via `AUTO_TEST_INTERVAL_SECONDS` in backend `.env`.
  - Example: `AUTO_TEST_INTERVAL_SECONDS=60` for a one-minute interval.

## Notes
- Slow APIs are flagged when response time is greater than 1000ms.
- API base URL is configurable via `VITE_API_BASE_URL`.
- UI includes loading states, toasts, JSON syntax highlighting, and response copy feature.
