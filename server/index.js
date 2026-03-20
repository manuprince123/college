// =====================================================
// Government College Management System
// Node.js + Express.js Backend Server
// File: server/index.js
// =====================================================
// =====================================================
// Government College Management System
// Node.js + Express.js Backend Server
// File: server/index.js
// =====================================================

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// DATABASE CONNECTION POOL
// =====================================================
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'college_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test DB connection
(async () => {
  try {
    const conn = await db.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
})();

// =====================================================
// FILE UPLOAD CONFIGURATION
// =====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', req.body.type || 'misc');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|txt/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('File type not allowed'));
  }
});

// =====================================================
// JWT AUTHENTICATION MIDDLEWARE
// =====================================================
const JWT_SECRET = process.env.JWT_SECRET || 'college_management_secret_2025';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Provide Bearer token.' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Role-based authorization
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied. Required roles: ${roles.join(', ')}` });
  }
  next();
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================
const hashPassword = async (password) => await bcrypt.hash(password, 12);
const comparePassword = async (plain, hashed) => await bcrypt.compare(plain, hashed);
const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
const generateRefreshToken = (payload) => jwt.sign(payload, JWT_SECRET + '_refresh', { expiresIn: '30d' });

const paginate = (query, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return `${query} LIMIT ${limit} OFFSET ${offset}`;
};

// =====================================================
// HEALTH CHECK
// =====================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Government College Management System API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// =====================================================
// AUTH ROUTES
// =====================================================
// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, department, semester, usn } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }
    const validRoles = ['admin', 'teacher', 'student', 'alumni'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Use: admin, teacher, student, alumni' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const passwordHash = await hashPassword(password);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, department, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, phone || null, department || null, role === 'admin' ? 1 : 0]
    );
    const userId = result.insertId;

    // Insert role-specific records
    if (role === 'student') {
      await db.query(
        'INSERT INTO students (user_id, usn, department, semester, enrollment_year) VALUES (?, ?, ?, ?, ?)',
        [userId, usn || '', department || '', semester || 1, new Date().getFullYear()]
      );
    } else if (role === 'teacher') {
      await db.query(
        'INSERT INTO teachers (user_id, department, designation, experience_years) VALUES (?, ?, ?, ?)',
        [userId, department || '', 'Assistant Professor', 0]
      );
    } else if (role === 'alumni') {
      await db.query(
        'INSERT INTO alumni (user_id, department, graduation_year) VALUES (?, ?, ?)',
        [userId, department || '', new Date().getFullYear()]
      );
    }

    res.status(201).json({ message: 'Registration successful. Waiting for admin approval.', userId });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }

    const [users] = await db.query(
      `SELECT u.*, 
        s.usn, s.semester, s.cgpa,
        t.designation, t.experience_years,
        a.company, a.job_role, a.graduation_year
       FROM users u
       LEFT JOIN students s ON u.id = s.user_id AND u.role = 'student'
       LEFT JOIN teachers t ON u.id = t.user_id AND u.role = 'teacher'
       LEFT JOIN alumni a ON u.id = a.user_id AND u.role = 'alumni'
       WHERE u.email = ? AND u.is_active = 1`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or account not approved.' });
    }

    const user = users[0];
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const tokenPayload = { id: user.id, email: user.email, role: user.role, name: user.name, department: user.department };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const { password_hash, ...safeUser } = user;
    res.json({ message: 'Login successful', token, refreshToken, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET + '_refresh');
    const { iat, exp, ...payload } = decoded;
    const newToken = generateToken(payload);
    res.json({ token: newToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, department, profile_pic, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// =====================================================
// STUDENTS ROUTES
// =====================================================
// GET /api/students
app.get('/api/students', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, department, semester, sort = 'name' } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.created_at,
        s.usn, s.department, s.semester, s.cgpa, s.enrollment_year,
        COALESCE(AVG(a.status = 'present'), 0) * 100 AS attendance_percent
      FROM users u
      JOIN students s ON u.id = s.user_id
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE u.role = 'student' AND u.is_active = 1`;
    const params = [];

    if (search) { query += ' AND (u.name LIKE ? OR s.usn LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (department) { query += ' AND s.department = ?'; params.push(department); }
    if (semester) { query += ' AND s.semester = ?'; params.push(parseInt(semester)); }

    query += ' GROUP BY u.id ORDER BY u.name';
    const countQuery = query.replace('SELECT u.id, u.name, u.email, u.phone, u.created_at,\n        s.usn, s.department, s.semester, s.cgpa, s.enrollment_year,\n        COALESCE(AVG(a.status = \'present\'), 0) * 100 AS attendance_percent', 'SELECT COUNT(DISTINCT u.id) as total').replace('GROUP BY u.id ORDER BY u.name', '');

    const paginatedQuery = paginate(query, parseInt(page), parseInt(limit));
    const [students] = await db.query(paginatedQuery, [...params, ...params]);
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM users u JOIN students s ON u.id = s.user_id WHERE u.role = "student" AND u.is_active = 1');

    res.json({ data: students, total: countResult[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/:id
app.get('/api/students/:id', authenticate, async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT u.*, s.* FROM users u JOIN students s ON u.id = s.user_id WHERE u.id = ?`,
      [req.params.id]
    );
    if (students.length === 0) return res.status(404).json({ error: 'Student not found' });
    const { password_hash, ...safe } = students[0];
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// PUT /api/students/:id
app.put('/api/students/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, phone, department, semester, cgpa } = req.body;
    await db.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, req.params.id]);
    await db.query('UPDATE students SET department = ?, semester = ?, cgpa = ? WHERE user_id = ?', [department, semester, cgpa, req.params.id]);
    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /api/students/:id
app.delete('/api/students/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// =====================================================
// ATTENDANCE ROUTES
// =====================================================
// GET /api/attendance - Get attendance records
app.get('/api/attendance', authenticate, async (req, res) => {
  try {
    const { student_id, subject_id, date, page = 1, limit = 50 } = req.query;
    let query = `
      SELECT a.*, u.name as student_name, s.usn, sub.name as subject_name
      FROM attendance a
      JOIN students st ON a.student_id = st.id
      JOIN users u ON st.user_id = u.id
      JOIN subjects sub ON a.subject_id = sub.id
      WHERE 1=1`;
    const params = [];

    // Students can only see their own
    if (req.user.role === 'student') {
      query += ' AND st.user_id = ?'; params.push(req.user.id);
    } else if (student_id) {
      query += ' AND st.user_id = ?'; params.push(student_id);
    }
    if (subject_id) { query += ' AND a.subject_id = ?'; params.push(subject_id); }
    if (date) { query += ' AND a.date = ?'; params.push(date); }
    query += ' ORDER BY a.date DESC';

    const [records] = await db.query(paginate(query, parseInt(page), parseInt(limit)), params);
    res.json({ data: records, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// POST /api/attendance - Mark attendance (Teacher/Admin)
app.post('/api/attendance', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { subject_id, date, records } = req.body; // records: [{student_id, status}]
    if (!subject_id || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'subject_id, date, and records array required' });
    }

    // Verify teacher teaches this subject
    if (req.user.role === 'teacher') {
      const [subj] = await db.query(
        'SELECT id FROM subjects WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE user_id = ?)',
        [subject_id, req.user.id]
      );
      if (subj.length === 0) return res.status(403).json({ error: 'You are not assigned to this subject' });
    }

    const values = records.map(r => [r.student_id, subject_id, date, r.status, req.user.id]);
    await db.query(
      `INSERT INTO attendance (student_id, subject_id, date, status, marked_by)
       VALUES ? ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [values]
    );
    res.json({ message: `Attendance marked for ${records.length} students` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// GET /api/attendance/summary/:student_id
app.get('/api/attendance/summary/:student_id', authenticate, async (req, res) => {
  try {
    const [summary] = await db.query(
      `SELECT sub.name as subject, sub.code,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(*) as total,
        ROUND(COUNT(CASE WHEN a.status = 'present' THEN 1 END) / COUNT(*) * 100, 1) as percentage
       FROM subjects sub
       JOIN attendance a ON sub.id = a.subject_id
       WHERE a.student_id = (SELECT id FROM students WHERE user_id = ?)
       GROUP BY sub.id ORDER BY sub.name`,
      [req.params.student_id]
    );
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

// =====================================================
// MARKS ROUTES
// =====================================================
// GET /api/marks
app.get('/api/marks', authenticate, async (req, res) => {
  try {
    const { student_id, subject_id, assessment_type } = req.query;
    let query = `
      SELECT m.*, u.name as student_name, s.usn, sub.name as subject_name
      FROM marks m
      JOIN students st ON m.student_id = st.id
      JOIN users u ON st.user_id = u.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE 1=1`;
    const params = [];

    if (req.user.role === 'student') { query += ' AND st.user_id = ?'; params.push(req.user.id); }
    else if (student_id) { query += ' AND st.user_id = ?'; params.push(student_id); }
    if (subject_id) { query += ' AND m.subject_id = ?'; params.push(subject_id); }
    if (assessment_type) { query += ' AND m.assessment_type = ?'; params.push(assessment_type); }

    const [records] = await db.query(query, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

// POST /api/marks - Upload marks
app.post('/api/marks', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { subject_id, assessment_type, semester, records } = req.body;
    if (!subject_id || !assessment_type || !records) {
      return res.status(400).json({ error: 'subject_id, assessment_type, and records required' });
    }
    const values = records.map(r => [r.student_id, subject_id, assessment_type, r.marks_obtained, r.max_marks, semester || 1, req.user.id]);
    await db.query(
      `INSERT INTO marks (student_id, subject_id, assessment_type, marks_obtained, max_marks, semester, uploaded_by)
       VALUES ? ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained)`,
      [values]
    );
    res.json({ message: 'Marks uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload marks' });
  }
});

// =====================================================
// ASSIGNMENTS ROUTES
// =====================================================
// GET /api/assignments
app.get('/api/assignments', authenticate, async (req, res) => {
  try {
    const { subject_id, status, page = 1, limit = 20 } = req.query;
    let query = `
      SELECT a.*, sub.name as subject_name, u.name as teacher_name,
        (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as submission_count
      FROM assignments a
      JOIN subjects sub ON a.subject_id = sub.id
      JOIN teachers t ON a.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE a.is_active = 1`;
    const params = [];

    if (req.user.role === 'teacher') {
      query += ' AND a.teacher_id = (SELECT id FROM teachers WHERE user_id = ?)';
      params.push(req.user.id);
    }
    if (subject_id) { query += ' AND a.subject_id = ?'; params.push(subject_id); }
    query += ' ORDER BY a.deadline ASC';

    const [assignments] = await db.query(paginate(query, parseInt(page), parseInt(limit)), params);
    res.json({ data: assignments, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// POST /api/assignments - Create assignment
app.post('/api/assignments', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, subject_id, deadline, max_marks } = req.body;
    if (!title || !subject_id || !deadline) {
      return res.status(400).json({ error: 'Title, subject_id, and deadline required' });
    }
    const [teacher] = await db.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
    const teacherId = teacher[0]?.id || 1;

    const [result] = await db.query(
      'INSERT INTO assignments (title, description, subject_id, teacher_id, deadline, max_marks) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || '', subject_id, teacherId, deadline, max_marks || 50]
    );
    res.status(201).json({ message: 'Assignment created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// POST /api/assignments/:id/submit - Student submission
app.post('/api/assignments/:id/submit', authenticate, authorize('student'), upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const [student] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student record not found' });

    const filePath = req.file ? req.file.path : null;
    const [existing] = await db.query('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?', [id, student[0].id]);

    if (existing.length > 0) {
      await db.query('UPDATE submissions SET file_path = ?, submitted_at = NOW(), status = "submitted" WHERE id = ?', [filePath, existing[0].id]);
    } else {
      await db.query('INSERT INTO submissions (assignment_id, student_id, file_path, status) VALUES (?, ?, ?, "submitted")', [id, student[0].id, filePath]);
    }
    res.json({ message: 'Assignment submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

// PATCH /api/assignments/:assignmentId/grade/:studentId - Grade submission
app.patch('/api/assignments/:assignmentId/grade/:studentId', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    await db.query(
      'UPDATE submissions SET marks = ?, feedback = ?, status = "graded", graded_at = NOW() WHERE assignment_id = ? AND student_id = ?',
      [marks, feedback || '', req.params.assignmentId, req.params.studentId]
    );
    res.json({ message: 'Assignment graded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to grade assignment' });
  }
});

// =====================================================
// COURSES / SUBJECTS ROUTES
// =====================================================
// GET /api/courses
app.get('/api/courses', authenticate, async (req, res) => {
  try {
    const { department, semester } = req.query;
    let query = `
      SELECT c.*, u.name as teacher_name, d.name as department_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND is_active = 1) as enrolled_count
      FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN departments d ON c.department_id = d.id
      WHERE c.is_active = 1`;
    const params = [];

    if (department) { query += ' AND c.department_id = ?'; params.push(department); }
    if (semester) { query += ' AND c.semester = ?'; params.push(semester); }
    if (req.user.role === 'teacher') {
      query += ' AND t.user_id = ?'; params.push(req.user.id);
    }
    query += ' ORDER BY c.name';

    const [courses] = await db.query(query, params);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// POST /api/courses - Create course (Admin)
app.post('/api/courses', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, code, department_id, teacher_id, credits, semester, description } = req.body;
    if (!name || !code || !department_id || !teacher_id) {
      return res.status(400).json({ error: 'name, code, department_id, teacher_id required' });
    }
    const [result] = await db.query(
      'INSERT INTO courses (name, code, department_id, teacher_id, credits, semester, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, code, department_id, teacher_id, credits || 3, semester || 1, description || '']
    );
    res.status(201).json({ message: 'Course created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// POST /api/courses/:id/enroll
app.post('/api/courses/:id/enroll', authenticate, authorize('student'), async (req, res) => {
  try {
    const [student] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });
    await db.query('INSERT IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)', [student[0].id, req.params.id]);
    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

// =====================================================
// ROOM BOOKING ROUTES
// =====================================================
// GET /api/rooms
app.get('/api/rooms', authenticate, async (req, res) => {
  try {
    const { type, building, date } = req.query;
    let query = `
      SELECT r.*,
        b.id as current_booking_id, b.booked_by_user_id, u.name as booked_by_name,
        b.time_slot, b.purpose, b.date as booked_date, b.status as booking_status
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id AND b.date = ? AND b.status = 'confirmed'
      LEFT JOIN users u ON b.booked_by_user_id = u.id
      WHERE r.is_active = 1`;
    const params = [date || new Date().toISOString().split('T')[0]];

    if (type) { query += ' AND r.room_type = ?'; params.push(type); }
    if (building) { query += ' AND r.building = ?'; params.push(building); }

    const [rooms] = await db.query(query, params);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET /api/bookings
app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    const { date, status, room_id, page = 1, limit = 20 } = req.query;
    let query = `
      SELECT b.*, r.name as room_name, r.room_type, r.building,
        u.name as booked_by_name, u.role as booked_by_role
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.booked_by_user_id = u.id
      WHERE 1=1`;
    const params = [];

    if (req.user.role !== 'admin') { query += ' AND b.booked_by_user_id = ?'; params.push(req.user.id); }
    if (date) { query += ' AND b.date = ?'; params.push(date); }
    if (status) { query += ' AND b.status = ?'; params.push(status); }
    if (room_id) { query += ' AND b.room_id = ?'; params.push(room_id); }
    query += ' ORDER BY b.date DESC, b.time_slot ASC';

    const [bookings] = await db.query(paginate(query, parseInt(page), parseInt(limit)), params);
    res.json({ data: bookings, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings - Create booking
app.post('/api/bookings', authenticate, async (req, res) => {
  try {
    const { room_id, date, time_slot, purpose } = req.body;
    if (!room_id || !date || !time_slot || !purpose) {
      return res.status(400).json({ error: 'room_id, date, time_slot, and purpose required' });
    }

    // Check availability
    const [conflicts] = await db.query(
      'SELECT id FROM bookings WHERE room_id = ? AND date = ? AND time_slot = ? AND status IN ("pending", "confirmed")',
      [room_id, date, time_slot]
    );
    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Room is already booked for this time slot' });
    }

    const status = req.user.role === 'admin' ? 'confirmed' : 'pending';
    const [result] = await db.query(
      'INSERT INTO bookings (room_id, date, time_slot, purpose, booked_by_user_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [room_id, date, time_slot, purpose, req.user.id, status]
    );
    res.status(201).json({ message: `Booking ${status}`, id: result.insertId, status });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed' });
  }
});

// PATCH /api/bookings/:id - Approve/Reject booking (Admin)
app.patch('/api/bookings/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Booking ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// =====================================================
// ALUMNI ROUTES
// =====================================================
// GET /api/alumni
app.get('/api/alumni', authenticate, async (req, res) => {
  try {
    const { search, batch, company, page = 1, limit = 20 } = req.query;
    let query = `
      SELECT a.*, u.name, u.email, u.phone
      FROM alumni a JOIN users u ON a.user_id = u.id
      WHERE u.is_active = 1`;
    const params = [];

    if (search) { query += ' AND (u.name LIKE ? OR a.company LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (batch) { query += ' AND a.graduation_year = ?'; params.push(batch); }
    if (company) { query += ' AND a.company LIKE ?'; params.push(`%${company}%`); }
    query += ' ORDER BY u.name';

    const [alumni] = await db.query(paginate(query, parseInt(page), parseInt(limit)), params);
    res.json({ data: alumni, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alumni' });
  }
});

// PUT /api/alumni/:id - Update alumni profile
app.put('/api/alumni/:id', authenticate, async (req, res) => {
  try {
    const { company, job_role, location, linkedin_url, bio } = req.body;
    await db.query(
      'UPDATE alumni SET company = ?, job_role = ?, location = ?, linkedin_url = ?, bio = ? WHERE user_id = ?',
      [company, job_role, location, linkedin_url, bio, req.params.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alumni profile' });
  }
});

// =====================================================
// SURVEYS ROUTES
// =====================================================
// GET /api/surveys
app.get('/api/surveys', authenticate, async (req, res) => {
  try {
    const [surveys] = await db.query(
      `SELECT s.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM survey_responses WHERE survey_id = s.id) as response_count
       FROM surveys s
       JOIN users u ON s.created_by = u.id
       WHERE s.is_active = 1 ORDER BY s.created_at DESC`
    );
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// POST /api/surveys - Create survey
app.post('/api/surveys', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { title, description, questions, deadline, target_role } = req.body;
    const [result] = await db.query(
      'INSERT INTO surveys (title, description, questions, deadline, target_role, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, JSON.stringify(questions), deadline, target_role || 'student', req.user.id]
    );
    res.status(201).json({ message: 'Survey created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// POST /api/surveys/:id/respond - Submit response
app.post('/api/surveys/:id/respond', authenticate, async (req, res) => {
  try {
    const { responses } = req.body;
    const [existing] = await db.query('SELECT id FROM survey_responses WHERE survey_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length > 0) return res.status(409).json({ error: 'Already submitted' });

    await db.query(
      'INSERT INTO survey_responses (survey_id, user_id, responses, submitted_at) VALUES (?, ?, ?, NOW())',
      [req.params.id, req.user.id, JSON.stringify(responses)]
    );
    res.json({ message: 'Response submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// =====================================================
// REPORTS ROUTES
// =====================================================
// GET /api/reports/attendance
app.get('/api/reports/attendance', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { department, semester, date_from, date_to } = req.query;
    const [report] = await db.query(
      `SELECT u.name, s.usn, s.department, s.semester,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(*) as total,
        ROUND(COUNT(CASE WHEN a.status = 'present' THEN 1 END) / COUNT(*) * 100, 1) as percentage
       FROM users u
       JOIN students s ON u.id = s.user_id
       JOIN attendance a ON s.id = a.student_id
       WHERE (? IS NULL OR s.department = ?) AND a.date BETWEEN ? AND ?
       GROUP BY u.id
       ORDER BY percentage ASC`,
      [department || null, department, date_from || '2025-01-01', date_to || new Date().toISOString().split('T')[0]]
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /api/reports/results
app.get('/api/reports/results', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT u.name, s.usn, s.department,
        AVG(m.marks_obtained / m.max_marks * 100) as avg_percentage,
        s.cgpa
       FROM users u
       JOIN students s ON u.id = s.user_id
       JOIN marks m ON s.id = m.student_id
       GROUP BY u.id ORDER BY avg_percentage DESC`
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate results report' });
  }
});

// =====================================================
// AI/OPENAI ROUTES
// =====================================================
app.post('/api/ai/chat', authenticate, async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // In production, replace with actual OpenAI API call:
    /*
    const { Configuration, OpenAIApi } = require('openai');
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `You are an AI assistant for Government College Management System. User is a ${req.user.role}. Context: ${JSON.stringify(context)}` },
        { role: 'user', content: message }
      ]
    });
    const reply = completion.data.choices[0].message.content;
    */

    // Demo response
    const reply = `AI Response for: "${message}" - In production this connects to OpenAI GPT-4 with your college database for real-time answers.`;
    res.json({ reply, model: 'gpt-4', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

app.post('/api/ai/summary/:student_id', authenticate, async (req, res) => {
  try {
    const studentId = req.params.student_id;
    // Fetch student data
    const [student] = await db.query(`SELECT u.name, s.cgpa, s.semester, s.department FROM users u JOIN students s ON u.id = s.user_id WHERE u.id = ?`, [studentId]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    // In production: Generate summary using OpenAI with actual data
    const summary = {
      student: student[0].name,
      overall_assessment: 'Good academic standing',
      cgpa: student[0].cgpa,
      strengths: ['Strong DBMS performance', 'Consistent attendance'],
      concerns: ['Computer Networks attendance below threshold'],
      recommendations: ['Focus on CN attendance', 'Submit pending assignments'],
      predicted_cgpa: student[0].cgpa + 0.1,
      generated_at: new Date().toISOString()
    };
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// =====================================================
// USERS / ADMIN ROUTES
// =====================================================
app.get('/api/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    let query = 'SELECT id, name, email, role, phone, department, is_active, last_login, created_at FROM users WHERE 1=1';
    const params = [];
    if (role) { query += ' AND role = ?'; params.push(role); }
    query += ' ORDER BY created_at DESC';
    const [users] = await db.query(paginate(query, parseInt(page), parseInt(limit)), params);
    const [count] = await db.query('SELECT COUNT(*) as total FROM users');
    res.json({ data: users, total: count[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch('/api/users/:id/activate', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { is_active } = req.body;
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    res.json({ message: `User ${is_active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, () => {
  console.log(`\n🚀 Government College Management System API`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
