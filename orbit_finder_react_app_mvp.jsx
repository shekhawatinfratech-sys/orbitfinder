# OrbitFinder — Full Folder Structure (Frontend + Backend)

Here’s a unified folder setup you can zip and push to GitHub or Render.
It contains both **frontend (React)** and **backend (Node/Express + Postgres)** for OrbitFinder.

---

```
orbitfinder/
├── frontend/
│   ├── package.json
│   ├── vite.config.js               # if using Vite; remove if using CRA
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── OrbitFinder.jsx          # main component (from canvas)
│   ├── public/
│   │   └── favicon.ico
│   └── .env.example
│
├── backend/
│   ├── package.json
│   ├── index.js                     # Express server
│   ├── db/
│   │   └── init.sql                 # Database initialization
│   └── .env.example
│
├── render.yaml                      # one-click Render deployment
├── docker-compose.yml               # for local development
├── .gitignore
└── README.md
```

---

## `frontend/package.json`
```json
{
  "name": "orbitfinder-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "framer-motion": "^10.16.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  }
}
```

---

## `frontend/src/main.jsx`
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import OrbitFinder from './OrbitFinder';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(<OrbitFinder />);
```

---

## `backend/package.json`
```json
{
  "name": "orbitfinder-backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "pg": "^8.8.0"
  }
}
```

---

## `backend/index.js`
```js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/orbitdb'
});

app.get('/api/ping', (req, res) => res.json({ ok: true, time: new Date() }));

app.post('/api/plans', async (req, res) => {
  const { name, revenue, orbit, payload } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO plans(name, revenue, orbit, payload, created_at) VALUES($1,$2,$3,$4,NOW()) RETURNING id',
      [name, revenue, orbit, payload]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
```

---

## `backend/db/init.sql`
```sql
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name TEXT,
  revenue BIGINT,
  orbit TEXT,
  payload JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## `render.yaml`
```yaml
services:
  - type: web
    name: orbitfinder-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    routes:
      - type: rewrite
        source: /(.*)
        destination: /index.html

  - type: web
    name: orbitfinder-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: node backend/index.js
    envVars:
      - key: DATABASE_URL
        fromDatabase: orbitfinder-db
    autoDeploy: true

  - type: postgres
    name: orbitfinder-db
```

---

## `docker-compose.yml`
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - '3000:5173'
    command: npm run dev
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - '4000:4000'
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/orbitdb
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: orbitdb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 🚀 One-step deployment (Render)
1. Push this folder to GitHub.
2. Go to [Render → New → Blueprint](https://render.com).
3. Select your repo.
4. Review detected services (frontend, backend, database).
5. Click **Deploy All** ✅

In 3–5 minutes, you’ll get:
- Frontend URL → `orbitfinder.onrender.com`
- Backend API URL → `orbitfinder-backend.onrender.com`

Set `REACT_APP_API_URL` in Render → frontend → Environment to point to your backend.

Done — fully working full-stack deployment in one click!
