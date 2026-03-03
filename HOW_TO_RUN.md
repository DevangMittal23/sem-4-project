# 🚀 How to Run the Project

## Complete Step-by-Step Guide

---

## 📋 Prerequisites Check

Before starting, ensure you have:

- [ ] **Python 3.8 or higher** installed
  ```bash
  python --version
  ```

- [ ] **Node.js 16 or higher** installed
  ```bash
  node --version
  ```

- [ ] **npm** installed
  ```bash
  npm --version
  ```

- [ ] **Git** (optional, for version control)
  ```bash
  git --version
  ```

---

## 🎯 Quick Start (5 Minutes)

### Option 1: Two Terminal Setup (Recommended)

#### Terminal 1 - Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data
python seed_db.py

# Start the backend server
uvicorn app.main:app --reload
```

✅ Backend running at: **http://localhost:8000**  
📚 API Docs at: **http://localhost:8000/docs**

---

#### Terminal 2 - Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

---

### Option 2: One Terminal Setup

```bash
# Start backend in background
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python seed_db.py
start /B uvicorn app.main:app --reload

# Start frontend
cd ../frontend
npm install
npm run dev
```

---

## 📝 Detailed Setup Instructions

### Step 1: Backend Setup

#### 1.1 Navigate to Backend Directory
```bash
cd "d:\Desktop\projects\sem-4 project\backend"
```

#### 1.2 Create Virtual Environment
```bash
python -m venv venv
```

This creates an isolated Python environment.

#### 1.3 Activate Virtual Environment

**Windows (Command Prompt):**
```bash
venv\Scripts\activate
```

**Windows (PowerShell):**
```bash
venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

#### 1.4 Install Python Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- SQLAlchemy (ORM)
- Pydantic (validation)
- python-jose (JWT)
- passlib (password hashing)
- python-multipart (file uploads)
- python-dotenv (environment variables)

#### 1.5 Verify Installation
```bash
pip list
```

You should see all packages listed.

#### 1.6 Initialize Database
```bash
python seed_db.py
```

This will:
- Create SQLite database
- Create all tables
- Insert sample activities
- Create admin user

Expected output:
```
Database seeded successfully!
```

#### 1.7 Start Backend Server
```bash
uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### 1.8 Test Backend
Open browser and visit:
- **http://localhost:8000** - Should show welcome message
- **http://localhost:8000/docs** - Should show Swagger UI
- **http://localhost:8000/health** - Should return `{"status": "healthy"}`

---

### Step 2: Frontend Setup

#### 2.1 Open New Terminal
Keep the backend terminal running and open a new terminal.

#### 2.2 Navigate to Frontend Directory
```bash
cd "d:\Desktop\projects\sem-4 project\frontend"
```

#### 2.3 Install Node Dependencies
```bash
npm install
```

This installs:
- React (UI library)
- React Router (routing)
- Axios (HTTP client)
- Chart.js (charts)
- Tailwind CSS (styling)
- Vite (build tool)

This may take 2-3 minutes.

#### 2.4 Verify Installation
```bash
npm list --depth=0
```

You should see all packages listed.

#### 2.5 Start Development Server
```bash
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

#### 2.6 Test Frontend
Open browser and visit:
- **http://localhost:5173** - Should show login page

---

## 🔐 First Login

### Option 1: Use Admin Account

1. Go to **http://localhost:5173**
2. Click **"Login"**
3. Enter credentials:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`
4. Click **"Login"**

You should be redirected to the dashboard.

### Option 2: Create New Account

1. Go to **http://localhost:5173**
2. Click **"Register"**
3. Fill in the form:
   - **Name**: Your name
   - **Email**: Your email
   - **Password**: Your password
4. Click **"Register"**

You should be automatically logged in and redirected to the dashboard.

---

## 🎯 Testing the Application

### Test 1: View Dashboard
1. After login, you should see the dashboard
2. Check the metrics cards (completed activities, consistency, progress)
3. View your profile summary
4. See recommended activities

### Test 2: Complete Your Profile
1. Click **"Profile"** in the navigation
2. Click **"Edit"**
3. Fill in your details:
   - Current Job Role
   - Years of Experience
   - Weekly Available Time
   - Career Goal
   - Risk Tolerance
4. Click **"Save Changes"**

### Test 3: Browse Activities
1. Click **"Activities"** in the navigation
2. You should see 8 sample activities
3. Click **"Start Activity"** on any activity
4. Fill in the submission form:
   - Submission Content (text)
   - Submission URL (optional)
   - Rating (1-5)
5. Click **"Submit"**

### Test 4: View Analytics
1. Click **"Analytics"** in the navigation
2. View the activity completion chart
3. View the domain engagement chart
4. See your career path recommendations
5. Check the weekly roadmap

### Test 5: Admin Features (Admin Only)
1. Login as admin
2. Go to Activities page
3. Admin can create/edit/delete activities
4. View user progress summary

---

## 🔧 Troubleshooting

### Backend Issues

#### Issue: "Module not found"
**Solution:**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### Issue: "Port 8000 already in use"
**Solution:**
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Or use a different port:
uvicorn app.main:app --reload --port 8001
```

