# 📚 Readers Haven

Readers Haven is a full-stack web application for book lovers — allowing users to explore, review, and share their favorite reads within a vibrant community.  
Built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend.

---

##  Features
- Discover and browse a curated library of books
- Add, edit, and review your favorite titles
- Secure backend API powered by Node.js & Express
- Seamless frontend experience built with React + Vite
- Ready-to-use Docker setup for deployment

---

##  Tech Stack
| Layer | Technology |
|-------|-------------|
| Frontend | React, Vite, TailwindCSS |
| Backend | Node.js, Express |
| Database | MongoDB |
| DevOps | Docker, Kubernetes (Docker Desktop) |

---

*Note*: It's preferable to have the latest **Node** version installed.

##  Getting Started

###  Run Locally (Recommended for Development)

Set two **.env** files. One in the *gateway* folder with the following content:

```bash
PORT=5000
AUTH_SERVICE_URL=http://localhost:4000
BOOKS_SERVICE_URL=http://localhost:4001
JWT_SECRET=
VITE_API_URL=http://localhost:5000/api
```

And the other in the *backend* folder with the following content:

```bash
MONGO_URI=
JWT_SECRET=
PORT=5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then open: http://localhost:5173

**Backend (via Kubernetes)**

See the section below for running all backend services on Kubernetes.

### Run with Kubernetes (Docker Desktop)

```bash
# from repo root
./build-images.ps1    # PowerShell; or run the docker build commands manually
kubectl apply -k k8s/overlays/dev
kubectl get pods -n readers-haven
```

- Gateway: http://localhost/
- Frontend: http://localhost:32173/ (NodePort) or http://frontend.localhost/ (Ingress + hosts entry)
