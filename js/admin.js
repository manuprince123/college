// ============================================================
// admin.js  –  Admin Dashboard (complete)
// ============================================================

// ============================================================
//  AdminDashboard – root component
// ============================================================
function AdminDashboard({ user, onLogout, toast }) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [users,    setUsers]    = React.useState([]);
  const [stats,    setStats]    = React.useState(null);
  const [loading,  setLoading]  = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      API.admin.getUsers(),
      API.admin.getStats(),
    ])
      .then(([u, s]) => { setUsers(Array.isArray(u) ? u : []); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const navItems = [
    { id:'overview',   icon:'fa-house',          label:'Overview'     },
    { id:'users',      icon:'fa-users',          label:'Users'        },
    { id:'teachers',   icon:'fa-chalkboard-user',label:'Teachers'     },
    { id:'students',   icon:'fa-user-graduate',  label:'Students'     },
    { id:'bookings',   icon:'fa-calendar-check', label:'Bookings'     },
    { id:'reports',    icon:'fa-chart-bar',      label:'Reports'      },
    { id:'profile',    icon:'fa-user-circle',    label:'Profile'      },
    { id:'notices',    icon:'fa-bell',           label:'Notices'      },
  ];

  const refreshUsers = () => {
    API.admin.getUsers().then(u => setUsers(Array.isArray(u) ? u : [])).catch(()=>{});
    API.admin.getStats().then(s => setStats(s)).catch(()=>{});
  };

  return React.createElement(DashboardShell, {
    user, navItems, activeTab, setActiveTab, onLogout, gradient: 'grad-admin'
  },
    activeTab === 'overview' && React.createElement(AdminOverview,  { user, users, stats, loading, setActiveTab }),
    activeTab === 'users'    && React.createElement(AdminUsers,     { user, users, loading, toast, refreshUsers }),
    activeTab === 'teachers' && React.createElement(AdminTeachers,  { users: users.filter(u => u.role === 'teacher') }),
    activeTab === 'students' && React.createElement(AdminStudents,  { users: users.filter(u => u.role === 'student') }),
    activeTab === 'bookings' && React.createElement(AdminBookings,  { toast }),
    activeTab === 'reports'  && React.createElement(AdminReports,   { users, stats }),
    activeTab === 'profile'  && React.createElement(AdminProfile,   { user }),
    activeTab === 'notices'  && React.createElement(AdminNotices,   {}),
  );
}

// ============================================================
//  Overview
// ============================================================
function AdminOverview({ user, users, stats, loading, setActiveTab }) {
  const s = stats || {};
  const statCards = [
    { icon:'fa-users',           label:'Total Users',    value: loading ? '…' : (s.total    || users.length), sub:'All roles combined',  gradient:'grad-admin'   },
    { icon:'fa-user-graduate',   label:'Students',       value: loading ? '…' : (s.students || 0),            sub:'Currently enrolled',  gradient:'grad-student' },
    { icon:'fa-chalkboard-user', label:'Teachers',       value: loading ? '…' : (s.teachers || 0),            sub:'Active faculty',       gradient:'grad-teacher' },
    { icon:'fa-shield-halved',   label:'Admins',         value: loading ? '…' : (s.admins   || 1),            sub:'System admins',        gradient:'grad-info'    },
  ];

  const recentUsers = s.recentUsers || users.slice(-4).reverse();

  return React.createElement('div', { className:'page-enter space-y-6' },
    // Welcome banner
    React.createElement('div', { className:'grad-admin rounded-2xl p-6 text-white relative overflow-hidden' },
      React.createElement('div',{style:{position:'absolute',right:-20,top:-30,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}),
      React.createElement('div',{style:{position:'absolute',left:-30,bottom:-30,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}),
      React.createElement('div', { className:'relative z-10' },
        React.createElement('p', { className:'text-purple-200 text-sm' }, '🛡️ Admin Control Panel'),
        React.createElement('h2', { className:'text-2xl font-extrabold mt-0.5' }, 'Welcome, ' + (user.name || 'Admin') + '!'),
        React.createElement('p', { className:'text-purple-200 text-sm mt-1' }, 'ID: ' + (user.unique_id || 'ADM001') + '  ·  Full system access'),
        React.createElement('div', { className:'flex gap-3 mt-4' },
          React.createElement('button', { className:'btn btn-sm', style:{background:'rgba(255,255,255,0.2)',color:'#fff',border:'1px solid rgba(255,255,255,0.3)'}, onClick:()=>setActiveTab('users') },
            React.createElement('i', { className:'fas fa-users' }), ' Manage Users'
          ),
          React.createElement('button', { className:'btn btn-sm', style:{background:'rgba(255,255,255,0.14)',color:'#fff',border:'1px solid rgba(255,255,255,0.2)'}, onClick:()=>setActiveTab('reports') },
            React.createElement('i', { className:'fas fa-chart-bar' }), ' Reports'
          )
        )
      )
    ),

    // Stat cards
    React.createElement('div', { className:'grid grid-cols-2 lg:grid-cols-4 gap-4' },
      statCards.map((sc, i) =>
        React.createElement(StatCard, { key:i, icon:sc.icon, label:sc.label, value:sc.value, sub:sc.sub, gradient:sc.gradient })
      )
    ),

    // Recent Users + Quick Actions
    React.createElement('div', { className:'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      // Recent registrations
      React.createElement('div', { className:'lg:col-span-2 card p-6' },
        React.createElement('div', { className:'flex items-center justify-between mb-4' },
          React.createElement('h3', { className:'font-bold text-slate-800' }, '🕐 Recent Registrations'),
          React.createElement('button', { className:'btn btn-sm btn-ghost', onClick:()=>setActiveTab('users') }, 'View All →')
        ),
        React.createElement('div', { className:'space-y-3' },
          recentUsers.length === 0
            ? React.createElement(EmptyState, { icon:'fa-users', title:'No users yet' })
            : recentUsers.map((u, i) =>
                React.createElement('div', { key:u.id || i, className:'flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors' },
                  React.createElement(Avatar, { name:u.name, size:40, gradient:'grad-' + (u.role||'hero') }),
                  React.createElement('div', { className:'flex-1 min-w-0' },
                    React.createElement('p', { className:'font-semibold text-slate-800 text-sm' }, u.name),
                    React.createElement('p', { className:'text-xs text-slate-500' }, u.email + '  ·  ' + (u.unique_id || ''))
                  ),
                  React.createElement(RoleBadge, { role:u.role })
                )
              )
        )
      ),

      // Quick actions
      React.createElement('div', { className:'card p-6' },
        React.createElement('h3', { className:'font-bold text-slate-800 mb-4' }, '⚡ Quick Actions'),
        React.createElement('div', { className:'space-y-2.5' },
          [
            { icon:'fa-user-plus',     label:'Add New User',    tab:'users',    bg:'bg-purple-50 text-purple-600' },
            { icon:'fa-user-graduate', label:'View Students',   tab:'students', bg:'bg-green-50 text-green-600'  },
            { icon:'fa-chalkboard',    label:'View Teachers',   tab:'teachers', bg:'bg-yellow-50 text-yellow-700'},
            { icon:'fa-calendar-check',label:'Room Bookings',   tab:'bookings', bg:'bg-blue-50 text-blue-600'   },
            { icon:'fa-chart-bar',     label:'Analytics',       tab:'reports',  bg:'bg-red-50 text-red-600'     },
          ].map((a, i) =>
            React.createElement('button', { key:i, className:'w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left', onClick:()=>setActiveTab(a.tab) },
              React.createElement('div', { className:`w-9 h-9 ${a.bg} rounded-lg flex items-center justify-center text-sm` },
                React.createElement('i', { className:'fas ' + a.icon })
              ),
              React.createElement('span', { className:'font-medium text-slate-700 text-sm' }, a.label),
              React.createElement('i', { className:'fas fa-chevron-right text-slate-300 text-xs ml-auto' })
            )
          )
        )
      )
    )
  );
}

// ============================================================
//  Users Management
// ============================================================
function AdminUsers({ user: currentUser, users, loading, toast, refreshUsers }) {
  const [search,      setSearch]     = React.useState('');
  const [roleFilter,  setRoleFilter] = React.useState('');
  const [showAdd,     setShowAdd]    = React.useState(false);
  const [showConfirm, setConfirm]    = React.useState(null);
  const [deleting,    setDeleting]   = React.useState(false);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.unique_id?.toLowerCase().includes(q);
    const matchR = !roleFilter || u.role === roleFilter;
    return matchQ && matchR;
  });

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await API.admin.deleteUser(id);
      toast('User deleted successfully', 'success');
      refreshUsers();
      setConfirm(null);
    } catch (e) {
      toast(e.message || 'Delete failed', 'error');
    } finally { setDeleting(false); }
  }

  return React.createElement('div', { className:'page-enter space-y-5' },
    React.createElement(PageHeader, {
      icon:'fa-users', title:'User Management', subtitle:'Manage all system users',
      action: React.createElement('button', { className:'btn btn-primary btn-sm', onClick:()=>setShowAdd(true) },
        React.createElement('i',{className:'fas fa-user-plus'}), ' Add User'
      )
    }),

    // Search + filter
    React.createElement('div', { className:'card p-4 flex flex-col sm:flex-row gap-3' },
      React.createElement('div', { className:'inp-wrap flex-1' },
        React.createElement('span', { className:'inp-icon' }, React.createElement('i',{className:'fas fa-search'})),
        React.createElement('input', { className:'inp has-icon', placeholder:'Search by name, email or ID…', value:search, onChange:e=>setSearch(e.target.value) })
      ),
      React.createElement('select', { className:'sel w-auto min-w-36', value:roleFilter, onChange:e=>setRoleFilter(e.target.value) },
        React.createElement('option',{value:''},'All Roles'),
        React.createElement('option',{value:'student'},'🎓 Students'),
        React.createElement('option',{value:'teacher'},'📚 Teachers'),
        React.createElement('option',{value:'admin'},'🛡️ Admins'),
      )
    ),

    // Table
    React.createElement('div', { className:'card overflow-x-auto' },
      React.createElement('table', { className:'tbl' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            ['User','ID','Email','Role','Dept / Semester','Joined','Actions'].map(h =>
              React.createElement('th', { key:h }, h)
            )
          )
        ),
        React.createElement('tbody', null,
          loading
            ? Array.from({length:4}).map((_,i) => React.createElement(SkeletonRow, { key:i, cols:7 }))
            : filtered.length === 0
              ? React.createElement('tr', null,
                  React.createElement('td', { colSpan:7, className:'text-center py-10 text-slate-400' },
                    React.createElement('i',{className:'fas fa-search text-3xl mb-3 block'}), 'No users found'
                  )
                )
              : filtered.map(u =>
                  React.createElement('tr', { key:u.id },
                    React.createElement('td', null,
                      React.createElement('div',{className:'flex items-center gap-2.5'},
                        React.createElement(Avatar,{name:u.name,size:34,gradient:'grad-'+(u.role||'hero')}),
                        React.createElement('span',{className:'font-semibold text-slate-800 text-sm'},u.name)
                      )
                    ),
                    React.createElement('td', null, React.createElement('span',{className:'font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600'},u.unique_id||'—')),
                    React.createElement('td', null, React.createElement('span',{className:'text-xs text-slate-500'},u.email)),
                    React.createElement('td', null, React.createElement(RoleBadge,{role:u.role})),
                    React.createElement('td', null, React.createElement('span',{className:'text-xs text-slate-500'}, u.department || (u.semester ? 'Sem '+u.semester : '—'))),
                    React.createElement('td', null, React.createElement('span',{className:'text-xs text-slate-400'}, u.created_at || '—')),
                    React.createElement('td', null,
                      React.createElement('div',{className:'flex gap-1'},
                        currentUser.id !== u.id && u.role !== 'admin' && React.createElement('button',{
                          className:'btn btn-xs btn-danger',
                          onClick:()=>setConfirm(u),
                          title:'Delete user'
                        }, React.createElement('i',{className:'fas fa-trash'}))
                      )
                    )
                  )
                )
        )
      )
    ),

    React.createElement('p', { className:'text-xs text-slate-400 pl-1' },
      'Showing ', filtered.length, ' of ', users.length, ' users'
    ),

    // Confirm delete modal
    React.createElement(ConfirmModal, {
      open:    !!showConfirm,
      onClose: ()=>setConfirm(null),
      onConfirm: ()=>handleDelete(showConfirm.id),
      title:   'Delete User',
      message: `Are you sure you want to permanently delete "${showConfirm?.name}"? This action cannot be undone.`,
      confirmLabel: ' Delete',
      danger:  true,
      loading: deleting,
    }),

    // Add user modal
    React.createElement(AddUserModal, { open:showAdd, onClose:()=>setShowAdd(false), toast, onSuccess:()=>{ refreshUsers(); setShowAdd(false); } })
  );
}

