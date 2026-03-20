// ============================================================
// student.js  –  Student Dashboard (full layout + pages)
// ============================================================

// ---- shared sidebar shell ----
function DashboardShell({ user, navItems, activeTab, setActiveTab, onLogout, children, gradient }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const meta   = ROLE_META[user.role] || {};
  const grad   = gradient || meta.gradient || 'grad-hero';

  const SidebarContent = () =>
    React.createElement('div', { className: 'flex flex-col h-full' },
      // Logo + user
      React.createElement('div', { className: 'p-5 border-b', style:{borderColor:'rgba(255,255,255,0.15)'} },
        React.createElement('div', { className: 'flex items-center gap-2.5 mb-5' },
          React.createElement('div', { className: 'w-9 h-9 rounded-xl flex items-center justify-center text-lg', style:{background:'rgba(255,255,255,0.2)'} },
            React.createElement('i', { className: 'fas fa-university' })
          ),
          React.createElement('div', null,
            React.createElement('div', { className: 'font-extrabold text-sm text-white' }, 'EduManage'),
            React.createElement('div', { className: 'text-xs opacity-60 text-white' }, 'College System')
          )
        ),
        React.createElement('div', { className: 'flex items-center gap-3 p-3 rounded-xl', style:{background:'rgba(255,255,255,0.12)'} },
          React.createElement(Avatar, { name: user.name, size: 38, gradient: 'bg-white/20' }),
          React.createElement('div', { className: 'min-w-0' },
            React.createElement('div', { className: 'text-white font-semibold text-sm truncate' }, user.name),
            React.createElement('div', { className: 'text-white/60 text-xs truncate' }, user.unique_id || user.email),
            React.createElement('span', { className: 'badge badge-' + user.role + ' text-xs mt-0.5 inline-block' }, meta.label || user.role)
          )
        )
      ),

      // Nav links
      React.createElement('nav', { className: 'flex-1 p-4 space-y-1 overflow-y-auto' },
        navItems.map(item =>
          React.createElement('button', {
            key: item.id,
            onClick: () => { setActiveTab(item.id); setMobileOpen(false); },
            className: 'sidebar-item w-full text-left ' + (activeTab === item.id ? 'active' : '')
          },
            React.createElement('i', { className: 'fas ' + item.icon + ' text-sm' }),
            React.createElement('span', null, item.label)
          )
        )
      ),

      // Logout
      React.createElement('div', { className: 'p-4 border-t', style:{borderColor:'rgba(255,255,255,0.15)'} },
        React.createElement('button', {
          onClick: onLogout,
          className: 'sidebar-item w-full text-left text-white/70 hover:text-white'
        },
          React.createElement('i', { className: 'fas fa-right-from-bracket text-sm' }),
          React.createElement('span', null, 'Sign Out')
        )
      )
    );

  return React.createElement('div', { className: 'flex h-screen overflow-hidden bg-slate-50' },
    // Sidebar desktop
    React.createElement('aside', {
      className: grad + ' w-64 flex-shrink-0 hidden lg:flex flex-col',
      style: { boxShadow: '4px 0 24px rgba(0,0,0,0.08)' }
    }, React.createElement(SidebarContent)),

    // Mobile sidebar overlay
    mobileOpen && React.createElement('div', { className: 'fixed inset-0 z-50 flex lg:hidden' },
      React.createElement('div', { className: grad + ' w-72 flex flex-col shadow-2xl' }, React.createElement(SidebarContent)),
      React.createElement('div', { className: 'flex-1 bg-black/50 backdrop-blur-sm', onClick: ()=>setMobileOpen(false) })
    ),

    // Main content
    React.createElement('div', { className: 'flex-1 flex flex-col overflow-hidden' },
      // Top bar
      React.createElement('header', { className: 'bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shadow-sm flex-shrink-0' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('button', { className: 'lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors', onClick: ()=>setMobileOpen(true) },
            React.createElement('i', { className: 'fas fa-bars text-slate-600' })
          ),
          React.createElement('div', null,
            React.createElement('h1', { className: 'font-extrabold text-slate-800 text-base' },
              (navItems.find(n=>n.id===activeTab)?.label || 'Dashboard')
            ),
            React.createElement('p', { className: 'text-xs text-slate-400' },
              new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
            )
          )
        ),
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('div', { className: 'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium', style:{background:'#f8fafc',border:'1px solid #e2e8f0'} },
            React.createElement('div', { className: 'w-2 h-2 bg-green-400 rounded-full' }),
            React.createElement('span', { className: 'text-slate-600 text-xs' }, 'Online')
          ),
          React.createElement(Avatar, { name: user.name, size: 36, gradient: grad }),
          React.createElement('button', { className: 'btn btn-ghost btn-sm hidden sm:flex', onClick: onLogout },
            React.createElement('i', { className: 'fas fa-right-from-bracket' }), 'Logout'
          )
        )
      ),
      // Page body
      React.createElement('main', { className: 'flex-1 overflow-y-auto p-5 lg:p-7' }, children)
    )
  );
}

