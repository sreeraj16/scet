# WasteLoop — Technical Architecture & Implementation Blueprint

## 1. Architectural Overview
WasteLoop is architected as an intelligent full-stack circular economy platform combining reactive frontend web interfaces, a distributed PostgreSQL database backed by Supabase, and a Python-based ML microservice for waste forecasting and image analysis.

```
                      +----------------------------------+
                      |       React 18 + Vite SPA        |
                      |  (Tailwind CSS, Recharts, Lucide)|
                      +----------------------------------+
                                  |           |
            REST API & Realtime Sub |           | HTTP POST
                                  v           v
          +-------------------------------+  +-----------------------------+
          |     Supabase Backend Engine   |  | Python ML FastAPI Service   |
          |  - Auth (OAuth 2.0 / JWT)     |  | (backend_ai/main.py)        |
          |  - PostgreSQL DB + RLS        |  | - Scikit-learn / TensorFlow |
          |  - Realtime Subscriptions     |  | - OpenCV Image Quality      |
          +-------------------------------+  +-----------------------------+
```

---

## 2. Technology Stack & Dependencies

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI Framework** | React 18, Vite 5, TypeScript |
| **Styling & Theme Engine** | Tailwind CSS v3, Custom CSS Variables (Eco Light & Cyberpunk Dark modes) |
| **State & Auth Context** | React Context (`AuthContext`), LocalStorage Persistence Sync |
| **Icons & Visuals** | Lucide React, Canvas Confetti |
| **Charts & GIS Maps** | Recharts v2, Leaflet v1.9, React Leaflet v4 |
| **QR Code & Printing** | `qrcode.react` (Local SVG rendering), Custom DOM Print Stylesheet |
| **Backend & Database** | Supabase JS Client (`@supabase/supabase-js`), PostgreSQL SQL Schema |
| **AI / ML Microservice** | Python 3.10+, FastAPI, Scikit-Learn, Pandas, NumPy |

---

## 3. Database Schema & Supabase RLS Structure

### Key Database Tables

1. `profiles`
   - `id` (UUID, Primary Key, Foreign Key -> `auth.users`)
   - `email` (TEXT), `full_name` (TEXT), `role` (TEXT), `org_type` (TEXT), `created_at` (TIMESTAMPTZ)

2. `wl_smart_bins`
   - `id` (UUID, PK), `bin_code` (TEXT), `location_name` (TEXT), `latitude` (FLOAT), `longitude` (FLOAT), `fill_level` (INT), `status` (TEXT), `last_emptied` (TIMESTAMPTZ)

3. `wl_schedules`
   - `id` (UUID, PK), `user_id` (UUID, FK -> `profiles`), `frequency` (TEXT), `waste_type` (TEXT), `pickup_time` (TEXT), `days_of_week` (TEXT[]), `status` (TEXT)

4. `wl_collections`
   - `id` (UUID, PK), `schedule_id` (UUID, FK), `collector_id` (UUID, FK), `status` (TEXT), `purity_grade` (TEXT), `weight_kg` (FLOAT), `collected_at` (TIMESTAMPTZ)

5. `wl_incidents`
   - `id` (UUID, PK), `reporter_id` (UUID, FK), `issue_type` (TEXT), `description` (TEXT), `photo_url` (TEXT), `latitude` (FLOAT), `longitude` (FLOAT), `status` (TEXT), `urgency` (TEXT)

6. `wl_recycling_batches`
   - `id` (UUID, PK), `batch_code` (TEXT), `material_type` (TEXT), `weight_kg` (FLOAT), `purity_grade` (TEXT), `status` (TEXT), `recycler_id` (UUID, FK)

---

## 4. Machine Learning Pipeline (`backend_ai/`)

### Microservice Endpoints
- **`GET /health`**: Microservice status check and ML model version readout.
- **`POST /predict-waste`**: Accepts historical collection data (zonal ID, day of week, weather condition) and returns XGBoost volume predictions for 7-day windows.
- **`POST /classify-waste-image`**: Accepts image file or base64 string, evaluates image purity, and provides automated segregation labels (`DECOMPOSE`, `DISPOSE`, `RECOVER`, `RECYCLE`).

### Dataset Structure
Dataset located at `backend_ai/dataset/`:
- `DECOMPOSE/`: Organic waste, food scraps, yard trimmings.
- `DISPOSE/`: Non-recyclable sanitary/inert municipal solid waste.
- `RECOVER/`: High-calorific refuse-derived fuel materials.
- `RECYCLE/`: PET plastics, HDPE bottles, clean paper, metal cans.

---

## 5. Offline Fallback & Data Synchronization Strategy

1. **Dual-Layer Persistence**:
   - Primary state attempts direct async mutations against Supabase tables.
   - If network disconnects or API credentials are in local mock mode, mutations fallback seamlessly to `localStorage` state adapters (`WL_SCHEDULES`, `WL_COLLECTIONS`, `WL_INCIDENTS`).

2. **Realtime Broadcast Events**:
   - Supabase Realtime listens to `INSERT` and `UPDATE` postgres changes on `wl_smart_bins` and `wl_collections` to push immediate notifications to active supervisor and collector viewports.
