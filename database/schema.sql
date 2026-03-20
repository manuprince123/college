-- =====================================================
-- Government College Management System
-- Complete MySQL Database Schema
-- File: database/schema.sql
-- Version: 2.0.0 | Date: 2025
-- =====================================================

-- Create and use database
CREATE DATABASE IF NOT EXISTS college_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE college_db;

-- =====================================================
-- 1. DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  head_of_dept INT NULL,
  description TEXT,
  established_year YEAR,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dept_code (code)
) ENGINE=InnoDB COMMENT='Academic departments';

-- =====================================================
-- 2. USERS TABLE (All users: Admin, Teacher, Student, Alumni)
-- =====================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student', 'alumni') NOT NULL,
  phone VARCHAR(15),
  department VARCHAR(100),
  profile_pic VARCHAR(500),
  is_active TINYINT(1) DEFAULT 0 COMMENT '0=pending approval, 1=active',
  email_verified TINYINT(1) DEFAULT 0,
  last_login TIMESTAMP NULL,
  password_reset_token VARCHAR(100) NULL,
  password_reset_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='All system users';

-- =====================================================
-- 3. STUDENTS TABLE
-- =====================================================
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  usn VARCHAR(20) NOT NULL UNIQUE COMMENT 'University Seat Number',
  department VARCHAR(100) NOT NULL,
  department_id INT,
  semester TINYINT NOT NULL DEFAULT 1 CHECK (semester BETWEEN 1 AND 8),
  section VARCHAR(5) DEFAULT 'A',
  enrollment_year YEAR NOT NULL,
  cgpa DECIMAL(4,2) DEFAULT 0.00,
  total_credits INT DEFAULT 0,
  parent_name VARCHAR(150),
  parent_phone VARCHAR(15),
  address TEXT,
  date_of_birth DATE,
  blood_group VARCHAR(5),
  aadhar_number VARCHAR(12),
  scholarship TINYINT(1) DEFAULT 0,
  hostel TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_usn (usn),
  INDEX idx_dept_sem (department, semester)
) ENGINE=InnoDB COMMENT='Student-specific data';

-- =====================================================
-- 4. TEACHERS TABLE
-- =====================================================
CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  employee_id VARCHAR(20) UNIQUE,
  department_id INT,
  designation ENUM('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Instructor') DEFAULT 'Assistant Professor',
  qualification VARCHAR(200),
  specialization VARCHAR(200),
  experience_years TINYINT DEFAULT 0,
  salary DECIMAL(10,2),
  join_date DATE,
  is_hod TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_dept (department_id)
) ENGINE=InnoDB COMMENT='Teacher-specific data';

-- =====================================================
-- 5. ALUMNI TABLE
-- =====================================================
CREATE TABLE alumni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department VARCHAR(100),
  department_id INT,
  graduation_year YEAR,
  usn VARCHAR(20),
  company VARCHAR(200),
  job_role VARCHAR(150),
  location VARCHAR(150),
  linkedin_url VARCHAR(300),
  bio TEXT,
  is_verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_company (company),
  INDEX idx_year (graduation_year)
) ENGINE=InnoDB COMMENT='Alumni-specific data';

-- =====================================================
-- 6. COURSES / SUBJECTS TABLE
-- =====================================================
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  department_id INT NOT NULL,
  teacher_id INT,
  credits TINYINT NOT NULL DEFAULT 3,
  semester TINYINT NOT NULL,
  hours_per_week TINYINT DEFAULT 4,
  description TEXT,
  syllabus_url VARCHAR(500),
  academic_year VARCHAR(10) DEFAULT '2025-26',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
  INDEX idx_dept_sem (department_id, semester),
  INDEX idx_code (code)
) ENGINE=InnoDB COMMENT='Courses/subjects offered';

-- Alias: subjects table references courses
CREATE OR REPLACE VIEW subjects AS SELECT * FROM courses;

-- =====================================================
-- 7. ENROLLMENTS TABLE
-- =====================================================
CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrollment_date DATE DEFAULT (CURRENT_DATE),
  academic_year VARCHAR(10) DEFAULT '2025-26',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, course_id, academic_year),
  INDEX idx_student (student_id),
  INDEX idx_course (course_id)
) ENGINE=InnoDB COMMENT='Student course enrollments';