// ============================================================
//  StudentDashboard
// ============================================================
function StudentDashboard({ user, onLogout, toast }) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [profile,   setProfile]   = React.useState(user);
  const [loading,   setLoading]   = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    API.student.getProfile(user.id)
      .then(p => setProfile(p))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  const navItems = [
    { id:'overview', icon:'fa-house',          label:'Overview'    },
    { id:'profile',  icon:'fa-user-circle',    label:'My Profile'  },
    { id:'academic', icon:'fa-graduation-cap', label:'Academic Info'},
    { id:'courses',  icon:'fa-book-open',      label:'Courses'     },
    { id:'notices',  icon:'fa-bell',           label:'Notices'     },
  ];

  return React.createElement(DashboardShell, {
    user, navItems, activeTab, setActiveTab, onLogout, gradient: 'grad-student'
  },
    activeTab === 'overview'  && React.createElement(StudentOverview,  { user: profile, setActiveTab }),
    activeTab === 'profile'   && React.createElement(StudentProfile,   { user: profile, loading }),
    activeTab === 'academic'  && React.createElement(StudentAcademic,  { user: profile }),
    activeTab === 'courses'   && React.createElement(StudentCourses,   { user: profile }),
    activeTab === 'notices'   && React.createElement(StudentNotices,   { user: profile }),
  );
}

