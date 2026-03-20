
// =====================================================
// ADMIN DASHBOARD
// =====================================================

const AdminDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.usn.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || s.dept === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="animate-fade-in space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="user-graduate" title="Total Students" value="2,847" change={5} color="blue" sub="Active enrollments"/>
        <StatCard icon="chalkboard-teacher" title="Faculty" value="124" change={2} color="green" sub="Across departments"/>
        <StatCard icon="book" title="Courses" value="89" change={0} color="purple" sub="This semester"/>
        <StatCard icon="calendar-check" title="Avg Attendance" value="83%" change={-2} color="orange" sub="College-wide"/>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Enrollment Trend</h3>
              <p className="text-xs text-gray-500 mt-0.5">2025 Academic Year</p>
            </div>
            <Badge color="blue">2025</Badge>
          </div>
          <div style={{height:'220px'}}>
            <LineChart data={[180,220,195,250,230,270,290,310,285,320,298,340]} labels={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']} title="Enrollments"/>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Students by Department</h3>
            <p className="text-xs text-gray-500 mt-0.5">Current distribution</p>
          </div>
          <div style={{height:'220px'}}>
            <DoughnutChart data={[785, 634, 521, 498, 409]} labels={['CS', 'EC', 'ME', 'CV', 'Others']}/>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon:'user-plus', label:'Add Student', color:'blue', action:()=>setShowAddStudent(true) },
          { icon:'file-export', label:'Export Report', color:'green', action:()=>{} },
          { icon:'calendar-plus', label:'New Booking', color:'purple', action:()=>{} },
          { icon:'bullhorn', label:'Announcement', color:'orange', action:()=>{} },
        ].map(item => (
          <button key={item.label} onClick={item.action}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 card-hover text-center flex flex-col items-center gap-3">
            <div className={`w-12 h-12 gradient-${item.color} rounded-xl flex items-center justify-center shadow-md`}>
              <i className={`fas fa-${item.icon} text-white`}></i>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Student Directory</h3>
            <p className="text-xs text-gray-500 mt-0.5">{filteredStudents.length} students</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 w-48 focus:ring-2 focus:ring-blue-500"/>
            </div>
            <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600">
              <option value="all">All Depts</option>
              <option value="Computer Science">CS</option>
              <option value="Electronics">EC</option>
              <option value="Mechanical">ME</option>
            </select>
            <Button icon="plus" size="sm" onClick={()=>setShowAddStudent(true)}>Add</Button>
          </div>
        </div>
        <div className="p-5">
          <Table
            columns={[
              { key:'name', label:'Student', render:(v,r)=>(
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 gradient-blue rounded-full flex items-center justify-center text-white text-xs font-bold">{v.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                  <div><div className="font-medium text-gray-900 dark:text-white text-sm">{v}</div><div className="text-xs text-gray-500">{r.usn}</div></div>
                </div>
              )},
              { key:'dept', label:'Department', render:v=><Badge color="blue" size="xs">{v}</Badge> },
              { key:'semester', label:'Sem', render:v=><span className="font-medium">Sem {v}</span> },
              { key:'attendance', label:'Attendance', render:v=>(
                <div className="flex items-center gap-2 min-w-24">
                  <ProgressBar value={v} showLabel={false}/>
                  <span className={`text-xs font-semibold ${v<75?'text-red-500':v<85?'text-yellow-500':'text-green-500'}`}>{v}%</span>
                </div>
              )},
              { key:'cgpa', label:'CGPA', render:v=>(
                <span className={`font-bold text-sm ${v>=9?'text-green-500':v>=7?'text-blue-500':v>=5?'text-yellow-500':'text-red-500'}`}>{v}</span>
              )},
              { key:'id', label:'Action', render:(v,r)=>(
                <div className="flex gap-2">
                  <button onClick={()=>setSelectedStudent(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-xs"><i className="fas fa-eye"></i></button>
                  <button className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-xs"><i className="fas fa-edit"></i></button>
                  <button className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-xs"><i className="fas fa-trash"></i></button>
                </div>
              )}
            ]}
            data={filteredStudents}
          />
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4"><i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>Smart Alerts</h3>
        <div className="space-y-2">
          <AlertBanner type="warning" message="6 students have attendance below 75% — at risk of exam debarment."/>
          <AlertBanner type="info" message="Internal assessment submission deadline: August 20, 2025"/>
          <AlertBanner type="success" message="Semester results published successfully for CS, EC departments."/>
        </div>
      </div>

      {/* Student Detail Modal */}
      <Modal open={!!selectedStudent} onClose={()=>setSelectedStudent(null)} title="Student Profile" size="lg">
        {selectedStudent && (
          <div className="space-y-5">
            <div className="flex items-center gap-5 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl">
              <div className="w-16 h-16 gradient-blue rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {selectedStudent.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h4>
                <p className="text-gray-500">{selectedStudent.usn} • {selectedStudent.dept}</p>
                <div className="flex gap-2 mt-2">
                  <Badge color="blue" size="xs">Semester {selectedStudent.semester}</Badge>
                  <Badge color={selectedStudent.attendance >= 75 ? 'green' : 'red'} size="xs">{selectedStudent.attendance}% Attendance</Badge>
                  <Badge color="purple" size="xs">CGPA {selectedStudent.cgpa}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"><div className="text-xs text-gray-500 mb-1">Email</div><div className="text-sm font-medium">{selectedStudent.email}</div></div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"><div className="text-xs text-gray-500 mb-1">Phone</div><div className="text-sm font-medium">{selectedStudent.phone}</div></div>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-sm">Subject-wise Attendance</h5>
              <div className="space-y-3">
                {MOCK_ATTENDANCE.map(a => (
                  <div key={a.subject}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{a.subject}</span>
                      <span className={`font-semibold ${a.percent<75?'text-red-500':a.percent<85?'text-yellow-500':'text-green-500'}`}>{a.present}/{a.total} ({a.percent}%)</span>
                    </div>
                    <ProgressBar value={a.percent}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showAddStudent} onClose={()=>setShowAddStudent(false)} title="Add New Student">
        <div className="space-y-0">
          <div className="grid grid-cols-2 gap-0">
            <Input label="Full Name" value="" onChange={()=>{}} placeholder="Student name" required className="pr-2"/>
            <Input label="USN" value="" onChange={()=>{}} placeholder="1CS21CS001" required className="pl-2"/>
          </div>
          <Select label="Department" value="cs" onChange={()=>{}} options={[{value:'cs',label:'Computer Science'},{value:'ec',label:'Electronics'},{value:'me',label:'Mechanical'}]} required/>
          <div className="grid grid-cols-2 gap-0">
            <Select label="Semester" value="1" onChange={()=>{}} options={[1,2,3,4,5,6,7,8].map(s=>({value:String(s),label:`Semester ${s}`}))} className="pr-2"/>
            <Input label="Phone" value="" onChange={()=>{}} placeholder="9876543210" className="pl-2"/>
          </div>
          <Input label="Email" type="email" value="" onChange={()=>{}} placeholder="student@college.edu" required/>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={()=>setShowAddStudent(false)} className="flex-1">Cancel</Button>
            <Button icon="user-plus" className="flex-1" onClick={()=>setShowAddStudent(false)}>Add Student</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =====================================================
// TEACHER DASHBOARD
// =====================================================

const TeacherDashboard = () => {
  const [tab, setTab] = useState('overview');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="users" title="My Students" value="183" change={3} color="blue" sub="Across 3 courses"/>
        <StatCard icon="book" title="Active Courses" value="3" color="green" sub="This semester"/>
        <StatCard icon="tasks" title="Pending Reviews" value="12" color="orange" sub="Assignment submissions"/>
        <StatCard icon="star" title="Avg Rating" value="4.7/5" change={2} color="purple" sub="Student feedback"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Subject-wise Attendance Overview</h3>
          <div style={{height:'200px'}}>
            <BarChart data={[84, 79, 90, 67, 96]} labels={['DSA','OS','DBMS','CN','SE']} title="Avg Attendance %"/>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">My Courses</h3>
          <div className="space-y-3">
            {MOCK_COURSES.filter(c=>c.teacher==='Prof. Priya Sharma').map(course => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{course.name}</div>
                  <div className="text-xs text-gray-500">{course.code} • {course.enrolled} students</div>
                </div>
                <Badge color="blue">{course.credits} Cr</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Pending Assignment Reviews</h3>
          <Badge color="orange">12 Pending</Badge>
        </div>
        <Table
          columns={[
            { key:'name', label:'Student', render:(v)=><div className="font-medium text-sm">{v}</div> },
            { key:'title', label:'Assignment' },
            { key:'subject', label:'Subject', render:v=><Badge color="blue" size="xs">{v}</Badge> },
            { key:'submitted', label:'Submitted', render:v=><span className="text-xs text-gray-500">{v}</span> },
            { key:'id', label:'Action', render:()=>(
              <div className="flex gap-2">
                <Button size="xs" icon="eye" variant="secondary">Review</Button>
                <Button size="xs" icon="check" variant="success">Grade</Button>
              </div>
            )}
          ]}
          data={[
            { id:1, name:'Rahul Verma', title:'Binary Tree Implementation', subject:'DSA', submitted:'2 hours ago' },
            { id:2, name:'Priya Singh', title:'ER Diagram Hospital', subject:'DBMS', submitted:'5 hours ago' },
            { id:3, name:'Deepa Nair', title:'Process Scheduling', subject:'OS', submitted:'1 day ago' },
          ]}
        />
      </div>
    </div>
  );
};

// =====================================================
// STUDENT DASHBOARD
// =====================================================

const StudentDashboard = ({ user }) => {
  const lowAttendance = MOCK_ATTENDANCE.filter(a=>a.percent<75);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome Banner */}
      <div className="gradient-bg rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute right-10 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2"></div>
        <div className="relative z-10">
          <p className="text-blue-100 text-sm mb-1">Welcome back,</p>
          <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
          <p className="text-blue-200 text-sm">{user.usn} • {user.dept} • Semester {user.semester}</p>
          <div className="flex gap-4 mt-4">
            <div className="glass rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold">85%</div>
              <div className="text-xs text-blue-200">Attendance</div>
            </div>
            <div className="glass rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold">8.4</div>
              <div className="text-xs text-blue-200">CGPA</div>
            </div>
            <div className="glass rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold">3</div>
              <div className="text-xs text-blue-200">Due Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {lowAttendance.length > 0 && (
        <AlertBanner type="warning" message={`⚠️ Low attendance in ${lowAttendance.map(a=>a.subject).join(', ')}. Minimum 75% required.`}/>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="clipboard-check" title="Attendance" value="85%" color="blue" sub="College avg: 83%"/>
        <StatCard icon="graduation-cap" title="CGPA" value="8.4" color="green" sub="Rank: 12/62"/>
        <StatCard icon="tasks" title="Assignments" value="3" color="orange" sub="Pending submission"/>
        <StatCard icon="book-open" title="Courses" value="5" color="purple" sub="Active this semester"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Status</h3>
          <div className="space-y-4">
            {MOCK_ATTENDANCE.map(a => (
              <div key={a.subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{a.subject}</span>
                  <span className="text-xs text-gray-500">{a.present}/{a.total} classes</span>
                </div>
                <ProgressBar value={a.percent}/>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Radar</h3>
          <div style={{height:'220px'}}>
            <RadarChart data={[84, 79, 90, 67, 96]} labels={['DSA','OS','DBMS','CN','SE']}/>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4"><i className="fas fa-clock text-orange-500 mr-2"></i>Upcoming Deadlines</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MOCK_ASSIGNMENTS.filter(a=>a.status==='pending').map(a=>(
            <div key={a.id} className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-700">
              <Badge color="orange" size="xs">{a.subject}</Badge>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-2 mb-1">{a.title}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400"><i className="fas fa-calendar mr-1"></i>Due: {a.deadline}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// ALUMNI DASHBOARD
// =====================================================

const AlumniDashboard = ({ user }) => (
  <div className="animate-fade-in space-y-6">
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
      <h2 className="text-2xl font-bold mb-1">Welcome, {user.name}! 🎓</h2>
      <p className="text-emerald-100">{user.company} • {user.jobRole} • Batch 2020</p>
      <div className="flex gap-4 mt-4">
        {[['125','Connections'],['12','Events'],['3','Referrals']].map(([v,l])=>(
          <div key={l} className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold">{v}</div>
            <div className="text-xs text-emerald-100">{l}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold mb-4">Alumni Network Highlights</h3>
        <div className="space-y-3">
          {MOCK_ALUMNI.slice(0,3).map(a=>(
            <div key={a.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center text-white text-sm font-bold">{a.avatar}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{a.name}</div>
                <div className="text-xs text-gray-500">{a.role} @ {a.company}</div>
              </div>
              <Badge color="green" size="xs">Batch {a.batch}</Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold mb-4">Upcoming Alumni Events</h3>
        <div className="space-y-3">
          {[
            { title:'Annual Alumni Meet 2025', date:'Sep 15, 2025', type:'In-person' },
            { title:'Tech Talk: AI in 2025', date:'Aug 22, 2025', type:'Virtual' },
            { title:'Campus Recruitment Drive', date:'Oct 5, 2025', type:'In-person' },
          ].map((ev,i)=>(
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <div className="font-medium text-sm">{ev.title}</div>
                <div className="text-xs text-gray-500">{ev.date}</div>
              </div>
              <Badge color={ev.type==='Virtual'?'blue':'green'} size="xs">{ev.type}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