// ============================================================
//  AddUserModal
// ============================================================
function AddUserModal({ open, onClose, toast, onSuccess }) {
  const [form, setForm]     = React.useState({ name:'', email:'', password:'', role:'student', department:'', semester:'' });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  async function handleSave() {
    const errs = {};
    if (!validateName(form.name))        errs.name     = 'Enter full name';
    if (!validateEmail(form.email))      errs.email    = 'Enter valid email';
    if (!validatePassword(form.password))errs.password = 'Min 6 characters';
    if (!form.role)                      errs.role     = 'Select role';
    if (form.role !== 'admin' && !form.department) errs.department = 'Select department';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const extra = {};
      if (form.role !== 'admin') extra.department = form.department;
      if (form.role === 'student') extra.semester = form.semester || '1st';
      const data = await API.register(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.role, extra);
      toast('✅ User created! ID: ' + data.user.unique_id, 'success', 5000);
      setForm({ name:'', email:'', password:'', role:'student', department:'', semester:'' });
      onSuccess();
    } catch(e) {
      toast(e.message || 'Failed to create user', 'error');
      if (e.message?.toLowerCase().includes('email')) setErrors({email: e.message});
    } finally { setSaving(false); }
  }

  return React.createElement(Modal, { open, onClose, title:'➕ Add New User',
    footer: React.createElement(React.Fragment, null,
      React.createElement('button',{className:'btn btn-ghost', onClick:onClose, disabled:saving},'Cancel'),
      React.createElement('button',{className:'btn btn-primary', onClick:handleSave, disabled:saving},
        saving ? React.createElement(Spinner,{small:true,white:true}) : React.createElement('i',{className:'fas fa-user-plus'}),
        ' ', saving?'Creating…':'Create User'
      )
    )
  },
    React.createElement(Input, { label:'Full Name', required:true, icon:'fa-user', placeholder:'e.g. Rahul Verma', value:form.name, onChange:e=>set('name',e.target.value), error:errors.name }),
    React.createElement(Input, { label:'Email', required:true, icon:'fa-envelope', type:'email', placeholder:'user@college.edu', value:form.email, onChange:e=>set('email',e.target.value), error:errors.email }),
    React.createElement(Input, { label:'Password', required:true, icon:'fa-lock', type:'password', placeholder:'Min 6 chars', value:form.password, onChange:e=>set('password',e.target.value), error:errors.password }),
    React.createElement(Select, { label:'Role', required:true, value:form.role, onChange:e=>set('role',e.target.value), error:errors.role,
      options:[{value:'student',label:'🎓 Student'},{value:'teacher',label:'📚 Teacher'},{value:'admin',label:'🛡️ Admin'}]
    }),
    form.role !== 'admin' && React.createElement(Select, { label:'Department', required:true, value:form.department, onChange:e=>set('department',e.target.value), error:errors.department, placeholder:'Select department…', options:DEPARTMENTS }),
    form.role === 'student' && React.createElement(Select, { label:'Semester', value:form.semester, onChange:e=>set('semester',e.target.value), placeholder:'Select semester…', options:SEMESTERS }),
  );
}

