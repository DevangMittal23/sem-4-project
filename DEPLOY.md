# Deploying AI Career Mentor on Render

## Prerequisites
- GitHub account
- Render account (render.com — free tier works)
- API keys: Groq, Gemini, Serper (optional)

---

## Step 1 — Push to GitHub

```bash
cd d:\Desktop\careerboost-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-career-mentor.git
git push -u origin main
```

---

## Step 2 — Deploy via render.yaml (Recommended)

1. Go to https://dashboard.render.com
2. Click **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create all 3 services automatically:
   - `ai-career-mentor-backend` (Django)
   - `ai-career-mentor` (Next.js)
   - `ai-career-mentor-db` (PostgreSQL)

5. After services are created, add these **Environment Variables** to the backend service:
   - `GROQ_API_KEY` = your key from console.groq.com
   - `GEMINI_API_KEY` = your key from aistudio.google.com
   - `SERPER_API_KEY` = your key from serper.dev (optional)

6. Add to the frontend service:
   - `GROQ_API_KEY` = same Groq key (used by Next.js API route)

---

## Step 3 — Manual Deploy (Alternative)

### 3a. Deploy Django Backend

1. Render Dashboard → **New** → **Web Service**
2. Connect repo, set **Root Directory** to `backend`
3. Settings:
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Plan**: Free

4. Environment Variables:
   ```
   DJANGO_SECRET_KEY    = (click "Generate" for a random value)
   DEBUG                = False
   ALLOWED_HOSTS        = .onrender.com
   DATABASE_URL         = (auto-filled when you attach the DB below)
   FRONTEND_URL         = https://ai-career-mentor.onrender.com
   GROQ_API_KEY         = your_key
   GEMINI_API_KEY       = your_key
   SERPER_API_KEY       = your_key
   ```

5. Add a **PostgreSQL** database:
   - Render Dashboard → **New** → **PostgreSQL**
   - Name: `ai-career-mentor-db`, Plan: Free
   - Copy the **Internal Database URL**
   - Paste it as `DATABASE_URL` in the backend service env vars

### 3b. Deploy Next.js Frontend

1. Render Dashboard → **New** → **Web Service**
2. Connect same repo, **Root Directory** = `.` (root)
3. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL  = https://ai-career-mentor-backend.onrender.com/api
   GROQ_API_KEY         = your_key
   ```

---

## Step 4 — Update CORS after deploy

Once both services are live, update the backend's `FRONTEND_URL` env var with the actual frontend URL:
```
FRONTEND_URL = https://ai-career-mentor.onrender.com
```
Render will auto-redeploy.

---

## URLs after deployment

| Service  | URL |
|----------|-----|
| Frontend | https://ai-career-mentor.onrender.com |
| Backend API | https://ai-career-mentor-backend.onrender.com/api |
| Admin panel | https://ai-career-mentor-backend.onrender.com/admin |

---

## Create admin user after deploy

In Render backend service → **Shell**:
```bash
python manage.py createsuperuser
```

---

## Notes

- Free tier services **spin down after 15 min of inactivity** — first request takes ~30s to wake up
- SQLite is used locally; PostgreSQL is used on Render automatically via `DATABASE_URL`
- All migrations run automatically in `build.sh`
