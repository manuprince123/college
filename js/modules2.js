
// =====================================================
// COURSES MODULE
// =====================================================

const CoursesPage = ({ role }) => {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Courses</h2>
          <p className="text-sm text-gray-500">{role==='student'?'Your enrolled courses':'Manage department courses'}</p>
        </div>
        {role === 'admin' && <Button icon="plus" onClick={()=>setShowAdd(true)}>Add Course</Button>}
      </div>

      <div className="relative max-w-sm">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses..."
          className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm w-full focus:ring-2 focus:ring-blue-500"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(course => (
          <div key={course.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
            <div className={`h-2 gradient-blue`}></div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-gray-500 font-medium">{course.code}</div>
                  <h4 className="font-bold text-gray-900 dark:text-white mt-1">{course.name}</h4>
                </div>
                <Badge color="blue">{course.credits} Cr</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <i className="fas fa-chalkboard-teacher w-4 text-center text-xs"></i>
                  <span>{course.teacher}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <i className="fas fa-users w-4 text-center text-xs"></i>
                  <span>{course.enrolled} students enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <i className="fas fa-building w-4 text-center text-xs"></i>
                  <span>{course.dept}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={()=>setSelected(course)}
                  className="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 transition-colors">
                  <i className="fas fa-eye mr-1"></i>View Details
                </button>
                {role === 'student' && (
                  <button className="flex-1 py-2 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 transition-colors">
                    <i className="fas fa-plus mr-1"></i>Enroll
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Course Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 gradient-blue rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                {selected.code.slice(0,2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.code} • {selected.dept}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Teacher', selected.teacher, 'chalkboard-teacher'], ['Students', selected.enrolled, 'users'], ['Credits', selected.credits, 'star'], ['Semester', `Sem ${selected.semester}`, 'calendar']].map(([l,v,i])=>(
                <div key={l} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-1"><i className={`fas fa-${i} text-blue-500`}></i>{l}</div>
                  <div className="font-semibold text-sm">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// =====================================================
// SMART ROOM BOOKING
// =====================================================

const BookingPage = ({ role }) => {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [showBook, setShowBook] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ room:'', date:'', slot:'', purpose:'' });

  const filteredRooms = filter==='all' ? rooms : filter==='available' ? rooms.filter(r=>!r.booked) : filter==='booked' ? rooms.filter(r=>r.booked) : rooms.filter(r=>r.type===filter);

  const typeIcon = { Classroom:'door-open', 'Computer Lab':'laptop', 'Seminar Hall':'microphone', Conference:'users', Auditorium:'theater-masks' };
  const slots = ['8:00-9:00','9:00-10:00','10:00-11:00','11:00-12:00','12:00-13:00','13:00-14:00','14:00-15:00','15:00-16:00','16:00-17:00'];

  const handleBook = () => {
    if (!form.room || !form.date || !form.slot || !form.purpose) { alert('Please fill all fields'); return; }
    const newBooking = { id: bookings.length+1, room: form.room, bookedBy: 'Prof. Priya Sharma', date: form.date, timeSlot: form.slot, purpose: form.purpose, status: 'pending' };
    setBookings([...bookings, newBooking]);
    setRooms(rooms.map(r => r.name===form.room ? {...r, booked:true, bookedBy:'Prof. Priya Sharma', time:form.slot, purpose:form.purpose} : r));
    setForm({ room:'', date:'', slot:'', purpose:'' });
    setShowBook(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Room Booking</h2>
          <p className="text-sm text-gray-500">Real-time room availability & booking management</p>
        </div>
        <Button icon="calendar-plus" onClick={()=>setShowBook(true)}>Book a Room</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="door-open" title="Total Rooms" value={rooms.length} color="blue"/>
        <StatCard icon="check-circle" title="Available" value={rooms.filter(r=>!r.booked).length} color="green"/>
        <StatCard icon="times-circle" title="Booked" value={rooms.filter(r=>r.booked).length} color="red"/>
        <StatCard icon="calendar-check" title="Today's Bookings" value={bookings.length} color="purple"/>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white"><i className="fas fa-map-marked-alt text-blue-500 mr-2"></i>Campus Map</h3>
          <Badge color="blue">Google Maps API</Badge>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 p-6 relative" style={{height:'280px'}}>
          {/* Simulated campus map */}
          <div className="absolute inset-4 bg-white/40 dark:bg-gray-800/40 rounded-xl backdrop-blur-sm flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg px-8">
              {[{name:'Block A', rooms:3, color:'blue'},{name:'Block B', rooms:2, color:'purple'},{name:'Block C', rooms:2, color:'green'},{name:'Admin Block', rooms:1, color:'orange'},{name:'Main Block', rooms:1, color:'red'},{name:'Library', rooms:0, color:'gray'}].map(b=>(
                <div key={b.name} className={`p-3 rounded-xl text-center text-xs font-medium shadow cursor-pointer hover:scale-105 transition-transform
                  ${b.color==='blue'?'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200':
                    b.color==='purple'?'bg-purple-200 dark:bg-purple-800 text-purple-800':
                    b.color==='green'?'bg-green-200 dark:bg-green-800 text-green-800':
                    b.color==='orange'?'bg-orange-200 dark:bg-orange-800 text-orange-800':
                    b.color==='red'?'bg-red-200 dark:bg-red-800 text-red-800':'bg-gray-200 dark:bg-gray-600 text-gray-700'}`}>
                  <i className="fas fa-building mb-1 block text-base"></i>
                  {b.name}
                  {b.rooms>0 && <div className="text-xs mt-0.5 opacity-80">{b.rooms} rooms</div>}
                </div>
              ))}
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-info-circle"></i>
              <span>Integrate Google Maps API Key in production</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all','available','booked','Classroom','Computer Lab','Seminar Hall'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter===f?'gradient-blue text-white shadow-md':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRooms.map(room => (
          <div key={room.id} className={`rounded-2xl p-4 border-2 cursor-pointer transition-all card-hover ${room.booked ? 'room-booked' : 'room-available'}`}
            onClick={()=>setSelectedRoom(room)}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${room.booked?'bg-red-500':'bg-green-500'} text-white`}>
                <i className={`fas fa-${typeIcon[room.type]||'door-open'} text-sm`}></i>
              </div>
              <Badge color={room.booked?'red':'green'} size="xs">{room.booked?'Booked':'Free'}</Badge>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">{room.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{room.type} • Cap: {room.capacity}</p>
            <p className="text-xs text-gray-500">{room.building} • Floor {room.floor}</p>
            {room.booked && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{room.bookedBy}</p>
                <p className="text-xs text-red-500">{room.time} • {room.purpose}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
        </div>
        <div className="p-5">
          <Table
            columns={[
              { key:'room', label:'Room' },
              { key:'bookedBy', label:'Booked By' },
              { key:'date', label:'Date' },
              { key:'timeSlot', label:'Time Slot' },
              { key:'purpose', label:'Purpose' },
              { key:'status', label:'Status', render:v=><Badge color={v==='confirmed'?'green':'yellow'}>{v}</Badge> },
              { key:'id', label:'Action', render:(v,r)=>role==='admin'&&<div className="flex gap-1">
                <button className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg text-xs"><i className="fas fa-check"></i></button>
                <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs"><i className="fas fa-times"></i></button>
              </div>},
            ]}
            data={bookings}
          />
        </div>
      </div>

      {/* Room Detail Modal */}
      <Modal open={!!selectedRoom} onClose={()=>setSelectedRoom(null)} title="Room Details" size="sm">
        {selectedRoom && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl text-center ${selectedRoom.booked?'bg-red-50 dark:bg-red-900/20':'bg-green-50 dark:bg-green-900/20'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 ${selectedRoom.booked?'bg-red-500':'bg-green-500'} text-white text-2xl shadow-lg`}>
                <i className={`fas fa-${typeIcon[selectedRoom.type]||'door-open'}`}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedRoom.name}</h3>
              <Badge color={selectedRoom.booked?'red':'green'} size="md">{selectedRoom.booked?'Currently Booked':'Available Now'}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Type',selectedRoom.type],['Capacity',selectedRoom.capacity+' seats'],['Building',selectedRoom.building],['Floor',`Floor ${selectedRoom.floor}`]].map(([l,v])=>(
                <div key={l} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-xs text-gray-500">{l}</div>
                  <div className="font-semibold mt-0.5">{v}</div>
                </div>
              ))}
            </div>
            {!selectedRoom.booked && (
              <Button icon="calendar-plus" className="w-full" onClick={()=>{setSelectedRoom(null);setForm({...form,room:selectedRoom.name});setShowBook(true);}}>
                Book This Room
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* Booking Form Modal */}
      <Modal open={showBook} onClose={()=>setShowBook(false)} title="Book a Room" size="md">
        <div className="space-y-0">
          <Select label="Select Room" value={form.room} onChange={e=>setForm({...form,room:e.target.value})} required
            options={[{value:'',label:'-- Select Room --'},...rooms.filter(r=>!r.booked).map(r=>({value:r.name,label:`${r.name} (${r.building}, Cap: ${r.capacity})`}))]}/>
          <Input label="Date" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required/>
          <Select label="Time Slot" value={form.slot} onChange={e=>setForm({...form,slot:e.target.value})} required
            options={[{value:'',label:'-- Select Slot --'},...slots.map(s=>({value:s,label:s}))]}/>
          <Input label="Purpose" value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} placeholder="e.g. Lecture, Lab, Meeting" required/>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-600 dark:text-blue-400 mb-4">
            <i className="fas fa-info-circle mr-1"></i>
            Booking requires admin approval. You'll be notified via email.
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={()=>setShowBook(false)} className="flex-1">Cancel</Button>
            <Button icon="calendar-check" onClick={handleBook} className="flex-1">Confirm Booking</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =====================================================
// ALUMNI MODULE
// =====================================================

const AlumniPage = () => {
  const [alumni, setAlumni] = useState(MOCK_ALUMNI);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [batchFilter, setBatchFilter] = useState('all');

  const filtered = alumni.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.company.toLowerCase().includes(search.toLowerCase());
    const matchBatch = batchFilter==='all' || a.batch===batchFilter;
    return matchSearch && matchBatch;
  });

  const batches = ['all', ...new Set(alumni.map(a=>a.batch))];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alumni Network</h2>
          <p className="text-sm text-gray-500">{alumni.length} registered alumni</p>
        </div>
        <Button icon="user-plus" onClick={()=>setShowAdd(true)}>Register Alumni</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="user-graduate" title="Total Alumni" value="1,247" color="blue"/>
        <StatCard icon="briefcase" title="Employed" value="96%" color="green"/>
        <StatCard icon="building" title="Companies" value="284" color="purple"/>
        <StatCard icon="globe" title="Countries" value="18" color="orange"/>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search alumni..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="flex gap-2">
          {batches.map(b => (
            <button key={b} onClick={()=>setBatchFilter(b)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all capitalize ${batchFilter===b?'gradient-blue text-white shadow-md':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              {b==='all'?'All':b}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => (
          <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 card-hover cursor-pointer" onClick={()=>setSelected(a)}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 gradient-green rounded-2xl flex items-center justify-center text-white font-bold shadow-md">{a.avatar}</div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{a.name}</h4>
                <p className="text-xs text-gray-500">{a.role}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <i className="fas fa-building text-blue-500 w-4 text-center text-xs"></i>
                <span>{a.company}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <i className="fas fa-map-marker-alt text-red-500 w-4 text-center text-xs"></i>
                <span>{a.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Badge color="purple" size="xs">Batch {a.batch}</Badge>
              <Badge color="blue" size="xs">{a.dept}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Alumni Detail Modal */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Alumni Profile" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl">
              <div className="w-16 h-16 gradient-green rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">{selected.avatar}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="text-gray-500 text-sm">{selected.role} @ {selected.company}</p>
                <div className="flex gap-2 mt-1">
                  <Badge color="purple" size="xs">Batch {selected.batch}</Badge>
                  <Badge color="blue" size="xs">{selected.dept}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Location',selected.location,'map-marker-alt'],['Email',selected.email,'envelope'],['LinkedIn',selected.linkedin,'linkedin']].map(([l,v,i])=>(
                <div key={l} className={`p-3 bg-gray-50 dark:bg-gray-700 rounded-xl ${l==='Email'?'col-span-2':''}`}>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-1"><i className={`fab fa-${i} text-blue-500 fas`}></i>{l}</div>
                  <div className="font-medium text-sm truncate">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button icon="envelope" variant="outline" className="flex-1" size="sm">Email</Button>
              <Button icon="linkedin" variant="secondary" className="flex-1" size="sm">LinkedIn</Button>
              <Button icon="comments" className="flex-1" size="sm">Message</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// =====================================================
// SURVEY & FEEDBACK MODULE
// =====================================================

const SurveysPage = ({ role }) => {
  const [surveys] = useState(MOCK_SURVEYS);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const surveyQuestions = [
    { id:1, text:'How would you rate the teaching quality?', type:'rating' },
    { id:2, text:'Course content was relevant and up-to-date', type:'likert' },
    { id:3, text:'Assignments helped understand the subject better', type:'likert' },
    { id:4, text:'Overall satisfaction with the course', type:'rating' },
    { id:5, text:'Any additional feedback or suggestions?', type:'text' },
  ];

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => { setActiveSurvey(null); setSubmitted(false); setResponses({}); }, 2000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Surveys & Feedback</h2>
        <p className="text-sm text-gray-500">Course and teacher evaluation system</p>
      </div>

      {/* Analytics (Admin view) */}
      {role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Survey Response Rate</h3>
            <div style={{height:'200px'}}>
              <BarChart data={[45, 52, 120]} labels={['Course Quality','Teacher Eval','Infrastructure']} title="Responses"/>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Overall Satisfaction</h3>
            <div style={{height:'200px'}}>
              <DoughnutChart data={[35, 45, 15, 5]} labels={['Excellent', 'Good', 'Average', 'Poor']}/>
            </div>
          </div>
        </div>
      )}

      {/* Surveys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {surveys.map(s => (
          <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
            <div className="flex items-start justify-between mb-3">
              <Badge color={s.status==='active'?'green':'gray'}>{s.status}</Badge>
              <Badge color="blue" size="xs">{s.subject}</Badge>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h4>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span><i className="fas fa-users mr-1"></i>{s.responses} responses</span>
              <span><i className="fas fa-calendar mr-1"></i>Until {s.deadline}</span>
            </div>
            {s.status === 'active' && role === 'student' && (
              <Button size="sm" icon="poll" className="w-full" onClick={()=>setActiveSurvey(s)}>Take Survey</Button>
            )}
            {role === 'admin' && (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" icon="chart-bar" className="flex-1">Analytics</Button>
                {s.status==='active' && <Button size="sm" variant="danger" className="flex-1">Close</Button>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Survey Taking Modal */}
      <Modal open={!!activeSurvey} onClose={()=>setActiveSurvey(null)} title={activeSurvey?.title} size="md">
        {!submitted ? (
          <div className="space-y-5">
            {surveyQuestions.map(q => (
              <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">{q.id}. {q.text}</p>
                {q.type === 'rating' && (
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={()=>setResponses({...responses,[q.id]:v})}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${responses[q.id]===v?'gradient-blue text-white shadow-md':'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:border-blue-400'}`}>
                        {'⭐'.repeat(v)}
                      </button>
                    ))}
                  </div>
                )}
                {q.type === 'likert' && (
                  <div className="flex gap-1 flex-wrap">
                    {['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree'].map(opt => (
                      <button key={opt} onClick={()=>setResponses({...responses,[q.id]:opt})}
                        className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium transition-all min-w-fit ${responses[q.id]===opt?'gradient-blue text-white shadow-md':'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:border-blue-400'}`}>
                        {opt.split(' ').slice(-1)[0]}
                      </button>
                    ))}
                  </div>
                )}
                {q.type === 'text' && (
                  <textarea value={responses[q.id]||''} onChange={e=>setResponses({...responses,[q.id]:e.target.value})}
                    placeholder="Your feedback..." rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-600 text-sm focus:ring-2 focus:ring-blue-500 resize-none"/>
                )}
              </div>
            ))}
            <Button icon="paper-plane" className="w-full" onClick={handleSubmit}>Submit Feedback</Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
            <p className="text-gray-500">Your feedback has been submitted successfully.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