// ---- Overview ----
function StudentOverview({ user, setActiveTab }) {
  const stats = [
    { icon:'fa-book-open',      label:'Enrolled Courses', value:'6',    sub:'Current semester', gradient:'grad-info'    },
    { icon:'fa-percent',        label:'Attendance',       value:'87%',  sub:'Above 75% threshold', gradient:'grad-student' },
    { icon:'fa-star',           label:'CGPA',             value:'8.4',  sub:'Out of 10.0',      gradient:'grad-teacher' },
    { icon:'fa-file-lines',     label:'Assignments',      value:'3',    sub:'Pending submission', gradient:'grad-danger'  },
  ];

  const recent = [
    { icon:'fa-check-circle', color:'text-green-500', text:'Submitted: Data Structures Assignment 3', time:'Today, 10:30 AM' },
    { icon:'fa-calendar',     color:'text-blue-500',  text:'Exam scheduled: Operating Systems – Nov 25', time:'Yesterday' },
    { icon:'fa-bell',         color:'text-yellow-500',text:'Result published: DBMS Mid-semester', time:'2 days ago' },
    { icon:'fa-file-alt',     color:'text-purple-500',text:'New assignment posted: Web Technologies', time:'3 days ago' },
  ];

  return React.createElement('div', { className: 'page-enter' },
    React.createElement('div', { className: 'mb-6 p-5 rounded-2xl grad-student text-white relative overflow-hidden' },
      React.createElement('div',{style:{position:'absolute',right:-30,top:-30,width:140,height:140,borderRadius:'50%',background:'rgba(255,255,255,0.1)'}}),
      React.createElement('div', { className: 'relative z-10' },
        React.createElement('p', { className: 'text-green-100 text-sm' }, 'Welcome back,'),
        React.createElement('h2', { className: 'text-2xl font-extrabold' }, user.name || 'Student'),
        React.createElement('p', { className: 'text-green-100 text-sm mt-1' },
          'ID: ' + (user.unique_id||'—') + '  ·  ' + (user.department||'—') + '  ·  Sem: ' + (user.semester||'—')
        ),
        React.createElement('button', { className: 'mt-3 btn btn-sm text-xs font-semibold', style:{background:'rgba(255,255,255,0.2)',color:'white',border:'1px solid rgba(255,255,255,0.3)'}, onClick:()=>setActiveTab('profile') },
          React.createElement('i',{className:'fas fa-user'}), ' View Profile'
        )
      )
    ),

    React.createElement('div', { className: 'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6' },
      stats.map(s => React.createElement(StatCard, { key: s.label, ...s }))
    ),

    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-5' },
      // Recent activity
      React.createElement('div', { className: 'card p-5' },
        React.createElement(PageHeader, { icon:'fa-clock-rotate-left', title:'Recent Activity', subtitle:'Your latest updates' }),
        React.createElement('div', { className: 'space-y-3' },
          recent.map((r,i) =>
            React.createElement('div', { key: i, className: 'flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors' },
              React.createElement('i', { className: 'fas ' + r.icon + ' ' + r.color + ' mt-0.5 text-sm flex-shrink-0' }),
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm text-slate-700' }, r.text),
                React.createElement('p', { className: 'text-xs text-slate-400 mt-0.5' }, r.time)
              )
            )
          )
        )
      ),

      // Upcoming
      React.createElement('div', { className: 'card p-5' },
        React.createElement(PageHeader, { icon:'fa-calendar-days', title:'Upcoming', subtitle:'Exams & deadlines' }),
        React.createElement('div', { className: 'space-y-3' },
          [
            { subject:'Operating Systems',   type:'Exam',           date:'Nov 25, 2024', color:'bg-red-100 text-red-600'    },
            { subject:'Web Technologies',    type:'Assignment Due', date:'Nov 22, 2024', color:'bg-orange-100 text-orange-600' },
            { subject:'Data Structures',     type:'Lab Practical',  date:'Nov 28, 2024', color:'bg-blue-100 text-blue-600'   },
            { subject:'Computer Networks',   type:'Quiz',           date:'Dec 2, 2024',  color:'bg-purple-100 text-purple-600' },
          ].map((ev,i) =>
            React.createElement('div', { key:i, className:'flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors' },
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-semibold text-slate-700' }, ev.subject),
                React.createElement('span', { className: 'badge ' + ev.color }, ev.type)
              ),
              React.createElement('p', { className: 'text-xs text-slate-500 font-medium' }, ev.date)
            )
          )
        )
      )
    )
  );
}

// ---- Profile ----
function StudentProfile({ user, loading }) {
  if (loading) return React.createElement('div', { className: 'flex items-center justify-center h-60' }, React.createElement(Spinner));

  return React.createElement('div', { className: 'page-enter max-w-2xl' },
    React.createElement(PageHeader, { icon:'fa-user-circle', title:'My Profile', subtitle:'Your account & academic details' }),

    // Avatar card
    React.createElement('div', { className: 'card p-6 mb-5' },
      React.createElement('div', { className: 'flex items-center gap-5' },
        React.createElement(Avatar, { name: user.name || '', size: 72, gradient: 'grad-student' }),
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-xl font-extrabold text-slate-800' }, user.name || '—'),
          React.createElement('p', { className: 'text-slate-500 text-sm' }, user.email || '—'),
          React.createElement('div', { className: 'flex items-center gap-2 mt-2' },
            React.createElement(RoleBadge, { role:'student' }),
            user.unique_id && React.createElement('span', { className: 'badge badge-blue' }, user.unique_id)
          )
        )
      )
    ),

    // Details
    React.createElement('div', { className: 'card p-5' },
      React.createElement('h4', { className: 'font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide' }, 'Personal Information'),
      React.createElement(InfoRow, { icon:'fa-user',          label:'Full Name',   value: user.name       }),
      React.createElement(InfoRow, { icon:'fa-envelope',      label:'Email',       value: user.email      }),
      React.createElement(InfoRow, { icon:'fa-id-badge',      label:'Student ID',  value: user.unique_id  }),
      React.createElement(InfoRow, { icon:'fa-building-columns', label:'Department', value: user.department }),
      React.createElement(InfoRow, { icon:'fa-layer-group',   label:'Semester',    value: user.semester   }),
      React.createElement(InfoRow, { icon:'fa-calendar',      label:'Joined',      value: user.created_at }),
      React.createElement(InfoRow, { icon:'fa-circle-dot',    label:'Status',      value: 'Active'        })
    )
  );
}

