# Government College Management System — API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.college.yourdomain.com/api`

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. AUTH ENDPOINTS

### POST /auth/register
Register a new user (requires admin approval for activation).
```json
Request Body:
{
  "name": "Rahul Verma",
  "email": "rahul@college.edu",
  "password": "SecurePass@123",
  "role": "student",
  "phone": "9876543210",
  "department": "Computer Science",
  "semester": 5,
  "usn": "1CS21CS001"
}

Response 201:
{
  "message": "Registration successful. Waiting for admin approval.",
  "userId": 42
}
```

### POST /auth/login
```json
Request Body:
{ "email": "admin@college.edu", "password": "admin123" }

Response 200:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1, "name": "Dr. Principal Kumar", "email": "admin@college.edu",
    "role": "admin", "department": "Administration"
  }
}
```

### GET /auth/me — Get current user profile
```
Headers: Authorization: Bearer <token>
Response: { id, name, email, role, phone, department, profile_pic, created_at }
```

### POST /auth/refresh — Refresh access token
```json
Request: { "refreshToken": "..." }
Response: { "token": "new_jwt_token" }
```

---

## 2. STUDENTS ENDPOINTS

### GET /students?page=1&limit=20&search=Rahul&department=Computer+Science&semester=5
**Roles**: Admin, Teacher
```json
Response:
{
  "data": [{
    "id": 1, "name": "Rahul Verma", "usn": "1CS21CS001",
    "department": "Computer Science", "semester": 5, "cgpa": 8.4,
    "attendance_percent": 85.0, "email": "rahul@college.edu"
  }],
  "total": 250, "page": 1, "limit": 20
}
```

### GET /students/:id
Returns full student profile with all details.

### PUT /students/:id
**Role**: Admin
```json
{ "name": "Rahul Verma", "phone": "9876543210", "department": "CS", "semester": 5, "cgpa": 8.5 }
```

### DELETE /students/:id — Deactivate student
**Role**: Admin

---

## 3. ATTENDANCE ENDPOINTS

### GET /attendance?student_id=1&subject_id=2&date=2025-08-12&page=1
```json
Response: {
  "data": [{
    "id": 1, "student_name": "Rahul Verma", "usn": "1CS21CS001",
    "subject_name": "Data Structures", "date": "2025-08-12",
    "status": "present"
  }]
}
```

### POST /attendance — Mark attendance
**Roles**: Teacher, Admin
```json
{
  "subject_id": 1,
  "date": "2025-08-12",
  "records": [
    { "student_id": 1, "status": "present" },
    { "student_id": 2, "status": "absent" },
    { "student_id": 3, "status": "late" }
  ]
}
Response: { "message": "Attendance marked for 3 students" }
```

### GET /attendance/summary/:student_id
```json
Response: [
  { "subject": "Data Structures", "code": "CS501", "present": 42, "total": 50, "percentage": 84.0 },
  { "subject": "DBMS", "code": "CS503", "present": 45, "total": 50, "percentage": 90.0 }
]
```

---

## 4. MARKS ENDPOINTS

### GET /marks?student_id=1&subject_id=1&assessment_type=internal1

### POST /marks — Upload marks
**Roles**: Teacher, Admin
```json
{
  "subject_id": 1,
  "assessment_type": "internal1",
  "semester": 5,
  "records": [
    { "student_id": 1, "marks_obtained": 42, "max_marks": 50 },
    { "student_id": 2, "marks_obtained": 38, "max_marks": 50 }
  ]
}
```

---

## 5. ASSIGNMENTS ENDPOINTS

### GET /assignments?subject_id=1&page=1&limit=10

### POST /assignments — Create assignment
**Roles**: Teacher, Admin
```json
{
  "title": "Binary Tree Implementation",
  "description": "Implement complete binary tree...",
  "subject_id": 1,
  "deadline": "2025-08-20T23:59:00",
  "max_marks": 50
}
Response 201: { "message": "Assignment created", "id": 5 }
```

### POST /assignments/:id/submit — Student submission
**Role**: Student
```
Content-Type: multipart/form-data
Fields: file (PDF/DOC), type: "submission"
```

