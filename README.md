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
1. From repo root: `npm install` (root `concurrently`), then `cd backend && npm install` and `cd frontend && npm install`.
2. Configure `frontend/.env`: set `VITE_API_URL` to your API base (default `http://localhost:5000`).
3. Configure `backend/.env` for MongoDB and secrets.
4. From root: `npm run dev` starts backend and frontend together. Or run `npm run backend` and `npm run frontend` in separate terminals.
