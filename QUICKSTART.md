# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Seed database with sample data
python seed_db.py

# Start backend server
uvicorn app.main:app --reload
```

✅ Backend running at: http://localhost:8000
📚 API Docs at: http://localhost:8000/docs

### Step 2: Frontend Setup (2 minutes)

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running at: http://localhost:5173

### Step 3: Login (1 minute)

1. Open browser: http://localhost:5173
2. Click "Register" to create an account
3. Or use admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

## 🎯 What to Try First

1. **Complete Your Profile**
   - Navigate to Profile
   - Fill in your career details

2. **Browse Activities**
   - Go to Activities page
   - Start an activity
   - Submit your work

3. **Check Your Dashboard**
   - View your progress
   - See recommended activities

4. **Explore Analytics**
   - View completion charts
   - Get career recommendations

## 🔧 Troubleshooting

**Backend won't start?**
- Ensure Python 3.8+ is installed
- Check if port 8000 is available
- Verify virtual environment is activated

**Frontend won't start?**
- Ensure Node.js 16+ is installed
- Delete `node_modules` and run `npm install` again
- Check if port 5173 is available

**Can't login?**
- Ensure backend is running
- Check browser console for errors
- Verify database was seeded

## 📱 Test the API

Visit http://localhost:8000/docs for interactive API documentation.

Try these endpoints:
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Get JWT token
- GET `/api/activities/` - List activities
- GET `/api/dashboard/` - Get dashboard data

## 🎓 Next Steps

- Read the full [README.md](README.md)
- Explore the [API Documentation](API_DOCUMENTATION.md)
- Check the [AI Integration Guide](backend/ai/README.md)

## 💡 Tips

- Use the Swagger UI at `/docs` to test APIs
- Check browser DevTools for debugging
- Backend logs show in terminal
- All data is stored in SQLite database

Happy coding! 🚀