// ---- Academic ----
function StudentAcademic({ user }) {
  const subjects = [
    { code:'CS501', name:'Data Structures & Algorithms', credits:4, grade:'A+', marks:92, attendance:88 },
    { code:'CS502', name:'Operating Systems',            credits:4, grade:'A',  marks:84, attendance:80 },
    { code:'CS503', name:'Database Management Systems',  credits:3, grade:'B+', marks:76, attendance:75 },
    { code:'CS504', name:'Computer Networks',            credits:4, grade:'A',  marks:86, attendance:90 },
    { code:'CS505', name:'Web Technologies',             credits:3, grade:'A+', marks:95, attendance:95 },
    { code:'CS506', name:'Software Engineering',         credits:3, grade:'B',  marks:70, attendance:72 },
  ];
  const gradeColor = { 'A+':'badge-green','A':'badge-blue','B+':'badge-blue','B':'badge-blue','C':'badge-red' };

  return React.createElement('div', { className: 'page-enter' },
    React.createElement(PageHeader, { icon:'fa-graduation-cap', title:'Academic Information', subtitle:'Grades, marks & attendance' }),

    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6' },
      [
        { icon:'fa-award',   label:'CGPA',       value:'8.4',  gradient:'grad-student' },
        { icon:'fa-percent', label:'Attendance',  value:'83.3%',gradient:'grad-teacher' },
        { icon:'fa-trophy',  label:'Class Rank',  value:'12',  gradient:'grad-info'    },
      ].map(s => React.createElement(StatCard, { key:s.label, ...s }))
    ),

    React.createElement('div', { className: 'card overflow-hidden' },
      React.createElement('div', { className: 'p-5 border-b border-slate-100 flex items-center justify-between' },
        React.createElement('h4', { className: 'font-bold text-slate-700' }, 'Subject-wise Performance'),
        React.createElement('span', { className: 'badge badge-blue' }, user.semester || 'Sem 3')
      ),
      React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('table', { className: 'tbl' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              ['Code','Subject','Credits','Marks','Grade','Attendance'].map(h =>
                React.createElement('th', { key:h }, h)
              )
            )
          ),
          React.createElement('tbody', null,
            subjects.map(s =>
              React.createElement('tr', { key:s.code },
                React.createElement('td', null, React.createElement('span', {className:'badge badge-blue'}, s.code)),
                React.createElement('td', { className:'font-medium text-slate-700' }, s.name),
                React.createElement('td', { className:'text-center' }, s.credits),
                React.createElement('td', null,
                  React.createElement('div', { className:'flex items-center gap-2' },
                    React.createElement('div', { className:'flex-1 bg-slate-100 rounded-full h-1.5', style:{minWidth:60} },
                      React.createElement('div', { className:'bg-blue-500 h-1.5 rounded-full', style:{width:s.marks+'%'} })
                    ),
                    React.createElement('span', { className:'text-xs font-medium text-slate-600 w-8' }, s.marks)
                  )
                ),
                React.createElement('td', null, React.createElement('span', {className:'badge '+(gradeColor[s.grade]||'badge-blue')}, s.grade)),
                React.createElement('td', null,
                  React.createElement('span', { className:'badge '+(s.attendance>=75?'badge-green':'badge-red') }, s.attendance+'%')
                )
              )
            )
          )
        )
      )
    )
  );
}

