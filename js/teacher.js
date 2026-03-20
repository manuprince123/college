// ============================================================
// teacher.js  –  Teacher Dashboard
// ============================================================

function TeacherDashboard({ user, onLogout, toast }) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [students,  setStudents]  = React.useState([]);
  const [loading,   setLoading]   = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    API.teacher.getStudents(user.department)
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [user.department]);

  const navItems = [
    { id:'overview',  icon:'fa-house',            label:'Overview'        },
    { id:'profile',   icon:'fa-user-circle',      label:'My Profile'      },
    { id:'students',  icon:'fa-user-graduate',    label:'My Students'     },
    { id:'courses',   icon:'fa-book',             label:'My Courses'      },
    { id:'schedule',  icon:'fa-calendar-days',    label:'Schedule'        },
    { id:'notices',   icon:'fa-bell',             label:'Notices'         },
  ];

  return React.createElement(DashboardShell, {
    user, navItems, activeTab, setActiveTab, onLogout, gradient: 'grad-teacher'
  },
    activeTab === 'overview'  && React.createElement(TeacherOverview,  { user, students, setActiveTab }),
    activeTab === 'profile'   && React.createElement(TeacherProfile,   { user }),
    activeTab === 'students'  && React.createElement(TeacherStudents,  { user, students, loading, toast }),
    activeTab === 'courses'   && React.createElement(TeacherCourses,   { user }),
    activeTab === 'schedule'  && React.createElement(TeacherSchedule,  { user }),
    activeTab === 'notices'   && React.createElement(TeacherNotices,   {}),
  );
}

// ---- Overview ----
function TeacherOverview({ user, students, setActiveTab }) {
  const myStudents = students.filter(s => s.role === 'student');
  const stats = [
    { icon:'fa-user-graduate',  label:'My Students',   value: myStudents.length, sub:'In your department', gradient:'grad-teacher' },
    { icon:'fa-book',           label:'Active Courses', value:'4',               sub:'This semester',       gradient:'grad-info'    },
    { icon:'fa-calendar-check', label:'Classes Today',  value:'3',               sub:'Next: 11 AM OS',      gradient:'grad-student' },
    { icon:'fa-file-circle-check', label:'Pending Reviews', value:'8',           sub:'Assignments to grade', gradient:'grad-danger' },
  ];

  return React.createElement('div', { className:'page-enter' },
    // Welcome banner
    React.createElement('div', { className:'mb-6 p-5 rounded-2xl grad-teacher text-white relative overflow-hidden' },
      React.createElement('div',{style:{position:'absolute',right:-30,top:-30,width:140,height:140,borderRadius:'50%',background:'rgba(255,255,255,0.1)'}}),
      React.createElement('div', { className:'relative z-10' },
        React.createElement('p', { className:'text-yellow-100 text-sm' }, 'Good morning,'),
        React.createElement('h2', { className:'text-2xl font-extrabold' }, user.name || 'Teacher'),
        React.createElement('p', { className:'text-yellow-100 text-sm mt-1' },
          'ID: ' + (user.unique_id||'—') + '  ·  Dept: ' + (user.department||'—')
        ),
        React.createElement('button', {
          className:'mt-3 btn btn-sm text-xs font-semibold', style:{background:'rgba(255,255,255,0.2)',color:'white',border:'1px solid rgba(255,255,255,0.3)'},
          onClick:()=>setActiveTab('students')
        }, React.createElement('i',{className:'fas fa-user-graduate'}), ' View Students')
      )
    ),

    React.createElement('div', { className:'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6' },
      stats.map(s => React.createElement(StatCard, { key:s.label, ...s }))
    ),

    React.createElement('div', { className:'grid grid-cols-1 lg:grid-cols-2 gap-5' },
      // Quick student list
      React.createElement('div', { className:'card p-5' },
        React.createElement(PageHeader, { icon:'fa-user-graduate', title:'Recent Students', subtitle:'From your department' }),
        myStudents.length === 0
          ? React.createElement(EmptyState, { icon:'fa-user-slash', title:'No students yet', subtitle:'Students will appear here once they register.' })
          : React.createElement('div', { className:'space-y-3' },
              myStudents.slice(0,5).map(s =>
                React.createElement('div', { key:s.id, className:'flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors' },
                  React.createElement(Avatar, { name:s.name, size:38, gradient:'grad-student' }),
                  React.createElement('div', { className:'flex-1 min-w-0' },
                    React.createElement('p', { className:'font-semibold text-slate-700 text-sm truncate' }, s.name),
                    React.createElement('p', { className:'text-xs text-slate-400' }, (s.unique_id||'')+'  ·  Sem: '+(s.semester||'—'))
                  ),
                  React.createElement(RoleBadge, { role:'student' })
                )
              ),
              myStudents.length > 5 && React.createElement('button', {
                className:'w-full text-center text-xs text-blue-600 font-medium py-2 hover:bg-blue-50 rounded-xl transition-colors',
                onClick:()=>setActiveTab('students')
              }, 'View all '+ myStudents.length +' students →')
            )
      ),

      // Today's tasks
      React.createElement('div', { className:'card p-5' },
        React.createElement(PageHeader, { icon:'fa-list-check', title:"Today's Tasks", subtitle:'Your schedule & reminders' }),
        React.createElement('div', { className:'space-y-3' },
          [
            { time:'9:00 AM',  task:'Data Structures Lecture – Room CS-101',        done:true  },
            { time:'11:00 AM', task:'Operating Systems Lab – Room CS-Lab2',          done:false },
            { time:'1:00 PM',  task:'Grade 8 submitted assignments (DBMS)',          done:false },
            { time:'3:00 PM',  task:'Web Technologies – Room CS-201',               done:false },
            { time:'5:00 PM',  task:'Upload marks for CN Internal Assessment',       done:false },
          ].map((t,i) =>
            React.createElement('div', { key:i, className:'flex items-center gap-3 p-2.5 rounded-xl ' + (t.done?'bg-green-50':'hover:bg-slate-50') + ' transition-colors' },
              React.createElement('div', { className:'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ' + (t.done?'bg-green-500':'bg-slate-200') },
                t.done && React.createElement('i',{className:'fas fa-check text-white text-xs'})
              ),
              React.createElement('div', { className:'flex-1 min-w-0' },
                React.createElement('p', { className:'text-xs font-semibold text-slate-500' }, t.time),
                React.createElement('p', { className:'text-sm text-slate-700 truncate' }, t.task)
              )
            )
          )
        )
      )
    )
  );
}

