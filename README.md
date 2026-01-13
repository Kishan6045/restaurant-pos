# Restaurant POS System

This is a Restaurant Point of Sale system built using MERN stack.

## Features
- Admin dashboard
- Cashier order screen
- Kitchen order display
- Order management

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB

## How to Run
1. Install dependencies
2. Start backend server
3. Start frontend server

## Deploy (Docker)

### Prerequisites
- Docker + Docker Compose

### 1) Create `.env` (recommended)
Copy `.env.example` to `.env` and set the secrets.

### 2) Start (frontend + backend + MongoDB)
```bash
docker compose up -d --build
```

### 3) Open in browser
- Frontend: `http://<server-ip>/`
- Backend health: `http://<server-ip>/` (returns `Backend Running`)

### Notes
- The frontend proxies API requests (`/api/*`) to the backend via Nginx.
- You must set `JWT_SECRET` and `JWT_REFRESH_SECRET` for login to work.
- Cloudinary env vars are only needed if you use image upload features.