-- =====================================================
-- 8. ATTENDANCE TABLE
-- =====================================================
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL COMMENT 'references courses.id',
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL DEFAULT 'absent',
  hour TINYINT DEFAULT 1 COMMENT 'Class hour number',
  marked_by INT NOT NULL COMMENT 'teacher user_id',
  notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id),
  UNIQUE KEY unique_attendance (student_id, subject_id, date, hour),
  INDEX idx_student_date (student_id, date),
  INDEX idx_subject_date (subject_id, date)
) ENGINE=InnoDB COMMENT='Daily attendance records';

-- =====================================================
-- 9. MARKS TABLE
-- =====================================================
CREATE TABLE marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  assessment_type ENUM('internal1', 'internal2', 'internal3', 'external', 'practical', 'assignment', 'quiz', 'project') NOT NULL,
  semester TINYINT NOT NULL,
  marks_obtained DECIMAL(5,2) NOT NULL,
  max_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (marks_obtained / max_marks * 100) STORED,
  grade VARCHAR(5),
  academic_year VARCHAR(10) DEFAULT '2025-26',
  uploaded_by INT NOT NULL COMMENT 'teacher user_id',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  UNIQUE KEY unique_marks (student_id, subject_id, assessment_type, academic_year),
  INDEX idx_student (student_id),
  INDEX idx_subject (subject_id)
) ENGINE=InnoDB COMMENT='Student marks and grades';

-- =====================================================
-- 10. ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  subject_id INT NOT NULL,
  teacher_id INT NOT NULL,
  deadline DATETIME NOT NULL,
  max_marks DECIMAL(5,2) DEFAULT 50,
  instructions TEXT,
  attachment_url VARCHAR(500),
  allow_late_submission TINYINT(1) DEFAULT 0,
  late_penalty_percent TINYINT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_subject (subject_id),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB COMMENT='Assignment definitions';

-- =====================================================
-- 11. SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  file_size INT COMMENT 'bytes',
  text_response TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'submitted',
  marks DECIMAL(5,2),
  feedback TEXT,
  graded_by INT COMMENT 'teacher user_id',
  graded_at TIMESTAMP NULL,
  is_late TINYINT(1) DEFAULT 0,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_submission (assignment_id, student_id),
  INDEX idx_assignment (assignment_id),
  INDEX idx_student (student_id)
) ENGINE=InnoDB COMMENT='Assignment submission records';

-- =====================================================
-- 12. ROOMS TABLE
-- =====================================================
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  room_type ENUM('Classroom', 'Computer Lab', 'Science Lab', 'Seminar Hall', 'Conference', 'Auditorium', 'Library') NOT NULL,
  building VARCHAR(50) NOT NULL,
  floor TINYINT DEFAULT 0,
  capacity SMALLINT NOT NULL,
  has_projector TINYINT(1) DEFAULT 0,
  has_ac TINYINT(1) DEFAULT 0,
  has_computers TINYINT(1) DEFAULT 0,
  computer_count SMALLINT DEFAULT 0,
  latitude DECIMAL(10,7) COMMENT 'Google Maps coordinate',
  longitude DECIMAL(10,7) COMMENT 'Google Maps coordinate',
  description TEXT,
  amenities JSON,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (room_type),
  INDEX idx_building (building)
) ENGINE=InnoDB COMMENT='Campus rooms and facilities';

