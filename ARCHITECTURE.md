# System Architecture

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (React + Vite)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │ Services │  │ Context  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/REST API (Axios)
                            │
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│                    (FastAPI + Python)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Controllers                        │  │
│  │  (Request Handling & Response Formatting)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                     Services                          │  │
│  │  (Business Logic & Data Processing)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                      Models                           │  │
│  │  (Database Schema & ORM)                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                    SQLAlchemy ORM
                            │
┌─────────────────────────────────────────────────────────────┐
│                       Database                               │
│                    (SQLite / PostgreSQL)                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Future AI Module                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ML Models │  │   RAG    │  │Embeddings│  │  Vector  │   │
│  │          │  │ Pipeline │  │          │  │  Store   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                    (Not Yet Implemented)                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### User Authentication Flow
```
1. User enters credentials → Frontend (Login.jsx)
2. Frontend sends POST /api/auth/login → Backend (auth_controller.py)
3. Controller calls AuthService.authenticate_user()
4. Service verifies credentials against database
5. Service generates JWT token
6. Token returned to frontend
7. Frontend stores token in localStorage
8. Token included in all subsequent requests
```

### Activity Submission Flow
```
1. User submits activity → Frontend (Activities.jsx)
2. Frontend sends POST /api/activities/submit → Backend (activity_controller.py)
3. Controller validates JWT token (get_current_user)
4. Controller calls ActivityService.submit_activity()
5. Service creates ActivitySubmission record
6. Service updates user progress metrics
7. Response sent back to frontend
8. Frontend updates UI
```

### Dashboard Data Flow
```
1. User visits dashboard → Frontend (Dashboard.jsx)
2. Frontend sends GET /api/dashboard/ → Backend (dashboard_controller.py)
3. Controller calls DashboardService.get_dashboard_data()
4. Service aggregates data from multiple sources:
   - UserService.get_profile()
   - ActivityService.get_user_submissions()
   - AnalyticsService.calculate_consistency_score()
   - AnalyticsService.calculate_engagement_score()
   - RecommendationService.get_recommended_activities()
5. Aggregated data returned to frontend
6. Frontend renders dashboard components
```

## 📦 Module Responsibilities

### Frontend Modules

**Pages**
- Route-level components
- Data fetching and state management
- Layout composition

**Components**
- Reusable UI elements
- Presentational logic
- Event handling

**Services**
- API communication
- Request/response transformation
- Error handling

**Context**
- Global state management
- Authentication state
- User session

**Layouts**
- Page structure templates
- Navigation components
- Common UI elements

### Backend Modules

**Controllers**
- HTTP request handling
- Input validation
- Response formatting
- Route definitions

**Services**
- Business logic implementation
- Data processing
- Cross-cutting concerns
- Algorithm implementation

**Models**
- Database schema definition
- ORM relationships
- Data constraints

**Schemas**
- Request/response validation
- Data serialization
- Type definitions

**Auth**
- JWT token management
- Password hashing
- User authentication
- Authorization checks

**Middleware**
- Error handling
- Request logging
- CORS configuration

**Utils**
- Helper functions
- Logging utilities
- Common operations

## 🔐 Security Architecture

### Authentication Flow
```
┌──────────┐                    ┌──────────┐
│  Client  │                    │  Server  │
└──────────┘                    └──────────┘
     │                                │
     │  POST /auth/login              │
     │  {email, password}             │
     ├───────────────────────────────>│
     │                                │
     │                          Verify credentials
     │                          Hash comparison
     │                          Generate JWT
     │                                │
     │  {access_token, token_type}    │
     │<───────────────────────────────┤
     │                                │
     │  Store token in localStorage   │
     │                                │
     │  GET /api/protected            │
     │  Authorization: Bearer <token> │
     ├───────────────────────────────>│
     │                                │
     │                          Verify JWT
     │                          Extract user
     │                          Process request
     │                                │
     │  {response_data}               │
     │<───────────────────────────────┤
```

### Security Layers
1. **Transport Security**: HTTPS (production)
2. **Authentication**: JWT tokens
3. **Password Security**: Bcrypt hashing
4. **Authorization**: Role-based access control
5. **Input Validation**: Pydantic schemas
6. **SQL Injection Prevention**: SQLAlchemy ORM
7. **CORS**: Configured allowed origins

## 📊 Data Flow Architecture