// ============================================================
//  Teachers sub-view
// ============================================================
function AdminTeachers({ users }) {
  const teachers = users || [];
  return React.createElement('div', { className:'page-enter space-y-5' },
    React.createElement(PageHeader, { icon:'fa-chalkboard-user', title:'Faculty Directory', subtitle:teachers.length + ' faculty members registered' }),
    teachers.length === 0
      ? React.createElement(EmptyState, { icon:'fa-chalkboard-user', title:'No teachers yet', subtitle:'Register teachers via the Users tab' })
      : React.createElement('div', { className:'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' },
          teachers.map(t =>
            React.createElement('div', { key:t.id, className:'card p-5 hover:shadow-md transition-all' },
              React.createElement('div', { className:'flex items-center gap-3 mb-4' },
                React.createElement(Avatar, { name:t.name, size:48, gradient:'grad-teacher' }),
                React.createElement('div', null,
                  React.createElement('h4', { className:'font-bold text-slate-800' }, t.name),
                  React.createElement('p', { className:'text-xs text-slate-500' }, t.unique_id || '—')
                )
              ),
              React.createElement(InfoRow, { label:'Email',      value:t.email,      icon:'fa-envelope' }),
              React.createElement(InfoRow, { label:'Department', value:t.department, icon:'fa-building'  }),
              React.createElement(InfoRow, { label:'Joined',     value:t.created_at, icon:'fa-calendar'  }),
            )
          )
        )
  );
}

