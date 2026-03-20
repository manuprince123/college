
// =====================================================
// CHART COMPONENTS
// =====================================================

const LineChart = ({ data, labels, title }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: title, data, borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.1)', borderWidth:2.5, pointRadius:4, pointBackgroundColor:'#3b82f6', fill:true, tension:0.4 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, grid:{ color:'rgba(0,0,0,0.05)' } }, x:{ grid:{ display:false } } } }
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, labels]);
  return <canvas ref={canvasRef} style={{height:'100%',width:'100%'}}></canvas>;
};

const BarChart = ({ data, labels, title, colors }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: title, data, backgroundColor: colors || ['rgba(59,130,246,0.8)','rgba(16,185,129,0.8)','rgba(245,158,11,0.8)','rgba(239,68,68,0.8)','rgba(139,92,246,0.8)'], borderRadius:8, borderSkipped:false }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, grid:{ color:'rgba(0,0,0,0.05)' } }, x:{ grid:{ display:false } } } }
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, labels]);
  return <canvas ref={canvasRef} style={{height:'100%',width:'100%'}}></canvas>;
};

const DoughnutChart = ({ data, labels }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor:['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'], borderWidth:0, hoverOffset:4 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ padding:15, font:{ size:12 } } } }, cutout:'70%' }
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, labels]);
  return <canvas ref={canvasRef} style={{height:'100%',width:'100%'}}></canvas>;
};

const RadarChart = ({ data, labels }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets: [{ label: 'Performance', data, backgroundColor:'rgba(59,130,246,0.2)', borderColor:'#3b82f6', pointBackgroundColor:'#3b82f6', borderWidth:2 }] },
      options: { responsive:true, maintainAspectRatio:false, scales:{ r:{ beginAtZero:true, max:100 } }, plugins:{ legend:{ display:false } } }
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, labels]);
  return <canvas ref={canvasRef} style={{height:'100%',width:'100%'}}></canvas>;
};

// =====================================================
// SIDEBAR NAVIGATION
// =====================================================

const sidebarMenus = {
  admin: [
    { icon:'tachometer-alt', label:'Dashboard', page:'dashboard' },
    { icon:'users', label:'Students', page:'students' },
    { icon:'chalkboard-teacher', label:'Teachers', page:'teachers' },
    { icon:'book', label:'Courses', page:'courses' },
    { icon:'calendar-check', label:'Room Booking', page:'booking' },
    { icon:'chart-bar', label:'Reports', page:'reports' },
    { icon:'poll', label:'Surveys', page:'surveys' },
    { icon:'user-graduate', label:'Alumni', page:'alumni' },
    { icon:'robot', label:'AI Assistant', page:'ai' },
    { icon:'bell', label:'Notifications', page:'notifications' },
  ],
  teacher: [
    { icon:'tachometer-alt', label:'Dashboard', page:'dashboard' },
    { icon:'calendar-check', label:'Attendance', page:'attendance' },
    { icon:'clipboard-list', label:'Marks', page:'marks' },
    { icon:'tasks', label:'Assignments', page:'assignments' },
    { icon:'book', label:'My Courses', page:'courses' },
    { icon:'calendar-alt', label:'Room Booking', page:'booking' },
    { icon:'chart-line', label:'Performance', page:'performance' },
    { icon:'robot', label:'AI Assistant', page:'ai' },
  ],
  student: [
    { icon:'tachometer-alt', label:'Dashboard', page:'dashboard' },
    { icon:'calendar-check', label:'Attendance', page:'attendance' },
    { icon:'star', label:'Marks', page:'marks' },
    { icon:'file-alt', label:'Assignments', page:'assignments' },
    { icon:'book-open', label:'Courses', page:'courses' },
    { icon:'user-graduate', label:'Alumni', page:'alumni' },
    { icon:'poll', label:'Surveys', page:'surveys' },
    { icon:'robot', label:'AI Assistant', page:'ai' },
    { icon:'bell', label:'Notifications', page:'notifications' },
  ],
  alumni: [
    { icon:'tachometer-alt', label:'Dashboard', page:'dashboard' },
    { icon:'user-circle', label:'My Profile', page:'profile' },
    { icon:'users', label:'Alumni Network', page:'alumni' },
    { icon:'comments', label:'Student Forum', page:'forum' },
    { icon:'robot', label:'AI Assistant', page:'ai' },
  ]
};

const Sidebar = ({ user, activePage, onNavigate, collapsed, onToggle }) => {
  const menu = sidebarMenus[user.role] || [];
  return (
    <aside className={`${collapsed?'w-16':'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 shadow-sm`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <div className="w-9 h-9 gradient-blue rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <i className="fas fa-university text-white text-sm"></i>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Govt College</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Management System</div>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <i className={`fas fa-${collapsed?'chevron-right':'chevron-left'} text-gray-400 text-xs`}></i>
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="w-9 h-9 gradient-blue rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{user.avatar}</div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name.split(' ').slice(0,2).join(' ')}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menu.map(item => (
          <button key={item.page} onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all sidebar-item
              ${activePage===item.page ? 'nav-active' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <i className={`fas fa-${item.icon} w-4 text-center flex-shrink-0`}></i>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        {!collapsed && <div className="text-xs text-center text-gray-400 mb-2">v2.0.0 | Academic 2025-26</div>}
      </div>
    </aside>
  );
};

// =====================================================
// TOPBAR
// =====================================================

const TopBar = ({ user, onLogout, darkMode, onToggleDark, onNotificationClick, unreadCount }) => {
  const [searchVal, setSearchVal] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" placeholder="Search students, courses, rooms..." value={searchVal} onChange={e=>setSearchVal(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all border-transparent"/>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode */}
        <button onClick={onToggleDark} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Toggle dark mode">
          <i className={`fas fa-${darkMode?'sun':'moon'} text-gray-500 dark:text-gray-400`}></i>
        </button>

        {/* Notifications */}
        <button onClick={onNotificationClick} className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <i className="fas fa-bell text-gray-500 dark:text-gray-400"></i>
          {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount}</span>}
        </button>

        {/* Profile */}
        <div className="relative">
          <button onClick={()=>setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <div className="w-8 h-8 gradient-blue rounded-full flex items-center justify-center text-white text-xs font-bold">{user.avatar}</div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user.name.split(' ')[0]}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role}</div>
            </div>
            <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
                <Badge color="blue" size="xs" className="mt-1">{user.role}</Badge>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <i className="fas fa-user-circle w-4"></i>My Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <i className="fas fa-cog w-4"></i>Settings
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <i className="fas fa-sign-out-alt w-4"></i>Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