### Behavioral Tracking Pipeline
```
User Activity
     │
     ├─> ActivitySubmission (Database)
     │
     ├─> AnalyticsService.calculate_consistency_score()
     │   └─> Analyzes submission timestamps
     │       └─> Calculates daily activity pattern
     │
     ├─> AnalyticsService.calculate_engagement_score()
     │   └─> Analyzes completion rate
     │       └─> Factors in feedback ratings
     │
     ├─> AnalyticsService.get_domain_summary()
     │   └─> Groups by activity domain
     │       └─> Counts domain participation
     │
     └─> ProgressLog (Database)
         └─> Stores weekly metrics
```

### Recommendation Engine Pipeline
```
User Behavior Data
     │
     ├─> Domain Summary
     │   └─> Count activities per domain
     │
     ├─> Rule-Based Logic
     │   ├─> Technical >= 3 → Software Engineering path
     │   ├─> Writing >= 2 → Content Strategy path
     │   └─> Business >= 2 → Product Management path
     │
     ├─> Generate Weekly Roadmap
     │   └─> Template-based suggestions
     │
     ├─> Calculate Progress Summary
     │   └─> Consistency + Engagement metrics
     │
     └─> Recommendation (Database)
         └─> Store for future reference
```

## 🔌 AI Integration Architecture (Future)

### Planned Integration Points
```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Existing Services                        │  │
│  │  (Continue to work without AI)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│                    Optional AI Enhancement                   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  AI Service Layer                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ ML Service │  │RAG Service │  │LLM Service │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  AI Infrastructure                    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Models   │  │   Vector   │  │ Embeddings │    │  │
│  │  │   Store    │  │   Store    │  │   Cache    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### AI Enhancement Strategy
1. **Non-Breaking**: Existing features work without AI
2. **Additive**: AI adds new capabilities
3. **Fallback**: Graceful degradation if AI unavailable
4. **Modular**: AI components are plug-and-play
5. **Scalable**: Can add more AI features incrementally

## 🗄️ Database Schema

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ hashed_password │
│ is_admin        │
│ created_at      │
└─────────────────┘
        │
        │ 1:1
        ▼
┌─────────────────────┐
│   User Profiles     │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ name                │
│ current_job_role    │
│ years_of_experience │
│ weekly_available_time│
│ career_goal         │
│ risk_tolerance      │
└─────────────────────┘

┌─────────────────┐
│   Activities    │
├─────────────────┤
│ id (PK)         │
│ title           │
│ description     │
│ domain          │
│ difficulty      │
│ estimated_time  │
│ submission_type │
└─────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────┐
│ Activity Submissions │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ activity_id (FK)     │
│ submission_content   │
│ submission_url       │
│ completion_time      │
│ attempts_count       │
│ completion_status    │
│ feedback_rating      │
│ submitted_at         │
└──────────────────────┘

┌─────────────────┐
│  Progress Logs  │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ consistency_score│
│ engagement_score│
│ domain_summary  │
│ week_start      │
│ week_end        │
│ created_at      │
└─────────────────┘

┌──────────────────┐
│ Recommendations  │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ career_paths     │
│ weekly_roadmap   │
│ progress_summary │
│ created_at       │
└──────────────────┘
```

## 🚀 Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                         Load Balancer                        │
│                         (Nginx/AWS ALB)                      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────────────┐                      ┌───────────────┐
│   Frontend    │                      │    Backend    │
│   (Static)    │                      │   (FastAPI)   │
│   Nginx/S3    │                      │  Gunicorn +   │
│               │                      │   Uvicorn     │
└───────────────┘                      └───────────────┘
                                               │
                                       ┌───────┴───────┐
                                       │               │
                                ┌──────────┐    ┌──────────┐
                                │PostgreSQL│    │  Redis   │
                                │ Database │    │  Cache   │
                                └──────────┘    └──────────┘
```

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend (JWT tokens)
- Database connection pooling
- Caching layer (Redis)
- CDN for static assets

### Vertical Scaling
- Database indexing
- Query optimization
- Async operations
- Background job processing

### Future Enhancements
- Microservices architecture
- Message queue (RabbitMQ/Kafka)
- Separate AI service
- Distributed caching

## 🔍 Monitoring & Observability

### Logging
- Request/response logging
- Error tracking
- Performance metrics
- User activity logs

### Metrics
- API response times
- Database query performance
- User engagement metrics
- System resource usage

### Alerting
- Error rate thresholds
- Performance degradation
- Security incidents
- System health checks

---

This architecture is designed for:
- ✅ Modularity
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Future AI Integration