// ============================================================
//  Students sub-view
// ============================================================
function AdminStudents({ users }) {
  const students = users || [];
  const [search, setSearch] = React.useState('');
  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  return React.createElement('div', { className:'page-enter space-y-5' },
    React.createElement(PageHeader, { icon:'fa-user-graduate', title:'Student Directory', subtitle:students.length + ' students registered' }),
    React.createElement('div', { className:'card p-4' },
      React.createElement('div', { className:'inp-wrap' },
        React.createElement('span',{className:'inp-icon'},React.createElement('i',{className:'fas fa-search'})),
        React.createElement('input',{ className:'inp has-icon', placeholder:'Search students…', value:search, onChange:e=>setSearch(e.target.value) })
      )
    ),
    filtered.length === 0
      ? React.createElement(EmptyState, { icon:'fa-user-graduate', title:'No students found' })
      : React.createElement('div', { className:'card overflow-x-auto' },
          React.createElement('table', { className:'tbl' },
            React.createElement('thead',null,
              React.createElement('tr',null,
                ['Student','ID','Email','Department','Semester','Joined'].map(h => React.createElement('th',{key:h},h))
              )
            ),
            React.createElement('tbody',null,
              filtered.map(s =>
                React.createElement('tr',{key:s.id},
                  React.createElement('td',null,
                    React.createElement('div',{className:'flex items-center gap-2.5'},
                      React.createElement(Avatar,{name:s.name,size:34,gradient:'grad-student'}),
                      React.createElement('span',{className:'font-semibold text-slate-800 text-sm'},s.name)
                    )
                  ),
                  React.createElement('td',null, React.createElement('span',{className:'font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-lg'},s.unique_id||'—')),
                  React.createElement('td',null, React.createElement('span',{className:'text-xs text-slate-500'},s.email)),
                  React.createElement('td',null, React.createElement('span',{className:'text-xs text-slate-600'},s.department||'—')),
                  React.createElement('td',null, React.createElement('span',{className:'badge badge-student text-xs'},s.semester||'—')),
                  React.createElement('td',null, React.createElement('span',{className:'text-xs text-slate-400'},s.created_at||'—')),
                )
              )
            )
          )
        )
  );
}