#### Issue: "Database locked"
**Solution:**
```bash
# Delete the database and recreate
del career_platform.db  # Windows
# rm career_platform.db  # macOS/Linux

# Reseed the database
python seed_db.py
```

#### Issue: "Import error"
**Solution:**
```bash
# Make sure you're in the backend directory
cd backend

# Check Python path
python -c "import sys; print(sys.path)"

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

---

### Frontend Issues

#### Issue: "npm install fails"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s node_modules  # Windows
del package-lock.json  # Windows
# rm -rf node_modules package-lock.json  # macOS/Linux

# Reinstall
npm install
```

#### Issue: "Port 5173 already in use"
**Solution:**
```bash
# Kill the process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Or use a different port:
npm run dev -- --port 3000
```

#### Issue: "Cannot connect to backend"
**Solution:**
1. Make sure backend is running on port 8000
2. Check `vite.config.js` proxy settings
3. Try accessing http://localhost:8000/health directly
4. Check browser console for CORS errors

#### Issue: "White screen / blank page"
**Solution:**
```bash
# Check browser console for errors
# Clear browser cache
# Restart the dev server
npm run dev
```

---

## 🛑 Stopping the Application

### Stop Backend
In the backend terminal:
- Press `Ctrl + C`
- Deactivate virtual environment: `deactivate`

### Stop Frontend
In the frontend terminal:
- Press `Ctrl + C`

---

## 🔄 Restarting the Application

### Quick Restart

**Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📊 Verifying Everything Works

### Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:8000
- [ ] Can access http://localhost:8000/docs
- [ ] Can access http://localhost:5173
- [ ] Can register a new user
- [ ] Can login
- [ ] Can view dashboard
- [ ] Can update profile
- [ ] Can view activities
- [ ] Can submit an activity
- [ ] Can view analytics
- [ ] Charts display correctly
- [ ] No console errors

---

## 🎓 Next Steps

After successfully running the application:

1. **Explore Features**
   - Complete your profile
   - Submit multiple activities
   - View your progress

2. **Test Admin Features**
   - Login as admin
   - Create a new activity
   - View user progress

3. **Review Code**
   - Check backend structure
   - Review frontend components
   - Understand the architecture

4. **Read Documentation**
   - [README.md](README.md) - Full documentation
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design

5. **Customize**
   - Add new activities
   - Modify UI styling
   - Extend features

---

## 💡 Tips

### Development Tips

1. **Hot Reload**: Both backend and frontend support hot reload
   - Backend: Changes to Python files auto-reload
   - Frontend: Changes to React files auto-update

2. **API Testing**: Use Swagger UI at http://localhost:8000/docs
   - Test endpoints interactively
   - View request/response schemas

3. **Database Inspection**: Use SQLite browser
   - Download: https://sqlitebrowser.org/
   - Open: `backend/career_platform.db`

4. **Browser DevTools**: Use for frontend debugging
   - F12 to open DevTools
   - Check Console for errors
   - Use Network tab for API calls

### Performance Tips

1. **Backend**: Use `--workers` flag for production
   ```bash
   uvicorn app.main:app --workers 4
   ```

2. **Frontend**: Build for production
   ```bash
   npm run build
   ```

3. **Database**: Add indexes for better performance
   - Already configured in models

---

## 📞 Getting Help

If you encounter issues:

1. **Check Logs**
   - Backend: Terminal output
   - Frontend: Browser console

2. **Review Documentation**
   - README.md
   - QUICKSTART.md
   - API_DOCUMENTATION.md

3. **Common Issues**
   - Port conflicts
   - Missing dependencies
   - Database errors
   - CORS issues

4. **Debug Mode**
   - Backend: Already in debug mode with `--reload`
   - Frontend: Check browser console

---

## ✅ Success Indicators

You know everything is working when:

✅ Backend terminal shows "Application startup complete"  
✅ Frontend terminal shows "ready in X ms"  
✅ Browser shows login page at localhost:5173  
✅ API docs accessible at localhost:8000/docs  
✅ Can login and see dashboard  
✅ Can submit activities  
✅ Charts display in analytics  
✅ No errors in console  

---

## 🎉 You're Ready!

The application is now running successfully. Enjoy exploring the AI-Assisted Career Transition Platform!

**Happy Coding! 🚀**
