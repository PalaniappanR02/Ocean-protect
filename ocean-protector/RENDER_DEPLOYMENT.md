# OceanGuard Render Deployment

This repository includes `render.yaml`, so the database, classifier, Node API,
and React static site can be created together as a Render Blueprint.

## 1. Push to GitHub

From this project root:

```powershell
git init
git add .
git commit -m "Prepare OceanGuard for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ocean-protect.git
git push -u origin main
```

## 2. Create the Render Blueprint

1. Open the Render dashboard.
2. Select **New → Blueprint**.
3. Connect the GitHub repository.
4. Render reads `render.yaml` and creates:
   - `oceanguard-db`
   - `oceanguard-classifier`
   - `oceanguard-api`
   - `oceanguard-frontend`
5. Confirm the Blueprint deployment.

The API runs migrations and one-time seed files automatically before starting. The Blueprint also wires the API and frontend using each service's Render-assigned external URL, so you do not need to hardcode hostnames.

## 3. Verify the deployment

Open these URLs after deployment:

```text
https://oceanguard-classifier.onrender.com/health
https://oceanguard-api.onrender.com/health
https://oceanguard-api.onrender.com/api/v1/reports
https://oceanguard-frontend.onrender.com/citizen/report
```

Render can add a suffix to a service name when the preferred hostname is already
taken. Use the exact URLs shown in your Render dashboard.

## 4. Test frontend-to-backend synchronization

1. Open the deployed citizen report page.
2. Share a browser location and submit a report.
3. In browser developer tools, open **Network → Fetch/XHR**.
4. Confirm `POST /api/v1/reports` returns `201`.
5. Copy the returned tracking ID.
6. Refresh `/citizen/tracking/<TRACKING_ID>`.
7. Open the deployed API's `/api/v1/reports` endpoint and confirm the report is present.

## CORS configuration

The Blueprint copies the frontend's Render-assigned `RENDER_EXTERNAL_URL` into the API's `CORS_ORIGIN`. `ALLOW_RENDER_ORIGINS` remains disabled, so the deployed API is restricted to the exact static-site origin plus the local development allow list.