// ============================================================
//  Bookings sub-view
// ============================================================
function AdminBookings({ toast }) {
  const [bookings, setBookings] = React.useState([
    { id:1, room:'CS Lab 1',      bookedBy:'Prof. Raj Kumar',    date:'2025-08-12', time:'11:00-13:00', purpose:'Practical Exam',  status:'approved' },
    { id:2, room:'Seminar Hall',  bookedBy:'Prof. Priya Nair',   date:'2025-08-13', time:'09:00-11:00', purpose:'Guest Lecture',   status:'pending'  },
    { id:3, room:'Room 102',      bookedBy:'Prof. Anjali Menon', date:'2025-08-14', time:'09:00-11:00', purpose:'Lecture',         status:'approved' },
    { id:4, room:'Conference Rm', bookedBy:'Admin Team',         date:'2025-08-12', time:'14:00-16:00', purpose:'Faculty Meeting', status:'approved' },
    { id:5, room:'Auditorium',    bookedBy:'Student Council',    date:'2025-08-20', time:'10:00-17:00', purpose:'College Fest',    status:'pending'  },
  ]);

  function approve(id) {
    setBookings(prev => prev.map(b => b.id===id ? {...b, status:'approved'} : b));
    toast('✅ Booking approved', 'success');
  }
  function reject(id) {
    setBookings(prev => prev.map(b => b.id===id ? {...b, status:'rejected'} : b));
    toast('Booking rejected', 'warn');
  }

  const statusBadge = s =>
    React.createElement('span', { className:'badge ' + (s==='approved'?'badge-green':s==='pending'?'badge-blue':'badge-red') }, s);

  return React.createElement('div', { className:'page-enter space-y-5' },
    React.createElement(PageHeader, { icon:'fa-calendar-check', title:'Room Booking Requests', subtitle:'Approve or reject booking requests' }),
    React.createElement('div', { className:'card overflow-x-auto' },
      React.createElement('table', { className:'tbl' },
        React.createElement('thead',null,
          React.createElement('tr',null,['Room','Requested By','Date','Time','Purpose','Status','Actions'].map(h=>React.createElement('th',{key:h},h)))
        ),
        React.createElement('tbody',null,
          bookings.map(b =>
            React.createElement('tr',{key:b.id},
              React.createElement('td',null,React.createElement('span',{className:'font-semibold text-slate-800 text-sm'},b.room)),
              React.createElement('td',null,React.createElement('span',{className:'text-sm text-slate-600'},b.bookedBy)),
              React.createElement('td',null,React.createElement('span',{className:'text-xs text-slate-500'},b.date)),
              React.createElement('td',null,React.createElement('span',{className:'text-xs text-slate-500'},b.time)),
              React.createElement('td',null,React.createElement('span',{className:'text-xs text-slate-600'},b.purpose)),
              React.createElement('td',null,statusBadge(b.status)),
              React.createElement('td',null,
                b.status === 'pending'
                  ? React.createElement('div',{className:'flex gap-1'},
                      React.createElement('button',{className:'btn btn-xs btn-success',onClick:()=>approve(b.id)},React.createElement('i',{className:'fas fa-check'}),' OK'),
                      React.createElement('button',{className:'btn btn-xs btn-danger', onClick:()=>reject(b.id)}, React.createElement('i',{className:'fas fa-xmark'}),' Reject')
                    )
                  : React.createElement('span',{className:'text-xs text-slate-400'},'—')
              )
            )
          )
        )
      )
    )
  );
}

