# MINDGUARD AI

AI-Based Multi-Platform Mental Health Monitoring and Detection System — frontend and backend-ready structure for a final-year CSE project.

**Understand patterns. Support wellbeing.**

This release does **not** run NLP or machine-learning models. It does **not** invent risk scores, diagnoses, or suicidal classifications. The UI, consent flows, message pipeline, and REST service layer are ready for a Python Flask backend in the next stage.

## Disclaimer

This system is a research and early-risk screening tool based on textual patterns. It is not a medical diagnostic system and should not replace assessment by a qualified mental-health professional.

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS, shadcn-style UI, Lucide, Recharts, React Router
- Mock API in the browser (localStorage) until `VITE_API_BASE_URL` points at Flask

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

```bash
npm run build
```

## Architecture (future)

Frontend → REST API → Python Flask → NLP preprocessing → ML models (Naive Bayes, SVM, Random Forest, CNN) → analysis results → dashboard

## Connecting Flask later

1. Implement the endpoints listed in `src/services/*`.
2. Set `VITE_API_BASE_URL` in `.env` (see `.env.example`).
3. Keep OAuth tokens on the server. Never collect Instagram/WhatsApp/Telegram/Snapchat passwords.

Schema: `backend/schema.sql`  
Health stub: `backend/app.py`

## Demo data

Use **Load generic Demo Data** on Data Sources, or upload `public/sample-chat-export.json`. Rows are labeled **Demo Data**. They are generic placeholders, not clinical examples.