// ---- Courses ----
function StudentCourses({ user }) {
  const courses = [
    { code:'CS501', name:'Data Structures & Algorithms', teacher:'Dr. Anil Kumar',   credits:4, time:'Mon/Wed 9-10AM',   room:'CS-101', status:'Active' },
    { code:'CS502', name:'Operating Systems',            teacher:'Prof. Sunita Rao',  credits:4, time:'Tue/Thu 11-12PM',  room:'CS-201', status:'Active' },
    { code:'CS503', name:'Database Management Systems',  teacher:'Dr. Priya Nair',    credits:3, time:'Mon/Fri 2-3PM',    room:'CS-301', status:'Active' },
    { code:'CS504', name:'Computer Networks',            teacher:'Prof. Raj Kumar',   credits:4, time:'Wed/Fri 10-11AM',  room:'CS-102', status:'Active' },
    { code:'CS505', name:'Web Technologies',             teacher:'Dr. Meera Singh',   credits:3, time:'Tue/Thu 2-3PM',    room:'CS-Lab1', status:'Active'},
    { code:'CS506', name:'Software Engineering',         teacher:'Prof. Arjun Patel', credits:3, time:'Mon/Wed/Fri 3-4PM',room:'CS-202', status:'Active' },
  ];

  return React.createElement('div', { className: 'page-enter' },
    React.createElement(PageHeader, { icon:'fa-book-open', title:'My Courses', subtitle:'Current semester enrolment' }),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' },
      courses.map(c =>
        React.createElement('div', { key:c.code, className:'card p-5 hover:shadow-md transition-all' },
          React.createElement('div', { className:'flex items-start justify-between mb-3' },
            React.createElement('span', {className:'badge badge-blue'}, c.code),
            React.createElement('span', {className:'badge badge-green'}, c.credits+' Credits')
          ),
          React.createElement('h4', { className:'font-bold text-slate-800 mb-1' }, c.name),
          React.createElement('p', { className:'text-xs text-slate-500 mb-3' },
            React.createElement('i',{className:'fas fa-user-tie mr-1'}), c.teacher
          ),
          React.createElement('div', { className:'space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3' },
            React.createElement('p', null, React.createElement('i',{className:'fas fa-clock mr-1.5 text-blue-400'}), c.time),
            React.createElement('p', null, React.createElement('i',{className:'fas fa-door-open mr-1.5 text-blue-400'}), c.room)
          )
        )
      )
    )
  );
}

// ---- Notices ----
function StudentNotices() {
  const notices = [
    { title:'Mid-Semester Examination Schedule', date:'Nov 18, 2024', type:'Exam',      priority:'high',   body:'Mid-semester exams will be conducted from Nov 25 to Dec 5. Timetable is attached on the college notice board.' },
    { title:'Project Submission Deadline',       date:'Nov 15, 2024', type:'Academic',  priority:'medium', body:'All final-year project reports must be submitted to the project coordinator by November 30, 2024.' },
    { title:'Annual Cultural Fest – Culturenex', date:'Nov 10, 2024', type:'Event',     priority:'low',    body:'The annual cultural festival will be held on December 15-16. Register your team by December 1.' },
    { title:'Library Renovation Notice',         date:'Nov 5, 2024',  type:'General',   priority:'low',    body:'The main library will be closed for renovation from Nov 20-22. Use the digital library portal in the meantime.' },
  ];
  const pColor = { high:'badge-red', medium:'badge badge-blue', low:'badge-green' };

  return React.createElement('div', { className:'page-enter' },
    React.createElement(PageHeader, { icon:'fa-bell', title:'Notices & Announcements', subtitle:'Latest updates from college administration' }),
    React.createElement('div', { className:'space-y-4' },
      notices.map((n,i) =>
        React.createElement('div', { key:i, className:'card p-5 hover:shadow-md transition-all' },
          React.createElement('div', { className:'flex items-start justify-between gap-3 mb-2' },
            React.createElement('h4', { className:'font-bold text-slate-800 text-base' }, n.title),
            React.createElement('div', { className:'flex gap-2 flex-shrink-0' },
              React.createElement('span', {className:'badge badge-blue'}, n.type),
              React.createElement('span', {className:'badge '+(n.priority==='high'?'badge-red':n.priority==='medium'?'badge-blue':'badge-green')}, n.priority)
            )
          ),
          React.createElement('p', { className:'text-sm text-slate-500 mb-2 leading-relaxed' }, n.body),
          React.createElement('p', { className:'text-xs text-slate-400' },
            React.createElement('i',{className:'fas fa-calendar-day mr-1'}), n.date
          )
        )
      )
    )
  );
}
