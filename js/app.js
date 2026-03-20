// ============================================================
// app.js  –  Main App component (auth-based router)
// Ties together: Login → Register → Role-specific Dashboards
// ============================================================

// ============================================================
//  Root App
// ============================================================
function App() {
  const { toasts, toast, removeToast } = useToast();

  // ---- Auth state ----
  const [user, setUser] = React.useState(() => {
    const saved = Storage.get('cms_user');
    const token = Storage.get('cms_token');
    if (saved && token && !isTokenExpired(token)) return saved;
    Storage.remove('cms_user');
    Storage.remove('cms_token');
    return null;
  });

  // ---- Current page (login | register | app) ----
  const [page, setPage] = React.useState(user ? 'app' : 'login');

  function handleLogin(userData) {
    setUser(userData);
    setPage('app');
  }

  function handleLogout() {
    Storage.remove('cms_token');
    Storage.remove('cms_user');
    setUser(null);
    setPage('login');
    toast('You have been signed out.', 'info');
  }

  function navigate(to) { setPage(to); }

  return React.createElement(React.Fragment, null,
    // Toast container
    React.createElement(Toast, { toasts, removeToast }),

    // Page routing
    page === 'login'    && React.createElement(LoginPage,    { onNavigate:navigate, onLogin:handleLogin,   toast }),
    page === 'register' && React.createElement(RegisterPage, { onNavigate:navigate, toast }),
    page === 'app'      && user && React.createElement(MainApp, { user, onLogout:handleLogout, toast })
  );
}

// ============================================================
//  MainApp  – post-login shell (delegates to role dashboard)
// ============================================================
function MainApp({ user, onLogout, toast }) {
  switch (user.role) {
    case 'admin':   return React.createElement(AdminDashboard,   { user, onLogout, toast });
    case 'teacher': return React.createElement(TeacherDashboard, { user, onLogout, toast });
    case 'student': return React.createElement(StudentDashboard, { user, onLogout, toast });
    default:        return React.createElement(StudentDashboard, { user, onLogout, toast });
  }
}

// ============================================================
//  Bootstrap
// ============================================================
const rootEl = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(rootEl);
reactRoot.render(React.createElement(App));
