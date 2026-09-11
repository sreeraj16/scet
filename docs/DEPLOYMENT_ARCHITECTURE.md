# Deployment Architecture & Microservice Infrastructure - Swarnandhra WasteLoop Platform

## Overview
The Swarnandhra WasteLoop Platform is deployed using a decoupled microservice architecture consisting of a React Single Page Application (SPA), a Python AI FastAPI Service, a Node.js Email Server, and a Supabase PostgreSQL Database.

---

## Deployment Layout Diagram

```
 ┌──────────────────────────────────────────────────────────────────┐
 │               FRONTEND EDGE HOSTING (Vite + React)              │
 │ • Static Asset CDN (HTML/CSS/JS Bundle)                         │
 │ • Active Port: http://localhost:3004/                           │
 └───────────────┬──────────────────────────────────┬───────────────┘
                 │                                  │
                 ▼                                  ▼
 ┌─────────────────────────────┐    ┌──────────────────────────────┐
 │ PYTHON FASTAPI AI ENGINE    │    │ NODE.JS EMAIL MICROSERVICE   │
 │ • Uvicorn ASGI Server       │    │ • Express REST Server        │
 │ • Port: http://localhost:8001│    │ • Port: http://localhost:8000 │
 │ • ML ResNet50 Classifier    │    │ • Nodemailer Gmail SMTP      │
 └─────────────────────────────┘    └──────────────────────────────┘
                 │                                  │
                 └────────────────┬─────────────────┘
                                  │
                                  ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │              SUPABASE CLOUD POSTGRESQL DATABASE                  │
 │ • Realtime Subscriptions & Row Level Security (RLS)              │
 │ • Storage Buckets (Evidentiary Waste Photos)                     │
 └──────────────────────────────────────────────────────────────────┘
```

---

## Service Configuration

1. **Frontend Application**:
   - **Build Command**: `npm run build`
   - **Dev Command**: `npm run dev` (Port 3004)
2. **Python AI Engine (`backend_ai/`)**:
   - **Execution**: `python -m uvicorn main:app --port 8001`
   - **Dependencies**: `scikit-learn`, `joblib`, `fastapi`, `pillow`
3. **Email Server (`server/`)**:
   - **Execution**: `node server/emailServer.js` (Port 8000)
   - **Environment Variables**: `VITE_MAIL_USER`, `VITE_MAIL_APP_PASSWORD`