-- =====================================================
-- 13. BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  booked_by_user_id INT NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL COMMENT 'e.g., 09:00-11:00',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose VARCHAR(300) NOT NULL,
  attendees_count SMALLINT DEFAULT 0,
  notes TEXT,
  status ENUM('pending', 'confirmed', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
  approved_by INT NULL,
  approved_at TIMESTAMP NULL,
  rejection_reason VARCHAR(300),
  recurring TINYINT(1) DEFAULT 0,
  recurring_until DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (booked_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_room_date (room_id, date),
  INDEX idx_user (booked_by_user_id),
  INDEX idx_status (status),
  UNIQUE KEY unique_booking (room_id, date, time_slot, status)
) ENGINE=InnoDB COMMENT='Room booking records';

-- =====================================================
-- 14. SURVEYS TABLE
-- =====================================================
CREATE TABLE surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  survey_type ENUM('course_feedback', 'teacher_evaluation', 'infrastructure', 'general', 'exit') DEFAULT 'general',
  target_role ENUM('student', 'teacher', 'all') DEFAULT 'student',
  questions JSON NOT NULL COMMENT 'Array of question objects',
  deadline DATE,
  created_by INT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  is_anonymous TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='Survey/feedback forms';

-- =====================================================
-- 15. SURVEY RESPONSES TABLE
-- =====================================================
CREATE TABLE survey_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  user_id INT NOT NULL,
  responses JSON NOT NULL COMMENT 'Answers to each question',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_response (survey_id, user_id),
  INDEX idx_survey (survey_id)
) ENGINE=InnoDB COMMENT='Survey response submissions';

-- =====================================================
-- 16. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error', 'reminder') DEFAULT 'info',
  category ENUM('attendance', 'marks', 'assignment', 'booking', 'general', 'system') DEFAULT 'general',
  is_read TINYINT(1) DEFAULT 0,
  link VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB COMMENT='User notifications';

-- =====================================================
-- 17. TIMETABLE TABLE
-- =====================================================
CREATE TABLE timetable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  room_id INT,
  day_of_week TINYINT NOT NULL COMMENT '1=Mon, 7=Sun',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  academic_year VARCHAR(10) DEFAULT '2025-26',
  semester TINYINT NOT NULL,
  section VARCHAR(5) DEFAULT 'A',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  INDEX idx_course (course_id),
  INDEX idx_day (day_of_week)
) ENGINE=InnoDB COMMENT='Class timetable';

-- =====================================================
-- 18. ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL,
  target_role ENUM('all', 'student', 'teacher', 'alumni') DEFAULT 'all',
  department_id INT NULL COMMENT 'NULL=college-wide',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  attachment_url VARCHAR(500),
  is_published TINYINT(1) DEFAULT 1,
  publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_role (target_role),
  INDEX idx_published (is_published)
) ENGINE=InnoDB COMMENT='College announcements';

-- =====================================================
-- 19. AUDIT LOG TABLE
-- =====================================================
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_table (table_name),
  INDEX idx_created (created_at)
) ENGINE=InnoDB COMMENT='System audit trail';

-- =====================================================
-- 20. FILE UPLOADS TABLE
-- =====================================================
CREATE TABLE file_uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uploaded_by INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL UNIQUE,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INT COMMENT 'bytes',
  entity_type VARCHAR(50) COMMENT 'submission, profile, syllabus etc',
  entity_id INT,
  is_public TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_entity (entity_type, entity_id)
) ENGINE=InnoDB COMMENT='File upload tracking';

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER $$

-- Calculate and update student CGPA
CREATE PROCEDURE UpdateStudentCGPA(IN p_student_id INT)
BEGIN
  DECLARE v_cgpa DECIMAL(4,2);
  SELECT ROUND(AVG(marks_obtained / max_marks * 10), 2) INTO v_cgpa
  FROM marks WHERE student_id = p_student_id AND assessment_type = 'external';
  UPDATE students SET cgpa = IFNULL(v_cgpa, 0.00) WHERE id = p_student_id;
END$$

-- Get student attendance percentage for a subject
CREATE PROCEDURE GetAttendancePercent(IN p_student_id INT, IN p_subject_id INT, OUT p_percent DECIMAL(5,2))
BEGIN
  SELECT ROUND(
    COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*) * 100, 1
  ) INTO p_percent
  FROM attendance WHERE student_id = p_student_id AND subject_id = p_subject_id;
END$$

-- Check low attendance and create notifications
CREATE PROCEDURE CheckLowAttendance()
BEGIN
  INSERT IGNORE INTO notifications (user_id, title, message, type, category)
  SELECT u.id,
    'Low Attendance Warning',
    CONCAT('Your attendance in ', c.name, ' is below 75%. Current: ', ROUND(att_data.percent, 1), '%'),
    'warning', 'attendance'
  FROM (
    SELECT s.user_id, a.subject_id,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) / COUNT(*) * 100 AS percent
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    GROUP BY s.user_id, a.subject_id
    HAVING percent < 75
  ) att_data
  JOIN users u ON att_data.user_id = u.id
  JOIN courses c ON att_data.subject_id = c.id;
