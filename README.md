# CRS: Campus Resource Scheduler

A full-stack Academic Event and Resource Booking Portal built with
**MongoDB, Express.js, React.js and Node.js (MERN)**.

## Features

- Role-based auth (JWT) for **Admin**, **Faculty**, and **Student**, each redirected to their own dashboard.
- **Admin**: create/manage rooms (name + capacity) and inventory resources (name + total count); view a live master schedule of every booking; approve or reject requests (rejection requires a reason); **Release Room** and **Release Resources** buttons that mark a booking `Completed`, instantly free the room's time slot, and restore equipment counts to inventory.
- **Faculty**: request a room and, optionally, specific equipment quantities.
- **Student**: request rooms only (no equipment access).
- Strict 3-slot room booking: `8:00 AM - 12:00 PM`, `1:00 PM - 5:00 PM`, `Full Day (8:00 AM - 5:00 PM)`, with dynamic conflict logic:
  - A booked half-day slot blocks Full Day and that half; the other half stays open.
  - A booked Full Day slot blocks everything for that room/date.
- Equipment inventory is deducted live across **overlapping slots** the moment a request is made (even while Pending), so remaining quantity is always accurate for every user.
- Clean, minimalist, responsive UI.

## Project Structure

```
crs/
├── backend/     Node.js + Express + MongoDB REST API
└── frontend/    React (Vite) client
```

## Prerequisites

- Node.js 18+ and npm
- A running MongoDB instance (free MongoDB Atlas cluster)

## 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your own values:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crs_campus_scheduler
JWT_SECRET=replace_this_with_a_long_random_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the API:

```bash
npm run dev      # nodemon (auto-restart)
# or
npm start        # plain node
```

The API runs at `http://localhost:5000/api` (health check: `GET /api/health`).

Optional — create a default Admin account (`admin@crs.edu` / `Admin@123`) instead of registering one manually:

```bash
npm run seed
```

## 2. Frontend Setup

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point at your backend:

```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## 3. Using the App

1. Go to `http://localhost:5173/register` and create an **Admin** account (or run `npm run seed` in the backend and log in with `admin@crs.edu` / `Admin@123`).
2. As Admin: add a few **Rooms** and **Resources** from their tabs.
3. Register a **Faculty** and/or **Student** account in a private/incognito window (or log out and back in).
4. As Faculty/Student: pick a date, choose an open room + slot, (Faculty only) add equipment quantities, and submit.
5. Back as Admin, open **Master Schedule** to **Approve**/**Reject** (with a reason) requests, and use **Release Room** / **Release Resources** once an event is over to free the slot and restore inventory.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend**: React 18, Vite, React Router, Axios, plain CSS (no UI framework)

## Notes

- Dates are handled as `YYYY-MM-DD` strings for simple, predictable comparisons.
- All slot-conflict and resource-availability logic lives in `backend/utils/slots.js` — a single source of truth used by both the room and resource availability endpoints and the booking-creation validator.