// ---- Profile ----
function TeacherProfile({ user }) {
  return React.createElement('div', { className:'page-enter max-w-2xl' },
    React.createElement(PageHeader, { icon:'fa-user-circle', title:'My Profile', subtitle:'Your account details' }),

    React.createElement('div', { className:'card p-6 mb-5' },
      React.createElement('div', { className:'flex items-center gap-5' },
        React.createElement(Avatar, { name:user.name||'', size:72, gradient:'grad-teacher' }),
        React.createElement('div', null,
          React.createElement('h3', { className:'text-xl font-extrabold text-slate-800' }, user.name||'—'),
          React.createElement('p', { className:'text-slate-500 text-sm' }, user.email||'—'),
          React.createElement('div', { className:'flex items-center gap-2 mt-2' },
            React.createElement(RoleBadge, { role:'teacher' }),
            user.unique_id && React.createElement('span',{className:'badge badge-blue'}, user.unique_id)
          )
        )
      )
    ),

    React.createElement('div', { className:'card p-5' },
      React.createElement('h4', { className:'font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide' }, 'Professional Details'),
      React.createElement(InfoRow, { icon:'fa-user',             label:'Full Name',   value:user.name       }),
      React.createElement(InfoRow, { icon:'fa-envelope',         label:'Email',       value:user.email      }),
      React.createElement(InfoRow, { icon:'fa-id-badge',         label:'Employee ID', value:user.unique_id  }),
      React.createElement(InfoRow, { icon:'fa-building-columns', label:'Department',  value:user.department }),
      React.createElement(InfoRow, { icon:'fa-calendar',         label:'Joined',      value:user.created_at }),
      React.createElement(InfoRow, { icon:'fa-circle-dot',       label:'Status',      value:'Active'        })
    )
  );
}

