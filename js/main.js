
// =====================================================
// TEACHERS MODULE (for Admin)
// =====================================================

const TeachersPage = () => {
  const [teachers] = useState([
    { id:1, name:'Prof. Priya Sharma', dept:'Computer Science', email:'priya@college.edu', phone:'9876543001', courses:['DSA','DBMS'], rating:4.7, experience:8, avatar:'PS' },
    { id:2, name:'Prof. Rajesh Kumar', dept:'Computer Science', email:'rajesh@college.edu', phone:'9876543002', courses:['OS'], rating:4.2, experience:12, avatar:'RK' },
    { id:3, name:'Prof. Anjali Menon', dept:'Computer Science', email:'anjali@college.edu', phone:'9876543003', courses:['CN'], rating:4.5, experience:6, avatar:'AM' },
    { id:4, name:'Prof. Suresh Nair', dept:'Computer Science', email:'suresh@college.edu', phone:'9876543004', courses:['SE'], rating:4.8, experience:15, avatar:'SN' },
    { id:5, name:'Prof. Meena Rao', dept:'Electronics', email:'meena@college.edu', phone:'9876543005', courses:['DE'], rating:4.3, experience:9, avatar:'MR' },
  ]);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Faculty Management</h2>
          <p className="text-sm text-gray-500">{teachers.length} faculty members</p>
        </div>
        <Button icon="plus" onClick={()=>setShowAdd(true)}>Add Faculty</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="chalkboard-teacher" title="Total Faculty" value="124" color="blue"/>
        <StatCard icon="book" title="Courses Assigned" value="89" color="green"/>
        <StatCard icon="star" title="Avg Rating" value="4.5" color="purple"/>
        <StatCard icon="briefcase" title="Avg Experience" value="9.2 yrs" color="orange"/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map(t => (
          <div key={t.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 gradient-purple rounded-2xl flex items-center justify-center text-white font-bold shadow-md">{t.avatar}</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</h4>
                <Badge color="purple" size="xs">{t.dept}</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-500"><i className="fas fa-envelope w-4 text-xs text-center"></i><span className="truncate">{t.email}</span></div>
              <div className="flex items-center gap-2 text-gray-500"><i className="fas fa-briefcase w-4 text-xs text-center"></i><span>{t.experience} yrs experience</span></div>
              <div className="flex items-center gap-2 text-gray-500"><i className="fas fa-book w-4 text-xs text-center"></i><span>{t.courses.join(', ')}</span></div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i=><i key={i} className={`fas fa-star text-xs ${i<=Math.round(t.rating)?'text-yellow-400':'text-gray-300'}`}></i>)}
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{t.rating}</span>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg text-xs transition-colors"><i className="fas fa-edit"></i></button>
                <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs transition-colors"><i className="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Faculty Member">
        <div>
          <div className="grid grid-cols-2 gap-0">
            <Input label="Full Name" value="" onChange={()=>{}} placeholder="Prof. Name" required className="pr-2"/>
            <Select label="Department" value="" onChange={()=>{}} options={[{value:'cs',label:'Computer Science'},{value:'ec',label:'Electronics'},{value:'me',label:'Mechanical'}]} required className="pl-2"/>
          </div>
          <Input label="Email" type="email" value="" onChange={()=>{}} placeholder="prof@college.edu" required/>
          <div className="grid grid-cols-2 gap-0">
            <Input label="Phone" value="" onChange={()=>{}} placeholder="9876543210" className="pr-2"/>
            <Input label="Experience (Years)" type="number" value="" onChange={()=>{}} placeholder="5" className="pl-2"/>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={()=>setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button icon="user-plus" className="flex-1" onClick={()=>setShowAdd(false)}>Add Faculty</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =====================================================
// MAIN APP COMPONENT
// =====================================================

const App = () => {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (darkMode) { document.documentElement.classList.add('dark'); }
    else { document.documentElement.classList.remove('dark'); }
  }, [darkMode]);

  const handleLogin = (userData) => {
    setUser(userData);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter(n=>!n.read).length;

  if (!user) return <LoginPage onLogin={handleLogin}/>;

  const renderPage = () => {
    const props = { role: user.role, user };
    switch (activePage) {
      case 'dashboard':
        switch (user.role) {
          case 'admin': return <AdminDashboard {...props}/>;
          case 'teacher': return <TeacherDashboard {...props}/>;
          case 'student': return <StudentDashboard {...props}/>;
          case 'alumni': return <AlumniDashboard {...props}/>;
          default: return <StudentDashboard {...props}/>;
        }
      case 'students': return <AdminDashboard {...props}/>;
      case 'teachers': return <TeachersPage {...props}/>;
      case 'attendance': return <AttendancePage {...props}/>;
      case 'marks': return <MarksPage {...props}/>;
      case 'assignments': return <AssignmentsPage {...props}/>;
      case 'courses': return <CoursesPage {...props}/>;
      case 'booking': return <BookingPage {...props}/>;
      case 'alumni': return <AlumniPage {...props}/>;
      case 'surveys': return <SurveysPage {...props}/>;
      case 'ai': return <AIAssistantPage {...props}/>;
      case 'notifications': return <NotificationsPage {...props}/>;
      case 'reports':
      case 'performance': return <ReportsPage {...props}/>;
      case 'profile': return <ProfilePage {...props}/>;
      case 'forum': return <ForumPage {...props}/>;
      default: return (
        <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-tools text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Coming Soon</h3>
          <p className="text-sm text-gray-500 mt-1">This module is under development</p>
        </div>
      );
    }
  };

  const pageTitle = (activePage.charAt(0).toUpperCase() + activePage.slice(1)).replace('-', ' ');

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} activePage={activePage} onNavigate={setActivePage} collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(!sidebarCollapsed)}/>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar user={user} onLogout={handleLogout} darkMode={darkMode} onToggleDark={()=>setDarkMode(!darkMode)}
          onNotificationClick={()=>setActivePage('notifications')} unreadCount={unreadCount}/>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="px-6 pt-5 pb-1 flex items-center gap-2 text-sm">
            <span className="text-gray-400">Home</span>
            <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
            <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">{pageTitle}</span>
          </div>
          <div className="p-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

// =====================================================
// RENDER
// =====================================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
