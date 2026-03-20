
// =====================================================
// ATTENDANCE MODULE
// =====================================================

const AttendancePage = ({ role }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [markingMode, setMarkingMode] = useState(false);
  const [attendance, setAttendance] = useState(
    MOCK_STUDENTS.reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {})
  );

  if (role === 'student') {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Attendance</h2>
            <p className="text-sm text-gray-500">Track your subject-wise attendance</p>
          </div>
          <Badge color="blue">Sem 5 • 2025-26</Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center border border-green-200 dark:border-green-700">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">85%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall Attendance</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center border border-blue-200 dark:border-blue-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">204</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Classes Attended</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center border border-red-200 dark:border-red-700">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">42</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Classes Missed</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Monthly Attendance Trend</h3>
          <div style={{height:'200px'}}>
            <LineChart data={[88,92,78,85,82,89,85,83]} labels={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug']} title="Attendance %"/>
          </div>
        </div>

        {/* Subject-wise */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Subject-wise Attendance</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {MOCK_ATTENDANCE.map((a, i) => (
              <div key={i} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{a.subject}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{a.present} out of {a.total} classes attended</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${a.percent >= 75 ? 'text-green-500' : 'text-red-500'}`}>{a.percent}%</div>
                    {a.percent < 75 && <div className="text-xs text-red-500">Below minimum</div>}
                  </div>
                </div>
                <ProgressBar value={a.percent}/>
                {a.percent < 75 && (
                  <div className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    Need {Math.ceil((0.75 * a.total - a.present) / 0.25)} more classes to reach 75%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Teacher/Admin attendance marking
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Management</h2>
          <p className="text-sm text-gray-500">Mark and track student attendance</p>
        </div>
        <Button icon={markingMode ? 'check' : 'edit'} onClick={() => setMarkingMode(!markingMode)}
          variant={markingMode ? 'success' : 'primary'}>
          {markingMode ? 'Save Attendance' : 'Mark Attendance'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="check-circle" title="Present Today" value="178" color="green" sub="out of 200"/>
        <StatCard icon="times-circle" title="Absent Today" value="22" color="red" sub="notified"/>
        <StatCard icon="percentage" title="Today's Rate" value="89%" color="blue"/>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Date:</label>
            <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600"/>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Subject:</label>
            <select value={selectedSubject} onChange={e=>setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600">
              <option value="all">All Subjects</option>
              {MOCK_ATTENDANCE.map(a => <option key={a.subject} value={a.subject}>{a.subject}</option>)}
            </select>
          </div>
          {markingMode && (
            <div className="flex gap-2 ml-auto">
              <button onClick={()=>setAttendance(MOCK_STUDENTS.reduce((a,s)=>({...a,[s.id]:'present'}),{}))}
                className="px-3 py-2 bg-green-100 text-green-600 rounded-xl text-xs font-medium">Mark All Present</button>
              <button onClick={()=>setAttendance(MOCK_STUDENTS.reduce((a,s)=>({...a,[s.id]:'absent'}),{}))}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-medium">Mark All Absent</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_STUDENTS.map(student => (
            <div key={student.id} className={`p-4 rounded-xl border-2 transition-all ${
              attendance[student.id]==='present' ? 'border-green-300 bg-green-50 dark:bg-green-900/10' :
              attendance[student.id]==='absent' ? 'border-red-300 bg-red-50 dark:bg-red-900/10' :
              'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 gradient-blue rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {student.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{student.name.split(' ')[0]}</div>
                    <div className="text-xs text-gray-500">{student.usn}</div>
                  </div>
                </div>
                {markingMode ? (
                  <div className="flex gap-1">
                    <button onClick={()=>setAttendance({...attendance,[student.id]:'present'})}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${attendance[student.id]==='present'?'bg-green-500 text-white':'bg-gray-100 dark:bg-gray-600 text-gray-400 hover:bg-green-100'}`}>
                      <i className="fas fa-check text-xs"></i>
                    </button>
                    <button onClick={()=>setAttendance({...attendance,[student.id]:'absent'})}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${attendance[student.id]==='absent'?'bg-red-500 text-white':'bg-gray-100 dark:bg-gray-600 text-gray-400 hover:bg-red-100'}`}>
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                ) : (
                  <Badge color={attendance[student.id]==='present'?'green':'red'} size="xs">
                    {attendance[student.id]==='present'?'P':'A'}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MARKS MODULE
// =====================================================

const MarksPage = ({ role }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [tab, setTab] = useState('marks');

  const getGradeColor = (grade) => {
    if (grade.includes('A')) return 'green';
    if (grade.includes('B')) return 'blue';
    if (grade.includes('C')) return 'yellow';
    return 'red';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{role==='student'?'My Marks':'Marks Management'}</h2>
          <p className="text-sm text-gray-500">{role==='student'?'Internal & External assessment marks':'Upload and manage student marks'}</p>
        </div>
        {role !== 'student' && <Button icon="upload" onClick={()=>setShowUpload(true)}>Upload Marks</Button>}
      </div>

      {role === 'student' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center border border-blue-200 dark:border-blue-700">
            <div className="text-2xl font-bold text-blue-600">8.4</div>
            <div className="text-xs text-gray-500 mt-1">Current CGPA</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center border border-green-200 dark:border-green-700">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-xs text-gray-500 mt-1">Class Rank</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center border border-purple-200 dark:border-purple-700">
            <div className="text-2xl font-bold text-purple-600">A</div>
            <div className="text-xs text-gray-500 mt-1">Most Common Grade</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold">Subject-wise Marks</h3>
          </div>
          <div className="p-5">
            <Table
              columns={[
                { key:'subject', label:'Subject' },
                { key:'internal', label:'Internal', render:(v,r)=><span className="font-semibold text-blue-600">{v}/50</span> },
                { key:'external', label:'External', render:(v,r)=><span className="font-semibold text-purple-600">{v}/100</span> },
                { key:'total', label:'Total', render:(v,r)=><span className="font-bold text-gray-900 dark:text-white">{v}/{r.max}</span> },
                { key:'grade', label:'Grade', render:(v)=><Badge color={getGradeColor(v)}>{v}</Badge> },
              ]}
              data={MOCK_MARKS}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Marks Distribution</h3>
          <div style={{height:'200px'}}>
            <BarChart data={[117,106,127,94,123]} labels={['DSA','OS','DBMS','CN','SE']} title="Marks"/>
          </div>
          <div className="mt-4 space-y-2">
            {MOCK_MARKS.map(m => (
              <div key={m.subject} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 truncate mr-3">{m.subject}</span>
                <div className="flex items-center gap-2">
                  <ProgressBar value={m.total} max={m.max} showLabel={false}/>
                  <span className="font-semibold w-12 text-right">{Math.round(m.total/m.max*100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={showUpload} onClose={()=>setShowUpload(false)} title="Upload Marks" size="md">
        <div className="space-y-4">
          <Select label="Course" value="" onChange={()=>{}} options={MOCK_COURSES.map(c=>({value:c.id,label:c.name}))} required/>
          <Select label="Assessment Type" value="internal" onChange={()=>{}} options={[{value:'internal',label:'Internal Assessment'},{value:'external',label:'External Exam'},{value:'practical',label:'Practical'}]} required/>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors">
            <i className="fas fa-file-excel text-4xl text-gray-400 mb-3 block"></i>
            <p className="text-sm text-gray-600 dark:text-gray-400">Drop Excel/CSV file here or <span className="text-blue-500">browse</span></p>
            <p className="text-xs text-gray-400 mt-1">Format: USN, Student Name, Marks</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={()=>setShowUpload(false)} className="flex-1">Cancel</Button>
            <Button icon="upload" className="flex-1">Upload Marks</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =====================================================
// ASSIGNMENTS MODULE
// =====================================================

const AssignmentsPage = ({ role }) => {
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);

  const statusColor = { submitted:'green', pending:'yellow', overdue:'red' };
  const statusIcon = { submitted:'check-circle', pending:'clock', overdue:'exclamation-circle' };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assignments</h2>
          <p className="text-sm text-gray-500">{role==='student'?'Your assignments and submissions':'Manage course assignments'}</p>
        </div>
        {role !== 'student' && <Button icon="plus" onClick={()=>setShowCreate(true)}>Create Assignment</Button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-700 cursor-pointer" onClick={()=>setFilter('pending')}>
          <div className="text-2xl font-bold text-yellow-600">{assignments.filter(a=>a.status==='pending').length}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-700 cursor-pointer" onClick={()=>setFilter('submitted')}>
          <div className="text-2xl font-bold text-green-600">{assignments.filter(a=>a.status==='submitted').length}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Submitted</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-700 cursor-pointer" onClick={()=>setFilter('overdue')}>
          <div className="text-2xl font-bold text-red-600">{assignments.filter(a=>a.status==='overdue').length}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Overdue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all','pending','submitted','overdue'].map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter===f?'gradient-blue text-white shadow-md':'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(a => (
          <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 card-hover cursor-pointer" onClick={()=>setSelected(a)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Badge color="blue" size="xs">{a.subject}</Badge>
                <h4 className="font-semibold text-gray-900 dark:text-white mt-2">{a.title}</h4>
              </div>
              <Badge color={statusColor[a.status]}>
                <i className={`fas fa-${statusIcon[a.status]} mr-1`}></i>{a.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{a.description}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500"><i className="fas fa-calendar mr-1"></i>Due: {a.deadline}</div>
              {a.marks !== null ? (
                <Badge color="green" size="xs"><i className="fas fa-star mr-1"></i>{a.marks}/{a.maxMarks}</Badge>
              ) : (
                <Badge color="gray" size="xs"><i className="fas fa-question-circle mr-1"></i>Not graded</Badge>
              )}
            </div>
            {role === 'student' && a.status === 'pending' && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={(e)=>{e.stopPropagation(); alert('File upload dialog opened')}}
                  className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-500 rounded-xl text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <i className="fas fa-upload mr-2"></i>Submit Assignment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Assignment Detail Modal */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Assignment Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge color="blue">{selected.subject}</Badge>
              <Badge color={statusColor[selected.status]}>{selected.status}</Badge>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selected.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="text-xs text-gray-500">Deadline</div>
                <div className="font-semibold text-sm mt-0.5">{selected.deadline}</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="text-xs text-gray-500">Max Marks</div>
                <div className="font-semibold text-sm mt-0.5">{selected.maxMarks}</div>
              </div>
              {selected.marks !== null && (
                <div className="col-span-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="text-xs text-gray-500">Marks Obtained</div>
                  <div className="font-bold text-lg text-green-600 mt-0.5">{selected.marks}/{selected.maxMarks}</div>
                  <ProgressBar value={selected.marks} max={selected.maxMarks}/>
                </div>
              )}
            </div>
            {role === 'student' && selected.status === 'pending' && (
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center">
                <i className="fas fa-cloud-upload-alt text-3xl text-blue-400 mb-2 block"></i>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upload your solution</p>
                <p className="text-xs text-gray-400">PDF, DOCX, ZIP supported</p>
                <Button size="sm" icon="upload" className="mt-3">Upload File</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Assignment Modal */}
      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Create New Assignment">
        <div>
          <Input label="Assignment Title" value="" onChange={()=>{}} placeholder="Enter assignment title" required/>
          <Select label="Course" value="" onChange={()=>{}} options={MOCK_COURSES.map(c=>({value:c.id,label:c.name}))} required/>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea placeholder="Detailed description..." rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 resize-none"/>
          </div>
          <div className="grid grid-cols-2 gap-0">
            <Input label="Deadline" type="date" value="" onChange={()=>{}} required className="pr-2"/>
            <Input label="Max Marks" type="number" value="" onChange={()=>{}} placeholder="50" required className="pl-2"/>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={()=>setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button icon="plus" className="flex-1" onClick={()=>setShowCreate(false)}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