// ---- Students list ----
function TeacherStudents({ user, students, loading, toast }) {
  const [search, setSearch]   = React.useState('');
  const [semFilter, setSem]   = React.useState('');

  const myStudents = students.filter(s => s.role === 'student');
  const filtered   = myStudents.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.unique_id||'').toLowerCase().includes(search.toLowerCase());
    const matchSem    = !semFilter || s.semester === semFilter;
    return matchSearch && matchSem;
  });

  return React.createElement('div', { className:'page-enter' },
    React.createElement(PageHeader, {
      icon:'fa-user-graduate', title:'My Students',
      subtitle:'Students in ' + (user.department||'your department'),
      action: React.createElement('span', {className:'badge badge-blue'}, filtered.length + ' students')
    }),

    // Filters
    React.createElement('div', { className:'flex flex-wrap gap-3 mb-5' },
      React.createElement('div', { className:'relative flex-1 min-w-48' },
        React.createElement('i', { className:'fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm' }),
        React.createElement('input', {
          type:'text', placeholder:'Search by name or ID…',
          className:'inp has-icon', value:search, onChange:e=>setSearch(e.target.value)
        })
      ),
      React.createElement('select', {
        className:'sel', style:{maxWidth:180},
        value:semFilter, onChange:e=>setSem(e.target.value)
      },
        React.createElement('option',{value:''},'All Semesters'),
        SEMESTERS.map(s => React.createElement('option',{key:s,value:s},s))
      )
    ),

    loading
      ? React.createElement('div', { className:'flex items-center justify-center h-40' }, React.createElement(Spinner))
      : filtered.length === 0
        ? React.createElement(EmptyState, { icon:'fa-user-slash', title:'No students found', subtitle:'Try adjusting your filters.' })
        : React.createElement('div', { className:'card overflow-hidden' },
            React.createElement('div', { className:'overflow-x-auto' },
              React.createElement('table', { className:'tbl' },
                React.createElement('thead', null,
                  React.createElement('tr', null,
                    ['#','Student','Student ID','Department','Semester','Email','Status'].map(h =>
                      React.createElement('th',{key:h}, h)
                    )
                  )
                ),
                React.createElement('tbody', null,
                  filtered.map((s,idx) =>
                    React.createElement('tr', { key:s.id },
                      React.createElement('td', { className:'text-slate-400 text-xs' }, idx+1),
                      React.createElement('td', null,
                        React.createElement('div', { className:'flex items-center gap-2.5' },
                          React.createElement(Avatar, { name:s.name, size:32, gradient:'grad-student' }),
                          React.createElement('span', { className:'font-semibold text-slate-700 text-sm' }, s.name)
                        )
                      ),
                      React.createElement('td', null, React.createElement('span',{className:'badge badge-blue'}, s.unique_id||'—')),
                      React.createElement('td', { className:'text-slate-600 text-sm' }, s.department||'—'),
                      React.createElement('td', null,
                        s.semester
                          ? React.createElement('span',{className:'badge badge-green'}, s.semester)
                          : React.createElement('span',{className:'text-slate-400 text-sm'},'—')
                      ),
                      React.createElement('td', { className:'text-slate-500 text-sm' }, s.email||'—'),
                      React.createElement('td', null, React.createElement('span',{className:'badge badge-green'}, 'Active'))
                    )
                  )
                )
              )
            )
          )
  );
}

// ---- Courses ----
function TeacherCourses({ user }) {
  const courses = [
    { code:'CS501', name:'Data Structures & Algorithms', credits:4, students:42, room:'CS-101', time:'Mon/Wed 9-10AM',    sem:'3rd', status:'Active' },
    { code:'CS502', name:'Operating Systems',            credits:4, students:38, room:'CS-Lab2',time:'Tue/Thu 11-12PM',   sem:'3rd', status:'Active' },
    { code:'CS503', name:'Database Management Systems',  credits:3, students:40, room:'CS-301', time:'Mon/Fri 2-3PM',     sem:'5th', status:'Active' },
    { code:'CS504', name:'Computer Networks',            credits:4, students:35, room:'CS-102', time:'Wed/Fri 10-11AM',   sem:'5th', status:'Active' },
  ];

  return React.createElement('div', { className:'page-enter' },
    React.createElement(PageHeader, { icon:'fa-book', title:'My Courses', subtitle:'Courses assigned to you this semester' }),
    React.createElement('div', { className:'grid grid-cols-1 md:grid-cols-2 gap-4' },
      courses.map(c =>
        React.createElement('div', { key:c.code, className:'card p-5 hover:shadow-md transition-all' },
          React.createElement('div', { className:'flex items-start justify-between mb-3' },
            React.createElement('span',{className:'badge badge-blue'}, c.code),
            React.createElement('div',{className:'flex gap-1.5'},
              React.createElement('span',{className:'badge badge-green'}, c.credits+' Cr'),
              React.createElement('span',{className:'badge badge-blue'}, c.sem+' Sem')
            )
          ),
          React.createElement('h4', { className:'font-bold text-slate-800 text-base mb-2' }, c.name),
          React.createElement('div', { className:'grid grid-cols-2 gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3' },
            React.createElement('p', null, React.createElement('i',{className:'fas fa-users mr-1 text-blue-400'}), c.students+' students'),
            React.createElement('p', null, React.createElement('i',{className:'fas fa-door-open mr-1 text-blue-400'}), c.room),
            React.createElement('p', { className:'col-span-2' }, React.createElement('i',{className:'fas fa-clock mr-1 text-blue-400'}), c.time)
          )
        )
      )
    )
  );
}

