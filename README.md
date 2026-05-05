# Semester 4 Assessment Platform

This project is a full‑stack web application for managing student assessments, AI‑assisted evaluation, and performance dashboards.[page:1]  
The frontend is built with Next.js (App Router, TypeScript), and the backend is a Django application exposed via REST‑style endpoints.[page:1][page:2]

## Features

- User authentication and profiles (students and faculty) handled by the Django `accounts` app.[page:2]  
- Assessment creation, question management, and response storage in the `assessment` backend app.[page:2]  
- AI‑assisted evaluation logic (e.g., scoring, feedback generation) encapsulated in the `ai_engine` backend app.[page:2]  
- Analytics and performance dashboards exposed via the `dashboard` backend app and rendered in the Next.js `app/dashboard` route.[page:1][page:2]  
- Modern React/Next.js UI with separate pages for login, signup, dashboard, profile, and assessments under `app/`.[page:1]  

## Project Structure

```text
sem-4-project/
├── app/                # Next.js frontend (App Router)
│   ├── api/evaluate/   # Route handler(s) calling backend AI evaluation
│   ├── assessment/     # Assessment listing/attempt pages
│   ├── dashboard/      # Student/faculty dashboard UI
│   ├── login/          # Login page
│   ├── profile/        # User profile page
│   ├── signup/         # Signup/registration page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing or home page
│
├── backend/            # Django backend
│   ├── accounts/       # Authentication and user management
│   ├── ai_engine/      # AI‑driven evaluation logic
│   ├── assessment/     # Models and APIs for tests/quizzes
│   ├── core/           # Project settings, URLs, shared utilities
│   ├── dashboard/      # Aggregated statistics and reporting
│   ├── build.sh        # Backend build/deploy helper script
│   ├── db.sqlite3      # SQLite database (development)
│   ├── manage.py       # Django management script
│   └── requirements.txt# Backend Python dependencies
│
├── components/         # Shared React components for the frontend
├── data/               # Static/sample data used by the app
├── lib/                # Frontend utilities (API clients, helpers)
├── public/             # Static assets for Next.js
├── render.yaml         # Render.com deployment configuration
├── next.config.ts      # Next.js configuration
├── package.json        # Frontend Node dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── DEPLOY.md           # Deployment notes for the project
```

[page:1][page:2]

## Tech Stack

- **Frontend**: Next.js (TypeScript, App Router), React, CSS modules/global styles.[page:1]  
- **Backend**: Django, Django apps for accounts, assessment, dashboard, and AI evaluation.[page:2]  
- **Database**: SQLite for development via `backend/db.sqlite3` (can be switched to PostgreSQL/MySQL for production).[page:2]  
- **Deployment**: Render.com (configured through `render.yaml`), plus additional steps in `DEPLOY.md`.[page:1]  

## Getting Started (Local Development)

### Prerequisites

- Node.js and npm (or yarn/pnpm/bun) for the Next.js frontend.[page:1]  
- Python 3.x and `pip` for the Django backend.[page:2]  
- (Optional but recommended) `virtualenv` or similar for backend dependencies.[page:2]  

### 1. Clone the Repository

```bash
git clone https://github.com/DevangMittal23/sem-4-project.git
cd sem-4-project
```

### 2. Backend Setup (Django)

From the `backend` directory:[page:2]

```bash
cd backend

# Create and activate virtual environment (example)
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# (Optional) Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver 0.0.0.0:8000
```

By default the backend will listen on port `8000` for API requests.[page:2]

### 3. Frontend Setup (Next.js)

From the project root:[page:1]

```bash
# Install Node dependencies
npm install
# or: yarn install / pnpm install / bun install

# Run the dev server
npm run dev
# or: yarn dev / pnpm dev / bun dev
```

The frontend will be available at `http://localhost:3000`.[page:1]  
Update any environment variables or API base URLs in `lib` or API route handlers so the frontend points to the backend (e.g., `http://localhost:8000`).[page:1][page:2]

## Key Modules and Responsibilities

### Frontend (`app/` and `components/`)

- `app/login`, `app/signup`: Authentication forms interacting with backend `accounts` endpoints.[page:1][page:2]  
- `app/dashboard`: Fetches and displays dashboard metrics from the backend `dashboard` APIs.[page:1][page:2]  
- `app/assessment`: Lists available assessments, starts attempts, and sends responses to the backend `assessment` endpoints.[page:1][page:2]  
- `app/api/evaluate`: Next.js route handler that proxies evaluation requests to the backend `ai_engine` for scoring/feedback.[page:1][page:2]  
- `components/`: Reusable UI building blocks (cards, forms, layout containers, etc.).[page:1]  

### Backend (`backend/`)

- `accounts`: User models, authentication, and related views/serializers.[page:2]  
- `assessment`: Data models for tests/questions, submission handling APIs.[page:2]  
- `ai_engine`: Integration with AI logic used to evaluate answers, compute scores, and generate feedback.[page:2]  
- `dashboard`: Aggregates assessment data into statistics and exposes them to the frontend dashboard.[page:2]  
- `core`: Global settings, URL routing, and other shared configuration.[page:2]  

## Running Tests

If you add tests to the project, you can run them as follows:

- **Backend tests** (inside `backend`)

  ```bash
  cd backend
  python manage.py test
  ```

- **Frontend tests** (if configured with Jest/Testing Library): from the project root: 

  ```bash
  npm test
  # or: yarn test
  ```

## Deployment

Deployment is set up to target Render.com using `render.yaml` and backend helper scripts.[page:1]  
See `DEPLOY.md` for step‑by‑step deployment instructions, environment variable configuration, and build commands for both frontend and backend services.

## Environment Variables

You will typically need variables similar to:

- Backend secret keys and database config (e.g., `SECRET_KEY`, `DATABASE_URL`) defined in Django settings.[page:2]  
- Frontend API base URL (e.g., `NEXT_PUBLIC_API_BASE_URL`) so the Next.js app can call the Django backend.[page:1][page:2]  

Refer to your `core` settings and any `.env` examples you add to the repo.

## Contributing

1. Fork the repository and create a feature branch.  
2. Make your changes in both frontend (`app`, `components`, `lib`) and backend (`backend`) as needed.  
3. Run tests and linters.  
4. Open a pull request with a clear description of your changes.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
