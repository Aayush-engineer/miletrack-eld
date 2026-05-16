# 🚛 miletrack ELD — Interstate Trip Planner

A full-stack web application for interstate truck drivers that generates FMCSA-compliant Hours of Service (HOS) schedules and pixel-perfect Electronic Logging Device (ELD) log sheets.

---

## 📸 Features

- **Interactive Route Map** — Leaflet.js + OpenStreetMap with markers for all stops, rest periods, and fuel stops
- **FMCSA HOS Compliance Engine** — enforces all rules from 49 CFR Part 395 (April 2022 FMCSA Guide)
- **Auto-Generated ELD Log Sheets** — pixel-perfect Driver's Daily Log sheets on HTML5 Canvas, one per 24-hour period
- **Download as PNG** — each log sheet can be saved individually
- **No API Keys Required** — uses Nominatim (geocoding), OSRM (routing), and OpenStreetMap (tiles)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11+ · Django 4.2 · Django REST Framework |
| Frontend | React 18 · Vite · TailwindCSS 3 |
| Maps | Leaflet.js · OpenStreetMap tiles |
| Routing | OSRM public API (free) |
| Geocoding | Nominatim / OpenStreetMap (free) |
| Log Drawing | HTML5 Canvas API |
| Database | SQLite (dev) · PostgreSQL-ready (prod) |
| Hosting | Vercel (frontend) · Render (backend) |

---

## ⏱ HOS Rules Implemented

All rules from 49 CFR Part 395, April 2022 FMCSA Interstate Driver's Guide to Hours of Service:

| Rule | Regulation | Description |
|---|---|---|
| **11-Hour Driving Limit** | §395.3(a)(3) | Max 11 hours of driving after 10 consecutive hours off duty |
| **14-Hour Driving Window** | §395.3(a)(2) | All driving must occur within a 14-hour window from when duty begins; off-duty time does NOT pause the clock |
| **30-Minute Rest Break** | §395.3(a)(3)(ii) | Required after 8 cumulative hours of driving since last 30-min consecutive break |
| **70-Hour / 8-Day Limit** | §395.3(b) | Cannot drive after accumulating 70 hours on-duty in any rolling 8-day period |
| **34-Hour Restart** | §395.3(c)(1) | Optional: 34+ consecutive off-duty hours resets the 70-hour cycle clock |
| **10-Hour Off-Duty Reset** | §395.3(a) | After hitting 11-hr limit or 14-hr window, must take 10 consecutive hours off |
| **Fueling** | Operational | 30-min on-duty not driving stop inserted every 1,000 miles |
| **Pickup/Dropoff** | Operational | 1 hour on-duty not driving at pickup and dropoff locations |

**Hard-coded assumptions:**
- Property-carrying driver, interstate commerce
- 70-hour/8-day cycle (not 60/7)
- No adverse driving conditions exception
- No sleeper berth splits (simple 10-hour off-duty blocks)
- Average speed: 55 mph
- Trip starts at 06:00 after a fresh 10-hour off-duty period

---

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Git**

---

## 🚀 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/miletrack-eld.git
cd miletrack-eld
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set DJANGO_SECRET_KEY to any random string
python manage.py migrate
python manage.py runserver      # Runs at http://localhost:8000
```

**Test the backend:**
```bash
python manage.py test trip.tests
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env.local
# .env.local already set to VITE_API_URL=http://localhost:8000
npm run dev                     # Runs at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Reference

### `POST /api/trip/plan/`

**Request body:**
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Dallas, TX",
  "dropoff_location": "Los Angeles, CA",
  "current_cycle_used": 20.0
}
```

**Response:**
```json
{
  "route": {
    "total_distance_miles": 2356.0,
    "total_estimated_hours": 42.8,
    "legs": [...],
    "waypoints": [...],
    "stops": [...],
    "polyline": [...]
  },
  "daily_logs": [
    {
      "day": 1,
      "date": "2026-05-15",
      "from_location": "Chicago, IL",
      "to_location": "En Route",
      "total_miles_today": 605,
      "segments": [
        {"status": "off_duty", "start": "00:00", "end": "06:00", "location": "...", "duration_hours": 6.0},
        {"status": "on_duty_not_driving", "start": "06:00", "end": "07:00", "location": "... Pickup", "duration_hours": 1.0},
        {"status": "driving", "start": "07:00", "end": "15:00", "location": "En Route: ...", "duration_hours": 8.0},
        ...
      ],
      "total_hours": {
        "off_duty": 11.5,
        "sleeper_berth": 0.0,
        "driving": 11.0,
        "on_duty_not_driving": 1.5
      },
      "remarks": ["06:00 - On Duty (Not Driving) - Chicago, IL — Pickup", ...],
      "cycle_hours_at_end_of_day": 32.5
    }
  ]
}
```

---

## 🌍 GitHub Setup

```bash
git init
git add .
git commit -m "feat: initial ELD trip planner implementation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/miletrack-eld.git
git push -u origin main
```

---

## ☁️ Deployment

### Backend → Render.com (free tier)

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Set **Root Directory**: `backend`
4. **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
5. **Start Command**: `gunicorn backend.wsgi:application`
6. Add **Environment Variables**:

| Key | Value |
|---|---|
| `DJANGO_SETTINGS_MODULE` | `backend.settings.production` |
| `DJANGO_SECRET_KEY` | Run: `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `ALLOWED_HOSTS` | `your-app.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |

### Frontend → Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → **Import Git Repository**
2. Set **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Add **Environment Variable**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-app.onrender.com` |

---

## 📁 Project Structure

```
miletrack-eld/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── backend/
│   │   ├── settings/
│   │   │   ├── base.py          # Shared settings
│   │   │   ├── development.py   # SQLite, DEBUG=True
│   │   │   └── production.py    # PostgreSQL-ready, DEBUG=False
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── trip/
│       ├── views.py             # TripPlanView API endpoint
│       ├── serializers.py       # Input/output validation
│       ├── models.py            # TripLog history model
│       ├── services/
│       │   ├── geocoding.py     # Nominatim geocoding
│       │   ├── routing.py       # OSRM routing + polyline decode
│       │   └── hos_calculator.py # Full HOS simulation engine
│       └── tests/
│           ├── test_hos_calculator.py
│           └── test_views.py
└── frontend/
    └── src/
        ├── api/tripApi.js       # Axios client
        ├── components/
        │   ├── LogSheet.jsx     # Canvas ELD log drawing
        │   ├── LogSheetList.jsx
        │   ├── RouteMap.jsx     # Leaflet map
        │   ├── TripForm.jsx     # Input form
        │   ├── TripSummary.jsx
        │   ├── StopsList.jsx
        │   └── LoadingSpinner.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   └── ResultsPage.jsx
        └── utils/
            ├── timeHelpers.js
            └── logDrawing.js
```

---

## 🧪 Running Tests

```bash
cd backend
source venv/bin/activate
python manage.py test trip.tests.test_hos_calculator  # HOS logic tests
python manage.py test trip.tests.test_views           # API endpoint tests
python manage.py test trip.tests                      # All tests
```

---

## 📜 License

MIT License — free to use for personal and commercial purposes.

---

## ⚠️ Disclaimer

This tool is for **planning purposes only**. Always verify Hours of Service compliance with your carrier, safety officer, and the official FMCSA regulations at [fmcsa.dot.gov](https://www.fmcsa.dot.gov). The developers assume no liability for regulatory violations.