// ---- Schedule ----
function TeacherSchedule() {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const schedule = {
    Monday:    [{time:'9-10AM',  subject:'Data Structures',  room:'CS-101'}, {time:'2-3PM',  subject:'DBMS',            room:'CS-301'}],
    Tuesday:   [{time:'11-12PM', subject:'Operating Systems',room:'CS-Lab2'},{time:'2-3PM',  subject:'CN Lab',          room:'CS-Lab1'}],
    Wednesday: [{time:'9-10AM',  subject:'Data Structures',  room:'CS-101'}, {time:'10-11AM',subject:'Computer Networks',room:'CS-102'}],
    Thursday:  [{time:'11-12PM', subject:'Operating Systems',room:'CS-Lab2'}],
    Friday:    [{time:'2-3PM',   subject:'DBMS',             room:'CS-301'}, {time:'10-11AM',subject:'Computer Networks',room:'CS-102'}],
  };
  const today = days[new Date().getDay()-1] || 'Monday';

  return React.createElement('div', { className:'page-enter' },
    React.createElement(PageHeader, { icon:'fa-calendar-days', title:'Weekly Schedule', subtitle:'Your class timetable for this week' }),
    React.createElement('div', { className:'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
      days.map(day =>
        React.createElement('div', { key:day, className:'card p-4 ' + (day===today?'ring-2 ring-yellow-400':'') },
          React.createElement('div', { className:'flex items-center justify-between mb-3' },
            React.createElement('h4', { className:'font-bold text-slate-700' }, day),
            day===today && React.createElement('span',{className:'badge badge-blue'}, '● Today')
          ),
          schedule[day] && schedule[day].length > 0
            ? React.createElement('div', { className:'space-y-2' },
                schedule[day].map((cl,i) =>
                  React.createElement('div', { key:i, className:'p-3 rounded-xl grad-teacher text-white' },
                    React.createElement('p', { className:'font-semibold text-sm' }, cl.subject),
                    React.createElement('p', { className:'text-yellow-100 text-xs mt-0.5' },
                      React.createElement('i',{className:'fas fa-clock mr-1'}), cl.time, '  ',
                      React.createElement('i',{className:'fas fa-door-open mr-1'}), cl.room
                    )
                  )
                )
              )
            : React.createElement('p', { className:'text-slate-400 text-sm text-center py-4' }, 'No classes')
        )
      )
    )
  );
}

// ---- Notices ----
function TeacherNotices() {
  const notices = [
    { title:'Faculty Meeting – Nov 22, 2024',   date:'Nov 18, 2024', type:'Meeting',   body:'Mandatory faculty meeting at 3 PM in Conference Hall. Agenda: Semester-end examination planning.' },
    { title:'Examination Duty Assignment',       date:'Nov 15, 2024', type:'Exam',      body:'Invigilation duty for mid-semester exams has been published. Please check your duty chart on the staff portal.' },
    { title:'Research Paper Submission Window',  date:'Nov 10, 2024', type:'Academic',  body:'The window for submitting research papers to the annual journal is open till November 30. Submit via the staff portal.' },
    { title:'Professional Development Workshop', date:'Nov 5, 2024',  type:'Training',  body:'A workshop on "Modern Teaching Methodologies" is scheduled for Dec 10. Registration is mandatory for all faculty.' },
  ];

  return React.createElement('div', { className:'page-enter' },
    React.createElement(PageHeader, { icon:'fa-bell', title:'Staff Notices', subtitle:'Latest circulars for faculty' }),
    React.createElement('div', { className:'space-y-4' },
      notices.map((n,i) =>
        React.createElement('div', { key:i, className:'card p-5 hover:shadow-md transition-all' },
          React.createElement('div', { className:'flex items-start justify-between gap-3 mb-2' },
            React.createElement('h4', { className:'font-bold text-slate-800' }, n.title),
            React.createElement('span',{className:'badge badge-blue'}, n.type)
          ),
          React.createElement('p', { className:'text-sm text-slate-500 leading-relaxed mb-2' }, n.body),
          React.createElement('p', { className:'text-xs text-slate-400' },
            React.createElement('i',{className:'fas fa-calendar-day mr-1'}), n.date
          )
        )
      )
    )
  );
}
