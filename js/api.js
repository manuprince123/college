// ============================================================
// api.js  –  all API calls + mock-data fallback for demo
// ============================================================

// ---------- Config ----------
const API_BASE = 'http://localhost:5000/api';   // Change to your server URL

// ---------- Request helper ----------
async function apiRequest(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = Storage.get('cms_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}`);
  return data;
}

// ============================================================
//  MOCK DATA  (used when backend is not running)
// ============================================================
let _mockUsers = [
  { id:1, unique_id:'ADM001', name:'Super Admin',       email:'admin@college.edu',   password:'admin123',   role:'admin',   created_at:'2024-01-01' },
  { id:2, unique_id:'TEA001', name:'Prof. Raj Kumar',   email:'raj@college.edu',     password:'teacher123', role:'teacher', created_at:'2024-01-15', department:'Computer Science' },
  { id:3, unique_id:'TEA002', name:'Dr. Priya Nair',    email:'priya@college.edu',   password:'teacher123', role:'teacher', created_at:'2024-02-01', department:'Mathematics' },
  { id:4, unique_id:'STU001', name:'Rahul Verma',       email:'rahul@college.edu',   password:'student123', role:'student', created_at:'2024-03-01', department:'Computer Science', semester:'3rd' },
  { id:5, unique_id:'STU002', name:'Sneha Patel',       email:'sneha@college.edu',   password:'student123', role:'student', created_at:'2024-03-10', department:'Electronics & Communication', semester:'5th' },
  { id:6, unique_id:'STU003', name:'Arjun Singh',       email:'arjun@college.edu',   password:'student123', role:'student', created_at:'2024-04-01', department:'Mechanical Engineering', semester:'1st' },
];

let _nextId = { admin: 2, teacher: 3, student: 4 };

function _genUniqueId(role) {
  const meta = ROLE_META[role];
  _nextId[role] = (_nextId[role] || 1) + 1;
  return `${meta.prefix}${String(_nextId[role]).padStart(3, '0')}`;
}

function _hashPw(pw) { return pw; /* mock – real backend uses bcrypt */ }
function _verifyPw(plain, stored) { return plain === stored; }

// ---------- Mock auth ----------
const MockAuth = {
  register: (name, email, password, role, extra = {}) => {
    if (_mockUsers.find(u => u.email === email)) throw new Error('Email is already registered');
    const id = _mockUsers.length + 1;
    const unique_id = _genUniqueId(role);
    const user = {
      id, unique_id, name, email,
      password: _hashPw(password),
      role, created_at: new Date().toISOString().split('T')[0],
      ...(role === 'student' ? { department: extra.department || '', semester: extra.semester || '1st' } : {}),
      ...(role === 'teacher' ? { department: extra.department || '' } : {}),
    };
    _mockUsers.push(user);
    const { password: _, ...safeUser } = user;
    return { message: 'Registration successful', user: safeUser, token: _makeToken(safeUser) };
  },

  login: (email, password) => {
    const user = _mockUsers.find(u => u.email === email);
    if (!user) throw new Error('No account found with this email');
    if (!_verifyPw(password, user.password)) throw new Error('Incorrect password');
    const { password: _, ...safeUser } = user;
    return { message: 'Login successful', user: safeUser, token: _makeToken(safeUser) };
  },
};

function _makeToken(user) {
  // Build a fake JWT-like token (base64 encoded, no real signature)
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + 86400 * 7 }));
  const sig     = btoa('mock-sig');
  return `${header}.${payload}.${sig}`;
}

// ---------- Mock admin operations ----------
const MockAdmin = {
  getAllUsers: () => _mockUsers.map(({ password: _, ...u }) => u),

  deleteUser: (id) => {
    const idx = _mockUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    if (_mockUsers[idx].role === 'admin') throw new Error('Cannot delete admin user');
    _mockUsers.splice(idx, 1);
    return { message: 'User deleted successfully' };
  },

  updateUser: (id, data) => {
    const idx = _mockUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    _mockUsers[idx] = { ..._mockUsers[idx], ...data };
    const { password: _, ...safe } = _mockUsers[idx];
    return { message: 'User updated', user: safe };
  },

  getStats: () => ({
    total:    _mockUsers.length,
    students: _mockUsers.filter(u => u.role === 'student').length,
    teachers: _mockUsers.filter(u => u.role === 'teacher').length,
    admins:   _mockUsers.filter(u => u.role === 'admin').length,
    recentUsers: _mockUsers.slice(-3).reverse().map(({ password: _, ...u }) => u),
  }),
};

// ---------- Mock teacher operations ----------
const MockTeacher = {
  getStudents: (teacherDept) =>
    _mockUsers
      .filter(u => u.role === 'student' && (!teacherDept || u.department === teacherDept))
      .map(({ password: _, ...u }) => u),
  getProfile: (userId) => {
    const u = _mockUsers.find(x => x.id === userId);
    if (!u) throw new Error('User not found');
    const { password: _, ...safe } = u;
    return safe;
  },
};

// ============================================================
//  USE_BACKEND flag – set to true if real Express server is up
// ============================================================
const USE_BACKEND = false;   // ← flip to true when server runs

// ============================================================
//  Public API surface (used by components)
// ============================================================
const API = {
  /* ---------- Auth ---------- */
  register: async (name, email, password, role, extra) => {
    if (USE_BACKEND) return apiRequest('POST', '/auth/register', { name, email, password, role, ...extra });
    return MockAuth.register(name, email, password, role, extra);
  },

  login: async (email, password) => {
    if (USE_BACKEND) return apiRequest('POST', '/auth/login', { email, password });
    return MockAuth.login(email, password);
  },

  /* ---------- Admin ---------- */
  admin: {
    getStats:    async () => USE_BACKEND ? apiRequest('GET', '/admin/stats', null, true)     : MockAdmin.getStats(),
    getUsers:    async () => USE_BACKEND ? apiRequest('GET', '/admin/users', null, true)     : MockAdmin.getAllUsers(),
    deleteUser:  async (id) => USE_BACKEND ? apiRequest('DELETE', `/admin/users/${id}`, null, true) : MockAdmin.deleteUser(id),
    updateUser:  async (id, data) => USE_BACKEND ? apiRequest('PUT', `/admin/users/${id}`, data, true) : MockAdmin.updateUser(id, data),
  },

  /* ---------- Teacher ---------- */
  teacher: {
    getStudents: async (dept) => USE_BACKEND ? apiRequest('GET', `/teacher/students?dept=${dept || ''}`, null, true) : MockTeacher.getStudents(dept),
    getProfile:  async (id)   => USE_BACKEND ? apiRequest('GET', `/teacher/profile/${id}`, null, true)               : MockTeacher.getProfile(id),
  },

  /* ---------- Student ---------- */
  student: {
    getProfile: async (id) => USE_BACKEND ? apiRequest('GET', `/student/profile/${id}`, null, true) : MockTeacher.getProfile(id),
  },
};
