// ============================================================
// utils.js  –  shared helpers: Toast, Modal, hooks, constants
// ============================================================

// ---------- Constants ----------
const ROLES = { STUDENT: 'student', TEACHER: 'teacher', ADMIN: 'admin' };

const ROLE_META = {
  student: { label: 'Student',  icon: 'fa-user-graduate', prefix: 'STU', gradient: 'grad-student', badge: 'badge-student' },
  teacher: { label: 'Teacher',  icon: 'fa-chalkboard-user', prefix: 'TEA', gradient: 'grad-teacher', badge: 'badge-teacher' },
  admin:   { label: 'Admin',    icon: 'fa-shield-halved',  prefix: 'ADM', gradient: 'grad-admin',   badge: 'badge-admin'   },
};

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Mathematics', 'Physics', 'Chemistry', 'Business Administration'
];

const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

// ---------- Storage helpers ----------
const Storage = {
  set:    (k, v) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)),
  get:    (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return localStorage.getItem(k); } },
  remove: (k)    => localStorage.removeItem(k),
  clear:  ()     => localStorage.clear(),
};

// ---------- JWT decode (no library needed) ----------
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch { return null; }
}

function isTokenExpired(token) {
  const data = decodeToken(token);
  if (!data || !data.exp) return true;
  return Date.now() / 1000 > data.exp;
}

// ---------- Validation ----------
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(pw) {
  return pw && pw.length >= 6;
}
function validateName(name) {
  return name && name.trim().length >= 2;
}

// =========================================================
//  Toast Component
// =========================================================
function Toast({ toasts, removeToast }) {
  return React.createElement('div', { style: { position:'fixed', top:'1rem', right:'1rem', zIndex:9999, display:'flex', flexDirection:'column', gap:'0.5rem' } },
    toasts.map(t =>
      React.createElement('div', {
        key: t.id,
        className: `toast ${t.type}`,
        style: { cursor: 'pointer' },
        onClick: () => removeToast(t.id)
      },
        React.createElement('i', { className: `fas ${t.type==='success'?'fa-circle-check':t.type==='error'?'fa-circle-xmark':t.type==='warn'?'fa-triangle-exclamation':'fa-circle-info'}` }),
        React.createElement('span', null, t.msg)
      )
    )
  );
}

// ---------- useToast hook ----------
function useToast() {
  const [toasts, setToasts] = React.useState([]);
  const addToast = React.useCallback((msg, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const removeToast = React.useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, toast: addToast, removeToast };
}

// =========================================================
//  Modal Component
// =========================================================
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return React.createElement('div', { className: 'modal-bg', onClick: e => e.target === e.currentTarget && onClose() },
    React.createElement('div', { className: 'modal-box' },
      // Header
      React.createElement('div', { className: 'flex items-center justify-between p-6 border-b border-slate-100' },
        React.createElement('h3', { className: 'text-lg font-bold text-slate-800' }, title),
        React.createElement('button', { onClick: onClose, className: 'w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600' },
          React.createElement('i', { className: 'fas fa-xmark' })
        )
      ),
      // Body
      React.createElement('div', { className: 'p-6' }, children),
      // Footer
      footer && React.createElement('div', { className: 'px-6 pb-5 flex gap-3 justify-end' }, footer)
    )
  );
}

// =========================================================
//  ConfirmModal
// =========================================================
function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return React.createElement(Modal, { open, onClose, title: title || 'Confirm Action',
    footer: React.createElement(React.Fragment, null,
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose, disabled: loading }, 'Cancel'),
      React.createElement('button', {
        className: `btn ${danger ? 'btn-danger' : 'btn-primary'}`,
        onClick: onConfirm, disabled: loading
      }, loading ? React.createElement(Spinner, { small: true }) : React.createElement('i', { className: 'fas fa-check' }), confirmLabel)
    )
  },
    React.createElement('p', { className: 'text-slate-600 text-sm leading-relaxed' }, message)
  );
}

// =========================================================
//  Spinner
// =========================================================
function Spinner({ small, white }) {
  const sz  = small ? 'w-4 h-4' : 'w-6 h-6';
  const clr = white ? 'border-white border-t-transparent' : 'border-blue-500 border-t-transparent';
  return React.createElement('span', { className: `inline-block ${sz} border-2 ${clr} rounded-full animate-spin` });
}

// =========================================================
//  Skeleton loader
// =========================================================
function SkeletonRow({ cols = 5 }) {
  return React.createElement('tr', null,
    Array.from({ length: cols }).map((_, i) =>
      React.createElement('td', { key: i, className: 'p-3' },
        React.createElement('div', { className: 'skeleton h-4', style: { width: `${60 + Math.random() * 30}%` } })
      )
    )
  );
}

// =========================================================
//  FormField wrapper
// =========================================================
function FormField({ label, error, required, children }) {
  return React.createElement('div', { className: 'mb-4' },
    label && React.createElement('label', { className: 'block text-sm font-600 text-slate-700 mb-1.5' },
      label, required && React.createElement('span', { className: 'text-red-500 ml-0.5' }, '*')
    ),
    children,
    error && React.createElement('p', { className: 'mt-1.5 text-xs text-red-500 flex items-center gap-1' },
      React.createElement('i', { className: 'fas fa-circle-exclamation' }), error
    )
  );
}

