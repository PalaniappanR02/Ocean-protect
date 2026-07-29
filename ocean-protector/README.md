# OceanGuard / Ocean Protect

OceanGuard is a South India coastal-hazard reporting and response MVP with three portals:

- **Citizen:** submit hazards, track reports, view public alerts/map, and queue reports offline.
- **Analyst:** review reports, inspect confidence evidence, update report status, and recalculate confidence.
- **Authority:** monitor reports and use the demonstration incident, alert, and response-team workflows.

## Current integration status

The main report workflow is connected to the live backend when `VITE_DATA_MODE=api`:

```text
Citizen report form
  -> React/Vite frontend
  -> Node/Express API
  -> FastAPI classifier
  -> PostgreSQL/PostGIS
  -> tracking page and analyst report screens
```

Live API-backed features:

- Create a report with an idempotent UUID.
- List/filter/paginate reports.
- Open a report by database ID.
- Find a report using its tracking ID.
- Read report-dashboard statistics.
- Verify or reject a report.
- Recalculate a report's confidence score.
- Display public verified reports on the citizen map.

The incident, public-alert, response-team, region, and social-signal frontend adapters still use demonstration data. Their backend modules remain available for the next integration phase.

## Run the complete project locally

### Docker method

Requirements: Docker Desktop with Docker Compose.

From the repository root:

```powershell
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`
- API health: `http://localhost:4000/health`
- Classifier: `http://localhost:8000`
- Classifier health: `http://localhost:8000/health`
- PostgreSQL/PostGIS: `localhost:5432`

The API container runs database migrations and one-time seed files before starting.

### Run services separately

Database and classifier can be started with Docker:

```powershell
docker compose up db classifier
```

Backend:

```powershell
cd backend\api
npm install
npm run migrate
npm run dev
```

Frontend, in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The included local frontend environment uses:

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_DATA_MODE=api
```

## Verify frontend-backend synchronization

1. Open `http://localhost:5173/citizen/report`.
2. Submit a report.
3. Open browser developer tools and select **Network -> Fetch/XHR**.
4. Confirm `POST http://localhost:4000/api/v1/reports` returns `201`.
5. Copy the returned tracking ID.
6. Refresh `/citizen/tracking/<TRACKING_ID>`.
7. Open `http://localhost:4000/api/v1/reports` and confirm the same report is present.

A report that remains after refresh and appears in the API response is stored in PostgreSQL rather than only in browser memory.

## Deploy to Render

A Render Blueprint is included at the repository root:

```text
render.yaml
```

Push this repository to GitHub, then create a **Blueprint** in Render and select the repository. The Blueprint defines:

- Render Postgres database
- Python classifier web service
- Node API web service
- React static site

Follow `RENDER_DEPLOYMENT.md` for deployment and verification steps.

## Checks

Classifier:

```powershell
cd backend\classifier
python -m pip install -r requirements.txt
$env:PYTHONPATH='.'
python -m pytest -q
```

Backend:

```powershell
cd backend\api
npm ci
npm run build
npm test
```

Frontend:

```powershell
cd frontend
npm install
npm run typecheck
npm run build
```

See `PROJECT_AUDIT.md` for the repairs, integration changes, validation results, and remaining work.