END$$

DELIMITER ;

-- =====================================================
-- VIEWS
-- =====================================================

-- Student Performance View
CREATE OR REPLACE VIEW student_performance_view AS
SELECT
  u.id as user_id, u.name, s.usn, s.department, s.semester, s.cgpa,
  COALESCE(att.overall_attendance, 0) AS overall_attendance_percent,
  COALESCE(mrk.avg_marks, 0) AS avg_marks_percent,
  COALESCE(sub_count.enrolled_courses, 0) AS enrolled_courses
FROM users u
JOIN students s ON u.id = s.user_id
LEFT JOIN (
  SELECT s2.user_id, ROUND(COUNT(CASE WHEN a.status='present' THEN 1 END)/COUNT(*)*100, 1) AS overall_attendance
  FROM students s2 JOIN attendance a ON s2.id = a.student_id GROUP BY s2.user_id
) att ON u.id = att.user_id
LEFT JOIN (
  SELECT s3.user_id, ROUND(AVG(m.marks_obtained/m.max_marks*100), 1) AS avg_marks
  FROM students s3 JOIN marks m ON s3.id = m.student_id GROUP BY s3.user_id
) mrk ON u.id = mrk.user_id
LEFT JOIN (
  SELECT student_id, COUNT(*) AS enrolled_courses FROM enrollments WHERE is_active=1 GROUP BY student_id
) sub_count ON s.id = sub_count.student_id;

-- Room availability view for today
CREATE OR REPLACE VIEW room_availability_today AS
SELECT r.*,
  CASE WHEN b.id IS NOT NULL THEN 'booked' ELSE 'available' END AS availability_status,
  b.time_slot, b.purpose, u.name AS booked_by_name
FROM rooms r
LEFT JOIN bookings b ON r.id = b.room_id AND b.date = CURDATE() AND b.status = 'confirmed'
LEFT JOIN users u ON b.booked_by_user_id = u.id
WHERE r.is_active = 1;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER $$

-- Auto-calculate grade when marks are inserted
CREATE TRIGGER calculate_grade BEFORE INSERT ON marks
FOR EACH ROW
BEGIN
  DECLARE v_percent DECIMAL(5,2);
  SET v_percent = NEW.marks_obtained / NEW.max_marks * 100;
  SET NEW.grade = CASE
    WHEN v_percent >= 90 THEN 'O'
    WHEN v_percent >= 80 THEN 'A+'
    WHEN v_percent >= 70 THEN 'A'
    WHEN v_percent >= 60 THEN 'B+'
    WHEN v_percent >= 55 THEN 'B'
    WHEN v_percent >= 50 THEN 'C'
    WHEN v_percent >= 40 THEN 'P'
    ELSE 'F'
  END;
END$$

-- Audit log trigger for marks changes
CREATE TRIGGER audit_marks_update AFTER UPDATE ON marks
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (NEW.uploaded_by, 'UPDATE', 'marks', NEW.id,
    JSON_OBJECT('marks', OLD.marks_obtained, 'grade', OLD.grade),
    JSON_OBJECT('marks', NEW.marks_obtained, 'grade', NEW.grade));
END$$

DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_marks_semester ON marks(semester);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_users_created ON users(created_at);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Departments
INSERT INTO departments (name, code, description, established_year) VALUES
('Computer Science & Engineering', 'CSE', 'Dept of CSE offering B.E, M.Tech, PhD', 1985),
('Electronics & Communication', 'ECE', 'Dept of ECE offering B.E, M.Tech', 1988),
('Mechanical Engineering', 'ME', 'Dept of ME offering B.E, M.Tech', 1982),
('Civil Engineering', 'CE', 'Dept of CE offering B.E, M.Tech', 1980),
('Information Science', 'ISE', 'Dept of ISE offering B.E', 1995),
('Mathematics', 'MATH', 'Department of Mathematics', 1978),
('Physics', 'PHY', 'Department of Physics', 1978),
('Administration', 'ADMIN', 'College Administration', 1975);

-- Admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, department, is_active) VALUES
('Dr. Principal Kumar', 'admin@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniAJ5qAMRpInPCbIMFrPZvFmO', 'admin', 'Administration', 1);

-- Teacher users (password: teacher123)
INSERT INTO users (name, email, password_hash, role, department, is_active) VALUES
('Prof. Priya Sharma', 'teacher@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniAJ5qAMRpInPCbIMFrPZvFmO', 'teacher', 'Computer Science', 1),
('Prof. Rajesh Kumar', 'rajesh@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniAJ5qAMRpInPCbIMFrPZvFmO', 'teacher', 'Computer Science', 1),
('Prof. Anjali Menon', 'anjali@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniAJ5qAMRpInPCbIMFrPZvFmO', 'teacher', 'Computer Science', 1),
('Prof. Suresh Nair', 'suresh@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniAJ5qAMRpInPCbIMFrPZvFmO', 'teacher', 'Computer Science', 1);

-- Student users (password: student123)
INSERT INTO users (name, email, password_hash, role, department, is_active) VALUES
('Rahul Verma', 'student@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniAJ5qAMRpInPCbIMFrPZvFmO', 'student', 'Computer Science', 1),
('Priya Singh', 'priya.s@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniAJ5qAMRpInPCbIMFrPZvFmO', 'student', 'Computer Science', 1),
('Amit Kumar', 'amit@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniAJ5qAMRpInPCbIMFrPZvFmO', 'student', 'Electronics', 1);

-- Alumni user (password: alumni123)
INSERT INTO users (name, email, password_hash, role, department, is_active) VALUES
('Anita Patel', 'alumni@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniAJ5qAMRpInPCbIMFrPZvFmO', 'alumni', 'Computer Science', 1);

-- Teachers
INSERT INTO teachers (user_id, employee_id, department_id, designation, qualification, experience_years) VALUES
(2, 'EMP001', 1, 'Associate Professor', 'M.Tech CSE, PhD', 8),
(3, 'EMP002', 1, 'Assistant Professor', 'M.Tech CSE', 5),
(4, 'EMP003', 1, 'Assistant Professor', 'M.Tech ECE, PhD', 6),
(5, 'EMP004', 1, 'Professor', 'M.Tech CSE, PhD', 15);

-- Students
INSERT INTO students (user_id, usn, department, department_id, semester, enrollment_year, cgpa) VALUES
(6, '1CS21CS001', 'Computer Science', 1, 5, 2021, 8.40),
(7, '1CS21CS002', 'Computer Science', 1, 5, 2021, 7.90),
(8, '1EC21EC001', 'Electronics', 2, 3, 2021, 9.10);

-- Alumni
INSERT INTO alumni (user_id, department, department_id, graduation_year, company, job_role, location) VALUES
(9, 'Computer Science', 1, 2020, 'TCS', 'Software Engineer', 'Bangalore');

-- Rooms
INSERT INTO rooms (room_number, name, room_type, building, floor, capacity, has_projector, has_ac) VALUES
('R101', 'Room 101', 'Classroom', 'Block A', 1, 60, 1, 1),
('R102', 'Room 102', 'Classroom', 'Block A', 1, 60, 1, 0),
('R103', 'Room 103', 'Classroom', 'Block A', 1, 40, 1, 0),
('L101', 'CS Lab 1', 'Computer Lab', 'Block B', 1, 30, 1, 1),
('L102', 'CS Lab 2', 'Computer Lab', 'Block B', 1, 30, 1, 1),
('SH1', 'Seminar Hall', 'Seminar Hall', 'Block C', 2, 200, 1, 1),
('CR1', 'Conference Room', 'Conference', 'Admin Block', 3, 30, 1, 1),
('AUD1', 'Main Auditorium', 'Auditorium', 'Main Block', 0, 500, 1, 1);

