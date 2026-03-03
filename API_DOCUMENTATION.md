# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 👤 User Endpoints

### Get User Profile
**GET** `/user/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "current_job_role": "Software Engineer",
  "years_of_experience": 3.5,
  "weekly_available_time": 10.0,
  "career_goal": "Senior Developer",
  "risk_tolerance": "Medium"
}
```

### Update User Profile
**PUT** `/user/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "current_job_role": "Senior Software Engineer",
  "years_of_experience": 5.0,
  "weekly_available_time": 15.0,
  "career_goal": "Tech Lead",
  "risk_tolerance": "High"
}
```

**Response:** Updated profile object

---

## 📋 Activity Endpoints

### Get All Activities
**GET** `/activities/`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Build a Personal Portfolio Website",
    "description": "Create a professional portfolio...",
    "domain": "Technical",
    "difficulty": "Intermediate",
    "estimated_time": 8.0,
    "submission_type": "URL",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Get Activity by ID
**GET** `/activities/{activity_id}`

**Headers:** `Authorization: Bearer <token>`

**Response:** Single activity object

### Submit Activity
**POST** `/activities/submit`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "activity_id": 1,
  "submission_content": "I completed the portfolio...",
  "submission_url": "https://myportfolio.com",
  "completion_time": 7.5,
  "feedback_rating": 5
}
```

**Response:**
```json
{
  "id": 1,
  "activity_id": 1,
  "submission_content": "I completed the portfolio...",
  "submission_url": "https://myportfolio.com",
  "completion_time": 7.5,
  "attempts_count": 1,
  "completion_status": "completed",
  "feedback_rating": 5,
  "submitted_at": "2024-01-15T10:30:00"
}
```

### Get My Submissions
**GET** `/activities/submissions/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of submission objects

---

## 📊 Dashboard Endpoint

### Get Dashboard Data
**GET** `/dashboard/`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "profile": {
    "id": 1,
    "name": "John Doe",
    "current_job_role": "Software Engineer",
    "years_of_experience": 3.5,
    "weekly_available_time": 10.0,
    "career_goal": "Senior Developer",
    "risk_tolerance": "Medium"
  },
  "completed_activities": 5,
  "weekly_consistency": 71.43,
  "progress_indicator": 45.5,
  "recommended_activities": [
    {
      "id": 2,
      "title": "Write a Technical Blog Post",
      "description": "...",
      "domain": "Writing",
      "difficulty": "Beginner",
      "estimated_time": 3.0,
      "submission_type": "Text",
      "created_at": "2024-01-01T00:00:00"
    }
  ]
}
```

---

## 📈 Analytics Endpoints

### Get Completion Chart
**GET** `/analytics/completion-chart`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "2024-01-10": 2,
  "2024-01-12": 1,
  "2024-01-15": 3
}
```

### Get Domain Engagement
**GET** `/analytics/domain-engagement`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "Technical": 5,
  "Writing": 2,
  "Business": 1
}
```

### Get Consistency Score
**GET** `/analytics/consistency-score`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "consistency_score": 71.43
}
```

### Get Engagement Score
**GET** `/analytics/engagement-score`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "engagement_score": 45.5
}
```

---

## 🎯 Recommendation Endpoint

### Generate Recommendations
**GET** `/recommendations/generate`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "career_paths": [
    "Software Engineering & Technical Leadership",
    "Content Strategy & Communication"
  ],
  "weekly_roadmap": {
    "week_1": "Complete 2 activities in your strongest domain",
    "week_2": "Explore 1 new domain activity",
    "week_3": "Focus on skill depth with advanced activities",
    "week_4": "Review progress and adjust goals"
  },
  "progress_summary": "Consistency: 71.43%, Engagement: 45.5%. Keep up the momentum!"
}
```

---

## 🔧 Admin Endpoints

**Note:** All admin endpoints require admin role.

### Create Activity
**POST** `/admin/activities`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "New Activity",
  "description": "Activity description",
  "domain": "Technical",
  "difficulty": "Beginner",
  "estimated_time": 5.0,
  "submission_type": "Text"
}
```

**Response:** Created activity object

### Update Activity
**PUT** `/admin/activities/{activity_id}`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:** Same as create activity

**Response:** Updated activity object

### Delete Activity
**DELETE** `/admin/activities/{activity_id}`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "message": "Activity deleted successfully"
}
```

### Get User Progress
**GET** `/admin/user-progress`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "1": 5,
  "2": 3,
  "3": 8
}
```
(User ID: Number of completed activities)

---

## 🤖 AI Placeholder Endpoints

### Get Readiness Score
**GET** `/ai/readiness-score`

**Response:**
```json
{
  "status": "AI module not integrated yet",
  "message": "ML-based readiness scoring will be available in future releases"
}
```

### Get AI Career Recommendation
**GET** `/ai/career-recommendation`

**Response:**
```json
{
  "status": "AI module not integrated yet",
  "message": "AI-powered career recommendations will be available in future releases"
}
```

### Explain Roadmap
**GET** `/ai/explain-roadmap`

**Response:**
```json
{
  "status": "AI module not integrated yet",
  "message": "AI-powered roadmap explanations will be available in future releases"
}
```

---

## 🔍 Error Responses

### 400 Bad Request
```json
{
  "detail": "Email already registered"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized"
}
```

### 404 Not Found
```json
{
  "detail": "Activity not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error",
  "message": "Error description"
}
```

---

## 📝 Notes

- All timestamps are in UTC
- Dates are in ISO 8601 format
- JWT tokens expire after 30 minutes
- All endpoints return JSON
- CORS is enabled for localhost:5173 and localhost:3000

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Get Activities (with token)
```bash
curl -X GET http://localhost:8000/api/activities/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔗 Interactive Documentation

Visit http://localhost:8000/docs for Swagger UI with interactive API testing.