// ============================================================
//  Reports sub-view
// ============================================================
function AdminReports({ users, stats }) {
  const s = stats || {};
  const total    = s.total    || users.length;
  const students = s.students || users.filter(u=>u.role==='student').length;
  const teachers = s.teachers || users.filter(u=>u.role==='teacher').length;
  const admins   = s.admins   || users.filter(u=>u.role==='admin').length;

  const reportItems = [
    { label:'Total Registered Users',   value: total,    icon:'fa-users',          gradient:'grad-admin'   },
    { label:'Student Count',            value: students, icon:'fa-user-graduate',  gradient:'grad-student' },
    { label:'Teacher / Faculty Count',  value: teachers, icon:'fa-chalkboard-user',gradient:'grad-teacher' },
    { label:'Admin Count',              value: admins,   icon:'fa-shield-halved',  gradient:'grad-info'    },
    { label:'Departments Active',       value:'10',      icon:'fa-building',       gradient:'grad-hero'    },
    { label:'Room Bookings This Month', value:'47',      icon:'fa-calendar-check', gradient:'grad-danger'  },
  ];

  return React.createElement('div', { className:'page-enter space-y-5' },
    React.createElement(PageHeader, { icon:'fa-chart-bar', title:'System Reports & Analytics', subtitle:'Snapshot of current system usage' }),
    React.createElement('div', { className:'grid grid-cols-2 lg:grid-cols-3 gap-5' },
      reportItems.map((r, i) =>
        React.createElement(StatCard, { key:i, icon:r.icon, label:r.label, value:r.value, gradient:r.gradient })
      )
    ),

    // Distribution table
    React.createElement('div', { className:'card p-6' },
      React.createElement('h3', { className:'font-bold text-slate-800 mb-4' }, '📊 User Role Distribution'),
      React.createElement('div', { className:'space-y-4' },
        [
          { label:'Students', count:students, total, color:'grad-student', clr:'#10b981' },
          { label:'Teachers', count:teachers, total, color:'grad-teacher', clr:'#f59e0b' },
          { label:'Admins',   count:admins,   total, color:'grad-admin',   clr:'#8b5cf6' },
        ].map((r, i) => {
          const pct = total ? Math.round((r.count / total) * 100) : 0;
          return React.createElement('div', { key:i },
            React.createElement('div', { className:'flex justify-between mb-1.5' },
              React.createElement('span', { className:'text-sm font-medium text-slate-700' }, r.label),
              React.createElement('span', { className:'text-sm font-bold text-slate-800' }, r.count + ' (' + pct + '%)')
            ),
            React.createElement('div', { className:'h-3 bg-slate-100 rounded-full overflow-hidden' },
              React.createElement('div', { className:'h-full rounded-full transition-all duration-700', style:{width:pct+'%',background:r.clr} })
            )
          );
        })
      )
    )
  );
}

