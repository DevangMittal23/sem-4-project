# AI-Assisted Career Transition Platform

A production-ready full-stack web application that helps working professionals safely prepare career growth or job transitions through structured activities, behavioral tracking, and personalized progress monitoring.

## 🎯 Project Overview

This platform provides:
- **Structured Career Activities**: Curated tasks to build skills and explore career paths
- **Behavioral Tracking**: Monitor completion patterns, consistency, and engagement
- **Rule-Based Recommendations**: Get personalized career path suggestions
- **Progress Analytics**: Visualize your growth with interactive charts
- **AI-Ready Architecture**: Designed for future ML and RAG integration

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- Chart.js for data visualization

**Backend:**
- Python FastAPI
- SQLAlchemy ORM
- JWT Authentication
- SQLite Database (development)
- Modular MVC/Service Pattern

### Project Structure

```
sem-4 project/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── routes/                 # API route definitions
│   │   ├── controllers/            # Request handlers
│   │   │   ├── auth_controller.py
│   │   │   ├── user_controller.py
│   │   │   ├── activity_controller.py
│   │   │   ├── dashboard_controller.py
│   │   │   ├── analytics_controller.py
│   │   │   ├── recommendation_controller.py
│   │   │   ├── admin_controller.py
│   │   │   └── ai_controller.py    # Placeholder for future AI
│   │   ├── services/               # Business logic layer
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── activity_service.py
│   │   │   ├── analytics_service.py
│   │   │   ├── recommendation_service.py
│   │   │   └── dashboard_service.py
│   │   ├── models/                 # Database models
│   │   │   └── models.py
│   │   ├── schemas/                # Pydantic schemas
│   │   │   └── schemas.py
│   │   ├── database/               # Database configuration
│   │   │   └── connection.py
│   │   ├── auth/                   # Authentication utilities
│   │   │   └── auth.py
│   │   ├── middleware/             # Custom middleware
│   │   │   └── error_handler.py
│   │   └── utils/                  # Utility functions
│   │       └── logger.py
│   ├── ai/                         # Future AI integration
│   │   ├── ml_models/
│   │   ├── rag_pipeline/
│   │   ├── embeddings/
│   │   ├── vector_store/
│   │   ├── inference/
│   │   └── README.md
│   ├── requirements.txt
│   ├── .env
│   └── seed_db.py
│
└── frontend/
    ├── src/
    │   ├── components/             # Reusable components
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/                  # Page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Activities.jsx
    │   │   ├── Profile.jsx
    │   │   └── Analytics.jsx
    │   ├── layouts/                # Layout components
    │   │   └── MainLayout.jsx
    │   ├── services/               # API services
    │   │   └── api.js
    │   ├── context/                # React context
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🚀 Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Initialize database and seed data:**
   ```bash
   python seed_db.py
   ```

6. **Run the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Backend will be available at: `http://localhost:8000`
   API Documentation (Swagger): `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

## 👤 Default Credentials

After seeding the database:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**Regular User:**
- Register a new account through the UI

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Activities
- `GET /api/activities/` - Get all activities
- `GET /api/activities/{id}` - Get specific activity
- `POST /api/activities/submit` - Submit activity completion
- `GET /api/activities/submissions/me` - Get user's submissions

### Dashboard
- `GET /api/dashboard/` - Get dashboard data

### Analytics
- `GET /api/analytics/completion-chart` - Activity completion timeline
- `GET /api/analytics/domain-engagement` - Domain engagement data
- `GET /api/analytics/consistency-score` - User consistency score
- `GET /api/analytics/engagement-score` - User engagement score

### Recommendations
- `GET /api/recommendations/generate` - Generate career recommendations

### Admin (Requires admin role)
- `POST /api/admin/activities` - Create activity
- `PUT /api/admin/activities/{id}` - Update activity
- `DELETE /api/admin/activities/{id}` - Delete activity
- `GET /api/admin/user-progress` - View all users' progress

### AI Placeholder
- `GET /api/ai/readiness-score` - Future ML readiness scoring
- `GET /api/ai/career-recommendation` - Future AI recommendations
- `GET /api/ai/explain-roadmap` - Future AI explanations

## 🎨 Features

### 1. Authentication System
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes on frontend and backend

### 2. User Dashboard
- Profile summary
- Completed activities count
- Weekly consistency score
- Progress indicator
- Recommended next activities

### 3. Activity Management
- Browse available activities
- Filter by domain and difficulty
- Submit activity completions
- Track submission history
- Rate completed activities

### 4. Behavioral Tracking
- Completion time tracking
- Submission timestamps
- Attempt counting
- Feedback ratings
- Consistency scoring
- Engagement metrics

### 5. Rule-Based Recommendations
- Career path suggestions based on activity patterns
- Weekly roadmap generation
- Progress summaries
- Domain-based activity recommendations

### 6. Analytics & Visualization
- Activity completion timeline (Bar chart)
- Domain engagement distribution (Doughnut chart)
- Weekly progress tracking
- Consistency and engagement scores

### 7. Admin Panel
- Create, edit, and delete activities
- View user progress summary
- Manage platform content

## 🤖 AI Integration (Future)

The platform is designed with AI-readiness in mind:

### Planned AI Features
1. **ML-Based Readiness Scoring**: Predict career transition readiness
2. **AI Career Recommendations**: Personalized paths using ML models
3. **RAG-Powered Guidance**: Context-aware career advice
4. **Skill Gap Analysis**: Identify missing skills for target roles
5. **Personalized Learning Paths**: Custom roadmaps using LLMs

### Integration Points
- Dedicated `/backend/ai/` module structure
- Placeholder API endpoints already defined
- Behavioral data collection ready for ML training
- Decoupled architecture for easy AI plugin

### Technology Stack (Planned)
- TensorFlow/PyTorch for ML models
- LangChain/LlamaIndex for RAG
- OpenAI/Anthropic APIs for LLMs
- Vector databases (Pinecone/Weaviate)
- Sentence Transformers for embeddings

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention via ORM

## 🛠️ Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm test
```

### Building for Production

**Backend:**
```bash
# Use production WSGI server
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Frontend:**
```bash
npm run build
# Serve the dist/ folder with nginx or similar
```

## 📊 Database Schema

### Users
- id, email, hashed_password, is_admin, created_at

### User Profiles
- id, user_id, name, current_job_role, years_of_experience, weekly_available_time, career_goal, risk_tolerance

### Activities
- id, title, description, domain, difficulty, estimated_time, submission_type, created_at

### Activity Submissions
- id, user_id, activity_id, submission_content, submission_url, completion_time, attempts_count, completion_status, feedback_rating, submitted_at

### Progress Logs
- id, user_id, consistency_score, engagement_score, domain_summary, week_start, week_end, created_at

### Recommendations
- id, user_id, career_paths, weekly_roadmap, progress_summary, created_at

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built as a semester 4 project demonstrating full-stack development with AI-ready architecture.

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Note**: This is a development setup. For production deployment, ensure proper environment variables, use PostgreSQL/MySQL instead of SQLite, implement proper logging, and set up monitoring.
