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
| DevOps | Docker, Docker Compose |

---

##  Getting Started

###  Run Locally (Recommended for Development)

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then open: http://localhost:5173

**Backend**
```bash
docker-compose up --build
```

or

```bash
cd backend
npm start
```

### Run with Docker (Full setup but still in need of some work/refinements)

Uncomment the **frontend** service inside *docker-compose.yml* and then run
```bash
docker-compose up --build
```
Visit then: http://localhost:5173
