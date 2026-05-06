# Deployment Guide — AI Career Mentor

## Architecture

```
Frontend (Next.js)  →  Backend (Django + DRF)  →  SQLite / PostgreSQL
                              ↓
                    Groq API  |  Gemini API  |  Adzuna API
```

---

## Local Development

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Create `.env` in `backend/`:
```
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
ADZUNA_APP_ID=your_adzuna_id
ADZUNA_APP_KEY=your_adzuna_key
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
```

### 2. Frontend

```bash
# From project root
npm install
npm run dev
```

Create `.env.local` in project root:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
GROQ_API_KEY=your_groq_key
```

---

## Production Deployment (Render.com)

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml` and create all services
5. Set the following environment variables manually in Render dashboard:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `ADZUNA_APP_ID`
   - `ADZUNA_APP_KEY`

### Option B: Manual Setup

#### Backend Service
- **Type**: Web Service
- **Runtime**: Python 3
- **Root Directory**: `backend`
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

Environment variables:
```
DJANGO_SECRET_KEY=<generate-a-strong-secret>
DEBUG=False
ALLOWED_HOSTS=.onrender.com
DATABASE_URL=<from-render-postgres>
FRONTEND_URL=https://your-frontend.onrender.com
GROQ_API_KEY=<your-key>
GEMINI_API_KEY=<your-key>
ADZUNA_APP_ID=<your-id>
ADZUNA_APP_KEY=<your-key>
```

#### Frontend Service
- **Type**: Web Service
- **Runtime**: Node
- **Root Directory**: `.` (project root)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

Environment variables:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
GROQ_API_KEY=<your-key>
```

#### PostgreSQL Database
- Create a free PostgreSQL database on Render
- Copy the `DATABASE_URL` connection string to the backend service

---

## API Keys Setup

### Groq API (Free)
1. Go to [console.groq.com](https://console.groq.com)
2. Create account → API Keys → Create new key
3. Model used: `llama-3.3-70b-versatile`

### Gemini API (Free tier available)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Get API key → copy it
3. Model used: `gemini-2.0-flash`

### Adzuna API (Free)
1. Go to [developer.adzuna.com](https://developer.adzuna.com)
2. Register → Create application
3. Copy `App ID` and `App Key`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq LLM API key |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `ADZUNA_APP_ID` | Yes | Adzuna job search App ID |
| `ADZUNA_APP_KEY` | Yes | Adzuna job search App Key |
| `DJANGO_SECRET_KEY` | Yes (prod) | Django secret key |
| `DATABASE_URL` | Yes (prod) | PostgreSQL connection string |
| `DEBUG` | No | `True` for dev, `False` for prod |
| `ALLOWED_HOSTS` | No | Comma-separated allowed hosts |
| `FRONTEND_URL` | No | Frontend URL for CORS |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |

---

## Post-Deployment Checklist

- [ ] Backend health check: `GET /api/auth/user/status/` returns 401 (not 500)
- [ ] CORS configured for frontend URL
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] All API keys set in environment
- [ ] Frontend `NEXT_PUBLIC_API_URL` points to backend
