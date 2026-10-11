# SafeRoute 🛡️

**SafeRoute** is an intelligent, safety-first urban navigation and emergency broadcast platform designed to provide safe travel routes for women and pedestrians by analyzing real-time spatial hazards, street illumination, and crowd reports.

---

## 🌟 Key Features

- **Dynamic Route Optimization**: Queries OpenStreetMap (OSRM) and applies custom spatial penalty scoring against high-risk areas stored in MySQL Spatial tables (`ST_Distance`, SRID 4326).
- **Address Search & Drop-Pin Navigation**: Google Maps-style autocomplete address search powered by OpenStreetMap Nominatim, plus live GPS and click-to-pin destination selection.
- **Guardian Mode & Live SOS**: Real-time GPS telemetry streaming and emergency distress broadcasts over WebSockets (Flask-SocketIO).
- **Community Hazard & Civic Reporting**: Citizen crowd-sourcing for reporting poorly lit alleys, broken street infrastructure, and suspicious activity.
- **Offline Resilient PWA**: Built with Vite and Workbox service workers to cache routes and map tiles when network connectivity drops.

---

## 🏗️ Architecture

- **Frontend**: React 18, Vite, React-Leaflet, OpenStreetMap, Zustand, WebSockets.
- **Backend**: Python 3.11+, Flask, Flask-SocketIO, SQLAlchemy, GeoAlchemy2, PyJWT.
- **Database**: MySQL 8.0+ with Spatial Extensions.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- MySQL 8.0+ (running locally)

### 2. Backend Setup
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   python -m venv .venv
   # On Windows:
   .\.venv\Scripts\activate
   # On Linux/macOS:
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your MySQL credentials:
   ```bash
   cp .env.example .env
   ```
4. Start the backend server:
   ```bash
   python run.py
   ```
   *The server runs on `http://127.0.0.1:5000`.*

### 3. Frontend Setup
1. Open a terminal in the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   *The client runs on `http://localhost:5173`.*

---

## 📂 Project Structure

```text
Mini_project_sem_3/
├── backend/
│   ├── blueprints/         # Modular route controllers (auth, civic, hazards, routing)
│   ├── services/           # Route engine and penalty algorithms
│   ├── config.py           # App configuration
│   ├── extensions.py       # SQLAlchemy, SocketIO instances
│   ├── factory.py          # Flask Application Factory
│   ├── model.py            # Spatial DB models (User, Hazard, CivicTicket)
│   ├── requirements.txt    # Python dependencies
│   ├── run.py              # Main backend entry point
│   └── sockets.py          # Real-time WebSocket event listeners
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (AddressAutocomplete)
│   │   ├── services/       # API & Socket client bridges
│   │   ├── store/          # Zustand global state
│   │   ├── HomePage.jsx    # Landing page
│   │   ├── Login.jsx       # User authentication
│   │   ├── MapDashboard.jsx# Core interactive safety map
│   │   └── ReportPage.jsx  # Hazard & incident reporting
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔒 Security Note
Never commit the `.env` file containing sensitive database credentials to GitHub. A template `.env.example` has been provided for reference.