### PATCH /assignments/:assignId/grade/:studentId
**Roles**: Teacher, Admin
```json
{ "marks": 45, "feedback": "Excellent implementation with good time complexity." }
```

---

## 6. COURSES ENDPOINTS

### GET /courses?department=1&semester=5

### POST /courses — Create course
**Role**: Admin
```json
{
  "name": "Machine Learning",
  "code": "CS601",
  "department_id": 1,
  "teacher_id": 2,
  "credits": 4,
  "semester": 6,
  "description": "Introduction to ML algorithms"
}
```

### POST /courses/:id/enroll — Enroll student
**Role**: Student

---

## 7. ROOM BOOKING ENDPOINTS

### GET /rooms?type=Computer+Lab&building=Block+B&date=2025-08-12
```json
Response: [{
  "id": 4, "room_number": "L101", "name": "CS Lab 1",
  "room_type": "Computer Lab", "building": "Block B", "capacity": 30,
  "current_booking_id": null, "availability_status": "available"
}]
```

### GET /bookings?date=2025-08-12&status=confirmed&page=1

### POST /bookings — Create booking
```json
{
  "room_id": 4,
  "date": "2025-08-15",
  "time_slot": "09:00-11:00",
  "purpose": "Lab Practical - CS503"
}
Response 201: { "message": "Booking pending", "id": 10, "status": "pending" }
```

### PATCH /bookings/:id — Approve/Reject
**Role**: Admin
```json
{ "status": "confirmed" }
// or: { "status": "rejected", "rejection_reason": "Room maintenance scheduled" }
```

---

## 8. ALUMNI ENDPOINTS

### GET /alumni?search=Anita&batch=2020&company=TCS&page=1

### PUT /alumni/:id — Update profile
**Role**: Alumni (own profile)
```json
{
  "company": "Google", "job_role": "Senior Software Engineer",
  "location": "Bangalore", "linkedin_url": "linkedin.com/in/alumni",
  "bio": "Passionate about AI/ML"
}
```

---

## 9. SURVEYS ENDPOINTS

### GET /surveys — List active surveys

### POST /surveys — Create survey
**Roles**: Admin, Teacher
```json
{
  "title": "CS501 Course Feedback",
  "description": "Rate the quality of Data Structures course",
  "survey_type": "course_feedback",
  "target_role": "student",
  "deadline": "2025-08-30",
  "questions": [
    { "id": 1, "text": "Rate teaching quality (1-5)", "type": "rating" },
    { "id": 2, "text": "Course content was clear", "type": "likert" },
    { "id": 3, "text": "Suggestions for improvement", "type": "text" }
  ]
}
```

### POST /surveys/:id/respond — Submit survey response
**Role**: Student
```json
{
  "responses": {
    "1": 5, "2": "Strongly Agree", "3": "More coding examples needed"
  }
}
```

---

## 10. REPORTS ENDPOINTS

### GET /reports/attendance?department=Computer+Science&date_from=2025-07-01&date_to=2025-08-12
**Roles**: Admin, Teacher

### GET /reports/results
**Roles**: Admin, Teacher

---

## 11. AI ENDPOINTS

### POST /ai/chat — AI Chatbot
```json
Request: { "message": "What is my attendance?", "context": { "role": "student" } }
Response: { "reply": "Your attendance summary...", "model": "gpt-4", "timestamp": "..." }
```

### POST /ai/summary/:student_id — Performance summary
```json
Response: {
  "student": "Rahul Verma",
  "overall_assessment": "Good academic standing",
  "cgpa": 8.4,
  "strengths": ["Strong DBMS performance"],
  "concerns": ["Low CN attendance"],
  "recommendations": ["Attend CN classes regularly"],
  "predicted_cgpa": 8.5
}
```

---

## ERROR RESPONSE FORMAT
All errors follow this format:
```json
{ "error": "Descriptive error message" }
```

**HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient role)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## DEMO CREDENTIALS
| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@college.edu        | admin123    |
| Teacher | teacher@college.edu      | teacher123  |
| Student | student@college.edu      | student123  |
| Alumni  | alumni@college.edu       | alumni123   |