-- Courses
INSERT INTO courses (code, name, department_id, teacher_id, credits, semester, description) VALUES
('CS501', 'Data Structures & Algorithms', 1, 1, 4, 5, 'Advanced data structures and algorithm design'),
('CS502', 'Operating Systems', 1, 2, 4, 5, 'OS concepts, process management, memory management'),
('CS503', 'Database Management Systems', 1, 1, 3, 5, 'Relational databases, SQL, normalization'),
('CS504', 'Computer Networks', 1, 3, 4, 5, 'Network protocols, TCP/IP, OSI model'),
('CS505', 'Software Engineering', 1, 4, 3, 5, 'SDLC, Agile, design patterns');

-- Sample Attendance
INSERT INTO attendance (student_id, subject_id, date, status, marked_by) VALUES
(1, 1, '2025-08-01', 'present', 2),
(1, 1, '2025-08-02', 'present', 2),
(1, 1, '2025-08-04', 'absent', 2),
(1, 2, '2025-08-01', 'present', 3),
(1, 3, '2025-08-01', 'present', 1),
(2, 1, '2025-08-01', 'absent', 2),
(2, 2, '2025-08-01', 'present', 3);

-- Sample Marks
INSERT INTO marks (student_id, subject_id, assessment_type, semester, marks_obtained, max_marks, uploaded_by) VALUES
(1, 1, 'internal1', 5, 42, 50, 2),
(1, 2, 'internal1', 5, 38, 50, 3),
(1, 3, 'internal1', 5, 45, 50, 1),
(1, 4, 'internal1', 5, 33, 50, 3),
(1, 5, 'internal1', 5, 44, 50, 4);

-- Sample Assignments
INSERT INTO assignments (title, description, subject_id, teacher_id, deadline, max_marks) VALUES
('Binary Tree Implementation', 'Implement complete binary tree with insert, delete, search', 1, 1, '2025-08-20 23:59:00', 50),
('Process Scheduling Simulation', 'Simulate FCFS, SJF, RR scheduling algorithms', 2, 2, '2025-08-15 23:59:00', 50),
('ER Diagram - Hospital System', 'Design ER diagram for hospital management system', 3, 1, '2025-08-25 23:59:00', 50);

-- Sample Surveys
INSERT INTO surveys (title, description, survey_type, target_role, questions, deadline, created_by) VALUES
('Course Quality Feedback - CS501', 'Feedback for Data Structures course', 'course_feedback', 'student',
  '[{"id":1,"text":"Rate teaching quality","type":"rating"},{"id":2,"text":"Course content clarity","type":"likert"},{"id":3,"text":"Overall satisfaction","type":"rating"},{"id":4,"text":"Suggestions","type":"text"}]',
  '2025-08-30', 1);

-- Announcements
INSERT INTO announcements (title, content, author_id, target_role, priority) VALUES
('Internal Assessment Schedule - August 2025', 'Internal Assessment 2 will be held from August 18-22, 2025. Timetable attached.', 1, 'student', 'high'),
('Campus Placement Drive - TCS', 'TCS Campus recruitment for 2025 batch. Eligible: CGPA >= 7.0, No backlogs. Registration deadline: August 25.', 1, 'student', 'urgent');

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Q1: Students with low attendance (<75%)
-- SELECT u.name, s.usn, c.name as subject, 
--   COUNT(CASE WHEN a.status='present' THEN 1 END) as present,
--   COUNT(*) as total,
--   ROUND(COUNT(CASE WHEN a.status='present' THEN 1 END)/COUNT(*)*100,1) as percent
-- FROM attendance a
-- JOIN students s ON a.student_id = s.id
-- JOIN users u ON s.user_id = u.id
-- JOIN courses c ON a.subject_id = c.id
-- GROUP BY s.id, c.id HAVING percent < 75;

-- Q2: Top performing students by CGPA
-- SELECT u.name, s.usn, s.department, s.cgpa 
-- FROM students s JOIN users u ON s.user_id = u.id
-- ORDER BY s.cgpa DESC LIMIT 10;

-- Q3: Room booking conflicts check
-- SELECT r.name, b.date, b.time_slot, u.name as booked_by
-- FROM bookings b JOIN rooms r ON b.room_id = r.id
-- JOIN users u ON b.booked_by_user_id = u.id
-- WHERE b.date >= CURDATE() AND b.status = 'confirmed'
-- ORDER BY b.date, b.time_slot;
