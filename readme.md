# 📚 Readers Haven

Readers Haven is a full-stack web application for book lovers — allowing users to explore, review, and share their favorite reads within a simple, modern interface.  
The project uses **React + Vite** for the frontend, **Node.js + Express + MongoDB** for the backend, and **Docker + Kubernetes** for local orchestration on Docker Desktop.

---

## Features
- Browse and discover a curated book library
- Add, edit, and review books
- Email/password authentication (with password reset)
- Optional Google login
- React SPA with a clean, Goodreads-inspired UI
- API served through a single gateway

---

## Tech Stack
| Layer     | Technology                          |
|----------|--------------------------------------|
| Frontend | React, Vite, TailwindCSS            |
| Backend  | Node.js, Express                    |
| Services | Auth, Books, Orders, Inventory      |
| Database | MongoDB                             |
| Gateway  | Node.js reverse proxy               |
| DevOps   | Docker, Kubernetes (Docker Desktop) |

---

## Prerequisites

- **OS**: Windows (tested with Docker Desktop + Kubernetes)
- **Node.js**: v18+ (recommended)
- **Docker Desktop** with **Kubernetes** enabled
- **kubectl** in your `PATH`
- **PowerShell** (for the helper scripts)

---

## Environment & Secrets Overview

Most configuration is driven by environment variables and Kubernetes ConfigMaps/Secrets.

- **Root `.env`** (not committed)
  - Location: `./.env`
  - Example:

    ```bash
    JWT_SECRET=change-me-to-a-long-random-string
    FRONTEND_URL=http://localhost:32173
    OAUTH_CALLBACK_BASE=http://localhost

    # Optional – only if you want Google login
    GOOGLE_CLIENT_ID=your-google-oauth-client-id
    GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
    ```

- **Frontend env**
  - Location: `./frontend/.env.local`
  - Already present with sensible defaults:

    ```bash
    VITE_API_BASE=http://localhost/api
    VITE_UPLOADS_BASE=http://localhost
    ```

- **Kubernetes ConfigMap**
  - File: `k8s-manifests/config.yml` (first `ConfigMap` object)
  - Contains non‑secret config like:
    - `FRONTEND_URL`, `OAUTH_CALLBACK_BASE`
    - `VITE_API_BASE`, `BACKEND_URL`, service URLs, etc.
  - You usually do **not** need to edit this unless you change ports/hosts.

- **Kubernetes Secret (do NOT commit real values)**
  - In `k8s-manifests/config.yml` there is a `Secret` named `app-secrets` with **placeholder** values:

    ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: app-secrets
      namespace: readers-haven
    type: Opaque
    stringData:
      JWT_SECRET: "212da63c..."                  # example only
      GOOGLE_CLIENT_ID: "your-google-oauth-client-id"
      GOOGLE_CLIENT_SECRET: "your-google-oauth-client-secret"
    ```

  - For real deployments, create a **local, untracked** override file:

    `k8s-manifests/app-secrets.local.yml` (do not commit this file):

    ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: app-secrets
      namespace: readers-haven
    type: Opaque
    stringData:
      JWT_SECRET: "your-long-random-jwt-secret"
      GOOGLE_CLIENT_ID: "your-google-oauth-client-id"
      GOOGLE_CLIENT_SECRET: "your-google-oauth-client-secret"
      # Optional, normally provided by ConfigMap:
      # MONGO_URI: "mongodb://mongo:27017/readers-haven"
    ```

  - Apply it **after** deploying manifests:

    ```bash
    kubectl apply -f k8s-manifests/app-secrets.local.yml -n readers-haven
    ```

> ⚠️ Never commit real secrets (.env files or `app-secrets.local.yml`) to GitHub.

---

## Running the Stack with Kubernetes (Recommended)

This starts the **entire** application (frontend + all backend services + MongoDB).

1. **Clone the repository**

   ```bash
   git clone https://github.com/Aymane27-Rio/readers-haven.git
   cd readers-haven
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Create a simple root `.env` file**

   Minimal example:

   ```bash
   FRONTEND_URL=http://localhost:32173
   BACKEND_URL=http://localhost
   ```

   Google OAuth is optional; the app works without it.

4. **Start Docker Desktop (Kubernetes ON)**

5. **Build Docker images**

   From the repo root in PowerShell:

   ```bash
   ./build-images.ps1
   ```

6. **Deploy Kubernetes manifests**

   ```bash
   ./deploy-k8s.ps1
   # or:
   # kubectl apply -f k8s-manifests/
   ```

7. **Check that everything is running**

   ```bash
   kubectl get pods -n readers-haven
   ```

   All pods should show `Running`.

8. **Open the app**

   - Frontend: http://localhost:32173/
   - Gateway: http://localhost/

   The frontend uses the gateway for all API calls.

---

## Frontend-Only Development (Optional)

If someone wants to work **only on the UI** and you already have the K8s cluster up:

```bash
cd frontend
npm install   # if not done yet
npm run dev
```

Then open: http://localhost:5173

The Vite dev server proxies API calls directly to `http://localhost/api` (the gateway running in Kubernetes), so as long as the cluster is running, the frontend will behave like the real app.

---

## Useful Commands

- **Check pod status**

  ```bash
  kubectl get pods -n readers-haven
  ```

- **Restart all deployments**

  ```bash
  kubectl rollout restart deployment --all -n readers-haven
  ```

- **View logs for auth-service**

  ```bash
  kubectl logs deployment/auth-service -n readers-haven
  ```

---

## Notes

- Do not commit any `.env` files or `k8s-manifests/app-secrets.local.yml` containing real credentials.
- Google OAuth and reCAPTCHA are optional for local testing; email/password auth, signup, and password reset work without them.
- This README is focused on the **Docker Desktop + Kubernetes** path, which is the most consistent way to run the whole system locally.