// =========================================================
//  StatCard
// =========================================================
function StatCard({ icon, label, value, gradient, sub }) {
  return React.createElement('div', { className: 'card stat-card p-5 flex items-center gap-4' },
    React.createElement('div', { className: `${gradient} w-13 h-13 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0`, style: { width: 52, height: 52 } },
      React.createElement('i', { className: `fas ${icon}` })
    ),
    React.createElement('div', null,
      React.createElement('div', { className: 'text-2xl font-800 text-slate-800' }, value),
      React.createElement('div', { className: 'text-sm text-slate-500 font-500' }, label),
      sub && React.createElement('div', { className: 'text-xs text-slate-400 mt-0.5' }, sub)
    )
  );
}

// =========================================================
//  PageHeader
// =========================================================
function PageHeader({ icon, title, subtitle, action }) {
  return React.createElement('div', { className: 'flex items-start justify-between mb-6 page-enter' },
    React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement('div', { className: 'w-10 h-10 grad-hero rounded-xl flex items-center justify-center text-white' },
        React.createElement('i', { className: `fas ${icon}` })
      ),
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-xl font-700 text-slate-800' }, title),
        subtitle && React.createElement('p', { className: 'text-sm text-slate-500' }, subtitle)
      )
    ),
    action
  );
}

// =========================================================
//  EmptyState
// =========================================================
function EmptyState({ icon, title, subtitle }) {
  return React.createElement('div', { className: 'flex flex-col items-center justify-center py-16 text-center' },
    React.createElement('div', { className: 'w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 text-3xl mb-4' },
      React.createElement('i', { className: `fas ${icon}` })
    ),
    React.createElement('p', { className: 'text-slate-600 font-600 text-base' }, title),
    subtitle && React.createElement('p', { className: 'text-slate-400 text-sm mt-1' }, subtitle)
  );
}

// =========================================================
//  RoleBadge
// =========================================================
function RoleBadge({ role }) {
  const meta = ROLE_META[role] || {};
  return React.createElement('span', { className: `badge badge-${role}` },
    React.createElement('i', { className: `fas ${meta.icon || 'fa-user'} text-xs` }),
    meta.label || role
  );
}

// =========================================================
//  Avatar  (initials-based)
// =========================================================
function Avatar({ name = '', size = 38, gradient = 'grad-hero' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return React.createElement('div', {
    className: `${gradient} rounded-full flex items-center justify-center text-white font-700 flex-shrink-0 select-none`,
    style: { width: size, height: size, fontSize: size * 0.38 }
  }, initials);
}

// =========================================================
//  Input component
// =========================================================
function Input({ label, error, icon, type = 'text', required, ...props }) {
  const [show, setShow] = React.useState(false);
  const isPass = type === 'password';
  return React.createElement(FormField, { label, error, required },
    React.createElement('div', { className: 'inp-wrap' },
      icon && React.createElement('span', { className: 'inp-icon' }, React.createElement('i', { className: `fas ${icon}` })),
      React.createElement('input', {
        type: isPass ? (show ? 'text' : 'password') : type,
        className: `inp${icon ? ' has-icon' : ''}${error ? ' err' : ''}`,
        ...props
      }),
      isPass && React.createElement('span', { className: 'inp-eye', onClick: () => setShow(s => !s) },
        React.createElement('i', { className: `fas ${show ? 'fa-eye-slash' : 'fa-eye'}` })
      )
    )
  );
}

// =========================================================
//  Select component
// =========================================================
function Select({ label, error, required, options = [], placeholder, ...props }) {
  return React.createElement(FormField, { label, error, required },
    React.createElement('select', { className: `sel${error ? ' err' : ''}`, ...props },
      placeholder && React.createElement('option', { value: '' }, placeholder),
      options.map(opt =>
        React.createElement('option', { key: typeof opt === 'string' ? opt : opt.value, value: typeof opt === 'string' ? opt : opt.value },
          typeof opt === 'string' ? opt : opt.label
        )
      )
    )
  );
}

// =========================================================
//  InfoRow – label: value pair
// =========================================================
function InfoRow({ label, value, icon }) {
  return React.createElement('div', { className: 'flex items-start gap-3 py-3 border-b border-slate-50 last:border-0' },
    icon && React.createElement('div', { className: 'w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 flex-shrink-0 text-sm' },
      React.createElement('i', { className: `fas ${icon}` })
    ),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement('p', { className: 'text-xs text-slate-400 font-500 uppercase tracking-wide mb-0.5' }, label),
      React.createElement('p', { className: 'text-sm font-600 text-slate-700 truncate' }, value || '—')
    )
  );
}

// =========================================================
//  Tabs
// =========================================================
function Tabs({ tabs, active, onChange }) {
  return React.createElement('div', { className: 'flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto' },
    tabs.map(tab =>
      React.createElement('button', {
        key: tab.id,
        onClick: () => onChange(tab.id),
        className: `btn btn-sm flex-shrink-0 transition-all ${active === tab.id ? 'btn-primary shadow-sm' : 'btn-ghost'}`
      },
        tab.icon && React.createElement('i', { className: `fas ${tab.icon}` }),
        tab.label
      )
    )
  );
}
