# SmartDiagnosis — AI-Powered Symptom Checker

A full-stack medical diagnosis assistant that combines rule-based symptom parsing with Groq's LLaMA model to deliver structured, actionable health insights.

---

## Architecture Overview

```
SmartDiagnosis/
├── backend/                   # Node.js + Express + MongoDB
│   ├── server.js              # Entry point — cached DB connect, serverless handler
│   ├── vercel.json            # Vercel routing config — all requests → server.js
│   ├── src/
│   │   ├── app.js             # Express app, CORS, routes, error handler
│   │   ├── controllers/
│   │   │   └── diagnosisController.js   # Request/response orchestration
│   │   ├── models/
│   │   │   └── Diagnosis.js             # Mongoose schema
│   │   ├── routes/
│   │   │   └── diagnosisRoutes.js       # Route definitions + validation rules
│   │   ├── services/
│   │   │   ├── aiService.js             # Groq AI integration + fallback
│   │   │   └── symptomParser.js         # Rule-based parser + fallback engine
│   │   └── middleware/
│   │       └── errorHandler.js          # Centralised error formatting
│   └── .env                             # Your actual secrets (do not commit)
│
└── frontend/                  # React + Vite
    ├── vercel.json            # SPA routing fix — all routes → index.html
    ├── src/
    │   ├── App.jsx            # Router + AnimatePresence wrapper
    │   ├── pages/
    │   │   ├── Home.jsx       # Diagnosis flow
    │   │   └── History.jsx    # Paginated history
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── DiagnosisForm.jsx
    │   │   ├── ResultCard.jsx
    │   │   ├── HistoryList.jsx
    │   │   └── LoadingAnimation.jsx  # GSAP animations
    │   ├── services/
    │   │   └── api.js         # Axios wrapper
    │   └── index.css          # Design system + component styles
    └── .env                   # Your actual frontend env (do not commit)
```

### Architecture Decisions

| Decision | Rationale |
|---|---|
| MVC pattern | Separates concerns — routes → controllers → services → models |
| Layered diagnosis | Rule-based first (fast, free), Groq AI second (rich output) |
| Fallback strategy | If Groq fails or key is missing, rule engine serves the response |
| Paginated history | Prevents unbounded DB reads; default page size = 10 |
| AnimatePresence | Enables exit animations on route changes |
| GSAP in loading | GSAP provides fine-grained, timeline-based control for the processing UX |

---

## AI Integration Approach

The diagnosis pipeline has two stages:

### Stage 1 — Rule-Based Preprocessing (`symptomParser.js`)
- Normalizes raw input: splits on commas/semicolons, lowercases, applies alias map (`"high temp"` → `"fever"`)
- Scores 10+ condition templates against parsed symptoms
- Each template has `requiredSymptoms` (heavy weight) and `relatedSymptoms` (light weight)
- Produces a ranked shortlist of 2–3 conditions with probability scores

### Stage 2 — Groq AI Enhancement (`aiService.js`)
- Uses **Groq API** with `llama-3.3-70b-versatile` model for fast, structured responses
- Sends both the raw symptoms string and the parsed tokens to the model
- Uses `response_format: { type: "json_object" }` to guarantee structured JSON output
- Validates and sanitizes each field before persisting
- If the `GROQ_API_KEY` is missing, the call is skipped entirely
- If the API call throws (rate limit, network error, etc.), falls back to Stage 1 result

This hybrid approach means the system is always usable, even without an API key.

---

## API Endpoints

### `POST /api/diagnose`

Submit symptoms and receive a diagnosis.

**Request:**
```json
{
  "symptoms": "fever, cough, chest pain"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "667abc123def456",
    "symptoms": "fever, cough, chest pain",
    "parsedSymptoms": ["fever", "cough", "chest pain"],
    "conditions": [
      {
        "name": "Pneumonia",
        "probability": 72,
        "description": "An infection that inflames the air sacs in one or both lungs.",
        "nextSteps": ["Chest X-ray", "Blood tests (CBC, CRP)", "Immediate medical consultation"],
        "doctorType": "Pulmonologist / General Practitioner",
        "urgency": "high"
      },
      {
        "name": "COVID-19",
        "probability": 58,
        "description": "An infectious disease caused by the SARS-CoV-2 virus.",
        "nextSteps": ["COVID-19 PCR or rapid antigen test", "Self-isolate while awaiting results"],
        "doctorType": "General Practitioner / Infectious Disease Specialist",
        "urgency": "moderate"
      }
    ],
    "disclaimer": "This is not a substitute for professional medical advice.",
    "aiGenerated": true,
    "processingTime": 1432,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### `GET /api/history`

Retrieve paginated diagnosis history.

**Query params:** `page` (default: 1), `limit` (default: 10, max: 50)

**Request:**
```
GET /api/history?page=1&limit=5
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "diagnoses": [ /* array of diagnosis objects */ ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 23,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### `GET /api/history/:id`

Retrieve a single diagnosis.

### `DELETE /api/history/:id`

Delete a single diagnosis record.

### `GET /health`

Health check endpoint.

```json
{ "status": "ok", "timestamp": "2025-01-15T10:30:00.000Z" }
```

---

## Running Locally

### Prerequisites
- Node.js ≥ 18
- MongoDB (local instance or MongoDB Atlas URI)
- Groq API key — free at [console.groq.com](https://console.groq.com) (optional — falls back to rule-based if absent)

### 1. Clone & install

```bash
git clone <repo-url>
cd SmartDiagnosis

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

**Backend** — create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/smart-diagnosis
GROQ_API_KEY=gsk_your_groq_api_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend** — `frontend/.env` already exists with:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Get your Groq API key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign in → **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_`) and paste it into `backend/.env`

> Groq is **free** with generous rate limits. No credit card required.

### 4. Start development servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

The frontend `.env` points directly to `http://localhost:5000/api`.

---

## Deployment

### Backend — Vercel

1. Push code to GitHub
2. Import the repo on [vercel.com](https://vercel.com) → set **Root Directory** to `backend`
3. Set start command: `node server.js`
4. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=mongodb+srv://...`
   - `GROQ_API_KEY=gsk_...`
   - `ALLOWED_ORIGINS=https://your-frontend.vercel.app` (no trailing slash)
5. `vercel.json` in `backend/` handles all routing automatically

> **MongoDB Atlas:** Go to Network Access → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel's dynamic IPs can connect.

> **Serverless note:** `server.js` caches the MongoDB connection with an `isConnected` flag to prevent timeout errors on cold starts.

### Frontend — Vercel

1. Import the same repo → set **Root Directory** to `frontend`
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable:
   - `VITE_API_URL=https://your-backend.vercel.app/api`
5. `vercel.json` in `frontend/` rewrites all routes to `index.html` so React Router works correctly on direct URL access (e.g. `/history`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 18+ |
| Backend framework | Express 4 |
| Database | MongoDB + Mongoose |
| Input validation | express-validator |
| AI | Groq API — LLaMA 3.3 70B Versatile |
| Frontend framework | React 18 |
| Bundler | Vite 5 |
| Routing | React Router v6 |
| Page animations | Framer Motion |
| Loading animations | GSAP |
| HTTP client | Axios |

---

## Disclaimer

This application is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with questions about your health.
