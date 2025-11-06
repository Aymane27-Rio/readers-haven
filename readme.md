# 📚 Readers Haven

Readers Haven is a full‑stack web application for book lovers — explore, review, and share your favorite reads within a vibrant community.

Built with **React + Vite** on the frontend, **Node.js + Express + MongoDB** on the backend, and an **API Gateway** for routing and composition.

---

## Features
- Discover and browse a curated library of books
- Add, edit, and review your favorite titles
- Secure backend API powered by Node.js & Express
- API Gateway with JWT verification and proxying
- Seamless frontend experience built with React + Vite
- Docker Compose for local dev and integration

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TailwindCSS |
| API Gateway | Node.js, Express, http-proxy-middleware |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| DevOps | Docker, Docker Compose |

---

Note: Prefer the latest active LTS of Node.js.

## Getting Started

### Environment variables

- Backend: create `backend/.env`
```bash
MONGO_URI=mongodb://localhost:27017/readers-haven
JWT_SECRET=dev-secret-change-me
FRONTEND_URL=http://localhost:5173
PORT=5000
```

- API Gateway: create `backend/gateway/.env`
```bash
GATEWAY_PORT=8080
BACKEND_URL=http://localhost:5000
# Optional microservices (fallback to BACKEND_URL if not set)
ORDER_URL=http://localhost:7001
INVENTORY_URL=http://localhost:7002
BOOKS_URL=http://localhost:7003
QUOTES_URL=http://localhost:7004
JWT_SECRET=dev-secret-change-me
FRONTEND_URL=http://localhost:5173
PROXY_TIMEOUT_MS=6000
PROXY_RETRIES=2
```

- Frontend (Vite): create `frontend/.env.local`
```bash
VITE_API_BASE=http://localhost:8080
VITE_UPLOADS_BASE=http://localhost:5000
```

### Run locally (recommended for development)

Open three terminals:

1) Backend API
```bash
cd backend
npm install
npm start
```

2) API Gateway
```bash
cd backend/gateway
npm install
npm start
```

3) Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open: http://localhost:5173

Default local ports:
- Frontend: 5173
- Gateway: 8080
- Backend: 5000
- MongoDB: 27017
- Microservices: 7001 (orders), 7002 (inventory), 7003 (books), 7004 (quotes)

### API via Gateway (dev)
- `POST /auth/*` → backend `/api/auth/*`
- `GET/POST /users/*` → backend `/api/profile/*` (JWT)
- `GET/POST /books/*` → books service or backend `/api/books/*` (JWT)
- `GET/POST /quotes/*` → quotes service or backend `/api/quotes/*` (JWT)
- `GET/POST /orders/*`, `/inventory/*` → microservices (JWT)

### Run with Docker

Start the full stack (MongoDB, backend, microservices, gateway, frontend):
```bash
docker-compose up --build
```

Visit: http://localhost:5173