// ============================================================
//  Admin Profile
// ============================================================
function AdminProfile({ user }) {
  return React.createElement('div', { className:'page-enter space-y-5' },
    React.createElement(PageHeader, { icon:'fa-user-circle', title:'Admin Profile', subtitle:'Your account information' }),
    React.createElement('div', { className:'card p-8 max-w-lg' },
      React.createElement('div', { className:'flex flex-col items-center mb-7' },
        React.createElement(Avatar, { name:user.name, size:80, gradient:'grad-admin' }),
        React.createElement('h3', { className:'text-xl font-extrabold text-slate-800 mt-4' }, user.name),
        React.createElement('div', { className:'mt-1' }, React.createElement(RoleBadge, { role:'admin' })),
        React.createElement('p', { className:'font-mono text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full mt-2' }, user.unique_id || 'ADM001')
      ),
      React.createElement(InfoRow, { label:'Email Address', value:user.email,           icon:'fa-envelope' }),
      React.createElement(InfoRow, { label:'Role',          value:'System Administrator', icon:'fa-shield-halved' }),
      React.createElement(InfoRow, { label:'Account ID',    value:user.unique_id || '—', icon:'fa-id-card' }),
      React.createElement(InfoRow, { label:'Joined',        value:user.created_at || 'N/A', icon:'fa-calendar' }),
    )
  );
}

// ============================================================
//  Admin Notices
// ============================================================
function AdminNotices() {
  const notices = [
    { id:1, title:'Semester Exam Schedule Published', date:'2025-08-10', category:'Academic',  priority:'high'   },
    { id:2, title:'Faculty Meeting – All Departments', date:'2025-08-12', category:'Event',     priority:'medium' },
    { id:3, title:'Infrastructure Maintenance',        date:'2025-08-14', category:'Technical', priority:'low'    },
    { id:4, title:'Admission Portal Open for 2025-26', date:'2025-08-05', category:'Admission', priority:'high'   },
  ];

  const priorityBadge = p =>
    React.createElement('span', { className:'badge ' + (p==='high'?'badge-red':p==='medium'?'badge-blue':'badge-green') }, p);

  return React.createElement('div', { className:'page-enter space-y-5' },
    React.createElement(PageHeader, { icon:'fa-bell', title:'College Notices', subtitle:'Administrative announcements' }),
    React.createElement('div', { className:'space-y-3' },
      notices.map(n =>
        React.createElement('div', { key:n.id, className:'card p-4 flex items-start gap-4' },
          React.createElement('div', { className:'w-10 h-10 grad-admin rounded-xl flex items-center justify-center text-white flex-shrink-0' },
            React.createElement('i', { className:'fas fa-bullhorn text-sm' })
          ),
          React.createElement('div', { className:'flex-1 min-w-0' },
            React.createElement('div', { className:'flex items-center gap-2 mb-1' },
              React.createElement('h4', { className:'font-semibold text-slate-800 text-sm' }, n.title),
              priorityBadge(n.priority)
            ),
            React.createElement('div', { className:'flex items-center gap-3 text-xs text-slate-400' },
              React.createElement('span', null, React.createElement('i',{className:'fas fa-tag mr-1'}), n.category),
              React.createElement('span', null, React.createElement('i',{className:'fas fa-calendar mr-1'}), n.date)
            )
          )
        )
      )
    )
  );
}
