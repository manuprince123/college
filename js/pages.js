
// =====================================================
// AI ASSISTANT MODULE
// =====================================================

const AIAssistantPage = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello ${user.name.split(' ')[0]}! 👋 I'm your AI Academic Assistant powered by advanced language models.\n\nI can help you with:\n• 📊 Attendance status & analysis\n• 📝 Assignment deadlines & submissions\n• 📚 Course information & schedules\n• 🏆 Performance summaries\n• 📅 Room booking queries\n• 🎓 Academic guidance\n\nWhat would you like to know today?`,
      time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState('chat');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  const getAIResponse = (msg) => {
    const m = msg.toLowerCase();
    if (m.includes('attendance')) {
      return `📊 **Your Attendance Summary:**\n\n${MOCK_ATTENDANCE.map(a => `• **${a.subject}**: ${a.percent}% (${a.present}/${a.total} classes) ${a.percent < 75 ? '⚠️ Below minimum!' : '✅'}`).join('\n')}\n\n**Overall Average**: 83.2%\n\n${MOCK_ATTENDANCE.some(a=>a.percent<75) ? '⚠️ **Alert**: You have low attendance in some subjects. Please attend classes regularly to avoid debarment.' : '🎉 Great job maintaining good attendance!'}`;
    }
    if (m.includes('mark') || m.includes('grade')) {
      return `📝 **Your Latest Marks:**\n\n${MOCK_MARKS.map(m => `• **${m.subject}**: ${m.total}/${m.max} (Grade: **${m.grade}**)`).join('\n')}\n\n**CGPA**: 8.4 | **Rank**: 12 out of 62\n\n💡 **Tip**: Your strongest subject is DBMS (${MOCK_MARKS.find(x=>x.subject==='DBMS')?.grade}). Focus on improving Computer Networks performance.`;
    }
    if (m.includes('assignment') || m.includes('deadline') || m.includes('due')) {
      const pending = MOCK_ASSIGNMENTS.filter(a=>a.status==='pending');
      const overdue = MOCK_ASSIGNMENTS.filter(a=>a.status==='overdue');
      return `📋 **Assignment Status:**\n\n**Pending (${pending.length}):**\n${pending.map(a=>`• ${a.title} (${a.subject}) - Due: ${a.deadline}`).join('\n')}\n\n**Overdue (${overdue.length}):**\n${overdue.map(a=>`• ⚠️ ${a.title} (${a.subject}) - OVERDUE`).join('\n')}\n\n⏰ **Action Required**: Please submit pending assignments before their deadlines to avoid late penalties.`;
    }
    if (m.includes('course') || m.includes('subject')) {
      return `📚 **Your Enrolled Courses (Semester 5):**\n\n${MOCK_COURSES.slice(0,5).map(c=>`• **${c.code}** - ${c.name}\n  Teacher: ${c.teacher} | Credits: ${c.credits}`).join('\n\n')}\n\n**Total Credits**: 18\n\nWould you like specific information about any course?`;
    }
    if (m.includes('room') || m.includes('book') || m.includes('booking')) {
      const available = MOCK_ROOMS.filter(r=>!r.booked).length;
      return `🏫 **Room Availability:**\n\n**Available Now**: ${available} rooms\n**Booked**: ${MOCK_ROOMS.length - available} rooms\n\n**Available Rooms:**\n${MOCK_ROOMS.filter(r=>!r.booked).slice(0,4).map(r=>`• ${r.name} (${r.type}, Cap: ${r.capacity}) - ${r.building}`).join('\n')}\n\nTo book a room, go to the **Room Booking** section in the sidebar, select your preferred room, date, and time slot.`;
    }
    if (m.includes('schedule') || m.includes('timetable')) {
      return `📅 **Today's Schedule:**\n\n• 9:00 AM - Data Structures (Room 101)\n• 11:00 AM - Operating Systems (CS Lab 1)\n• 2:00 PM - DBMS Lab (CS Lab 2)\n• 4:00 PM - Software Engineering (Room 203)\n\n**Tomorrow:**\n• 10:00 AM - Computer Networks\n• 3:00 PM - SE Project Review\n\nCheck the timetable module for the complete weekly schedule.`;
    }
    if (m.includes('performance') || m.includes('summary') || m.includes('report')) {
      return `🏆 **AI Performance Summary for ${user.name}:**\n\n**Overall Assessment**: Good Academic Standing 📈\n\n**Strengths:**\n✅ Excellent DBMS performance (A+ grade)\n✅ Strong Software Engineering attendance (96%)\n✅ Consistent CGPA above 8.0\n\n**Areas for Improvement:**\n⚠️ Computer Networks attendance (67%) - needs attention\n📝 2 pending assignments require immediate submission\n\n**Predicted CGPA**: 8.2 - 8.6 (based on current trends)\n\n**Recommendations:**\n1. Attend all Computer Networks classes\n2. Submit overdue TCP/IP assignment immediately\n3. Start Sprint Planning early for SE project`;
    }
    if (m.includes('hello') || m.includes('hi') || m.includes('hey')) {
      return `Hello! 😊 Great to see you!\n\nI'm ready to assist with your academic queries. You can ask me about:\n• Your attendance & marks\n• Assignment deadlines\n• Course information\n• Room bookings\n• Performance analysis\n\nWhat can I help you with today?`;
    }
    if (m.includes('help') || m.includes('what can you do')) {
      return `🤖 **AI Assistant Capabilities:**\n\n**Academic Information:**\n• Check attendance percentage\n• View marks & grades\n• Assignment deadlines & status\n• Course & schedule info\n\n**Smart Analysis:**\n• Performance summaries\n• Attendance risk alerts\n• Grade predictions\n• Personalized recommendations\n\n**Campus Services:**\n• Room availability & booking\n• Event & exam schedules\n• Alumni connections\n\n**Integration Note**: In production, this connects to OpenAI GPT-4 API with your college's live database for real-time accurate responses.\n\nHow can I help you today?`;
    }
    return `I understand you're asking about "${msg}". Let me provide you with relevant information.\n\nBased on your academic profile, I can see you're in **${user.dept}, Semester ${user.semester||5}**.\n\n💡 **Quick tip**: Try asking me specifically about:\n• "Show my attendance"\n• "What are my marks?"\n• "Upcoming assignment deadlines"\n• "Available rooms today"\n• "Give me a performance summary"\n\n**Note**: In the production version with OpenAI API integration, I can answer much more complex and contextual questions using your live college data.`;
  };

  const sendMessage = () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: messages.length + 1, role: 'user', content: input, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    const q = input;
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const aiMsg = { id: messages.length + 2, role: 'assistant', content: getAIResponse(q), time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 1000 + Math.random() * 800);
  };

  const quickPrompts = [
    { icon:'chart-pie', text:'My attendance status', q:'Show my attendance status' },
    { icon:'star', text:'My marks & grades', q:'Show my marks and grades' },
    { icon:'tasks', text:'Assignment deadlines', q:'Show my assignment deadlines' },
    { icon:'chart-line', text:'Performance summary', q:'Give me a performance summary and recommendations' },
    { icon:'calendar', text:"Today's schedule", q:"What is today's schedule?" },
    { icon:'door-open', text:'Available rooms', q:'Show available rooms for booking today' },
  ];

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <div key={i} dangerouslySetInnerHTML={{__html: line || '&nbsp;'}} className={line.startsWith('•') ? 'pl-2' : ''}/>;
    });
  };

  return (
    <div className="animate-fade-in h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Academic Assistant</h2>
          <p className="text-sm text-gray-500">Powered by OpenAI GPT • Smart college queries</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div>
          <span className="text-xs text-green-500 font-medium">AI Active</span>
        </div>
      </div>

      {/* Feature Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {[['chat','comments','AI Chat'],['summary','file-alt','Performance Summary'],['alerts','bell','Smart Alerts']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setActiveFeature(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeFeature===id?'bg-white dark:bg-gray-700 text-blue-600 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
            <i className={`fas fa-${icon} text-xs`}></i>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {activeFeature === 'chat' && (
        <div className="flex flex-col gap-4 flex-1">
          {/* Quick Prompts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickPrompts.map(p => (
              <button key={p.text} onClick={()=>{ setInput(p.q); }}
                className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-all text-left">
                <i className={`fas fa-${p.icon} text-blue-500 flex-shrink-0`}></i>
                <span>{p.text}</span>
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden" style={{minHeight:'400px', maxHeight:'500px'}}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role==='user'?'justify-end':'justify-start'} animate-slide-in`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">AI</div>
                  )}
                  <div className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role==='user'?'chat-bubble-user text-white rounded-br-none':'chat-bubble-ai text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                    <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                    <div className={`text-xs mt-2 opacity-60 ${msg.role==='user'?'text-right':''}`}>{msg.time}</div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 gradient-blue rounded-full flex items-center justify-center text-white text-xs font-bold ml-2 flex-shrink-0 mt-1">{user.avatar}</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-slide-in">
                  <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">AI</div>
                  <div className="chat-bubble-ai rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="typing-indicator flex gap-1 items-center h-5">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex gap-2">
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()}
                  placeholder="Ask about attendance, marks, assignments, rooms..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600"/>
                <button onClick={sendMessage} disabled={!input.trim()||loading}
                  className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-all disabled:opacity-50 shadow-md">
                  <i className="fas fa-paper-plane text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeFeature === 'summary' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 gradient-purple rounded-xl flex items-center justify-center shadow-md">
                <i className="fas fa-robot text-white text-lg"></i>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">AI Performance Summary</h3>
                <p className="text-xs text-gray-500">Generated {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex items-start gap-2"><i className="fas fa-chart-line text-blue-500 mt-0.5"></i><p><strong>Overall Standing:</strong> Good academic performance. CGPA 8.4 is above class average of 7.8.</p></div>
              <div className="flex items-start gap-2"><i className="fas fa-thumbs-up text-green-500 mt-0.5"></i><p><strong>Strengths:</strong> Excellent in DBMS (A+ grade), strong attendance in SE (96%), consistent assignment submissions.</p></div>
              <div className="flex items-start gap-2"><i className="fas fa-exclamation-triangle text-yellow-500 mt-0.5"></i><p><strong>Concerns:</strong> Computer Networks attendance at 67% - at risk for exam debarment. TCP/IP assignment overdue.</p></div>
              <div className="flex items-start gap-2"><i className="fas fa-lightbulb text-purple-500 mt-0.5"></i><p><strong>Recommendation:</strong> Attend next 8 CN classes consecutively to bring attendance to 75%. Focus revision on OS (79% attendance suggests gaps).</p></div>
              <div className="flex items-start gap-2"><i className="fas fa-crystal-ball text-orange-500 mt-0.5"></i><p><strong>Predicted CGPA:</strong> 8.2 - 8.6 based on current trend if pending assignments are submitted.</p></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold mb-4">Performance Trend</h3>
              <div style={{height:'180px'}}>
                <LineChart data={[7.8, 8.0, 7.9, 8.2, 8.4, 8.3, 8.4]} labels={['Sem1','Sem2','Sem3','Sem4','Sem5','Proj','Now']} title="CGPA"/>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold mb-4">Subject Performance Radar</h3>
              <div style={{height:'180px'}}>
                <RadarChart data={[84, 79, 90, 67, 96]} labels={['DSA','OS','DBMS','CN','SE']}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeFeature === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4"><i className="fas fa-robot text-purple-500 mr-2"></i>AI-Generated Smart Alerts</h3>
            <div className="space-y-3">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-red-700 dark:text-red-400 text-sm"><i className="fas fa-exclamation-circle mr-2"></i>Critical Alert</span>
                  <Badge color="red" size="xs">Urgent</Badge>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300">Computer Networks attendance at <strong>67%</strong> — you need to attend <strong>8 more classes</strong> to avoid debarment.</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-orange-700 dark:text-orange-400 text-sm"><i className="fas fa-clock mr-2"></i>Deadline Alert</span>
                  <Badge color="orange" size="xs">5 days</Badge>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-300">Assignment "Process Scheduling Simulation" due in 5 days. Start working on it now.</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-yellow-700 dark:text-yellow-400 text-sm"><i className="fas fa-calendar-alt mr-2"></i>Exam Alert</span>
                  <Badge color="yellow" size="xs">2 weeks</Badge>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">Internal Assessment 2 scheduled in 2 weeks. DSA and OS need focused revision.</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-green-700 dark:text-green-400 text-sm"><i className="fas fa-trophy mr-2"></i>Achievement</span>
                  <Badge color="green" size="xs">New</Badge>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300">CGPA improved from 8.2 to 8.4 this semester. Keep up the great work!</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-blue-700 dark:text-blue-400 text-sm"><i className="fas fa-info-circle mr-2"></i>Info</span>
                  <Badge color="blue" size="xs">Today</Badge>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300">Course feedback survey is active. Your responses help improve teaching quality.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// NOTIFICATIONS PAGE
// =====================================================

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const markAll = () => setNotifications(notifications.map(n=>({...n,read:true})));
  const typeColors = { warning:'yellow', info:'blue', success:'green', error:'red' };
  const typeIcons = { warning:'exclamation-triangle', info:'info-circle', success:'check-circle', error:'times-circle' };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          <p className="text-sm text-gray-500">{notifications.filter(n=>!n.read).length} unread</p>
        </div>
        <Button variant="secondary" size="sm" icon="check-double" onClick={markAll}>Mark All Read</Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-start gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!n.read?'bg-blue-50/30 dark:bg-blue-900/5':''}`}
            onClick={()=>setNotifications(notifications.map(x=>x.id===n.id?{...x,read:true}:x))}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[n.type]==='yellow'?'bg-yellow-100 text-yellow-600':typeColors[n.type]==='blue'?'bg-blue-100 text-blue-600':typeColors[n.type]==='green'?'bg-green-100 text-green-600':'bg-red-100 text-red-600'}`}>
              <i className={`fas fa-${typeIcons[n.type]} text-sm`}></i>
            </div>
            <div className="flex-1">
              <p className={`text-sm ${!n.read?'font-medium text-gray-900 dark:text-white':'text-gray-600 dark:text-gray-400'}`}>{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
            </div>
            {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================================================
// PERFORMANCE / REPORTS MODULE
// =====================================================

const ReportsPage = ({ role }) => (
  <div className="animate-fade-in space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{role==='admin'?'Reports & Analytics':'Performance Analytics'}</h2>
        <p className="text-sm text-gray-500">Comprehensive academic insights</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" icon="file-pdf">Export PDF</Button>
        <Button variant="secondary" size="sm" icon="file-excel">Export Excel</Button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold mb-4">Department-wise Performance</h3>
        <div style={{height:'220px'}}>
          <BarChart data={[78, 82, 75, 80, 85]} labels={['CS','EC','ME','CV','IT']} title="Avg Marks %"/>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold mb-4">Pass/Fail Distribution</h3>
        <div style={{height:'220px'}}>
          <DoughnutChart data={[78, 12, 8, 2]} labels={['Pass', 'Fail', 'Absent', 'Others']}/>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold mb-4">Monthly Attendance Trend</h3>
        <div style={{height:'220px'}}>
          <LineChart data={[82,85,79,88,83,87,85,86]} labels={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug']} title="Attendance %"/>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold mb-4">Grade Distribution</h3>
        <div style={{height:'220px'}}>
          <BarChart data={[120, 280, 340, 210, 180, 95, 22]} labels={['O','A+','A','B+','B','C','F']} title="Students"/>
        </div>
      </div>
    </div>

    {/* Teacher Performance */}
    {role === 'admin' && (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold">Teacher Performance Ratings</h3>
        </div>
        <div className="p-5">
          <Table
            columns={[
              { key:'name', label:'Teacher' },
              { key:'dept', label:'Department', render:v=><Badge color="blue" size="xs">{v}</Badge> },
              { key:'courses', label:'Courses' },
              { key:'rating', label:'Rating', render:v=>(
                <div className="flex items-center gap-2">
                  <div className="flex">{[1,2,3,4,5].map(i=><i key={i} className={`fas fa-star text-xs ${i<=Math.round(v)?'text-yellow-400':'text-gray-300'}`}></i>)}</div>
                  <span className="text-sm font-bold">{v}</span>
                </div>
              )},
              { key:'attendance', label:'Avg Class Att.', render:v=><span className={`font-semibold ${v>=80?'text-green-500':'text-yellow-500'}`}>{v}%</span> },
            ]}
            data={[
              { name:'Prof. Priya Sharma', dept:'CS', courses:'DSA, DBMS', rating:4.7, attendance:86 },
              { name:'Prof. Rajesh Kumar', dept:'CS', courses:'OS', rating:4.2, attendance:79 },
              { name:'Prof. Anjali Menon', dept:'CS', courses:'CN', rating:4.5, attendance:82 },
              { name:'Prof. Suresh Nair', dept:'CS', courses:'SE', rating:4.8, attendance:91 },
            ]}
          />
        </div>
      </div>
    )}
  </div>
);

// =====================================================
// PROFILE PAGE
// =====================================================

const ProfilePage = ({ user }) => (
  <div className="animate-fade-in space-y-6 max-w-2xl">
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h2>
      <p className="text-sm text-gray-500">Manage your personal information</p>
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="gradient-bg h-32 relative">
        <div className="absolute -bottom-8 left-6">
          <div className="w-20 h-20 gradient-blue rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl border-4 border-white dark:border-gray-800">{user.avatar}</div>
        </div>
      </div>
      <div className="pt-12 pb-6 px-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
        <p className="text-gray-500 capitalize">{user.role} • {user.dept}</p>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Input label="Full Name" value={user.name} onChange={()=>{}} />
          <Input label="Email" type="email" value={user.email} onChange={()=>{}} />
          {user.usn && <Input label="USN" value={user.usn} onChange={()=>{}} />}
          {user.semester && <Input label="Semester" value={`Semester ${user.semester}`} onChange={()=>{}} />}
        </div>
        <Button icon="save" className="mt-4">Save Changes</Button>
      </div>
    </div>
  </div>
);

// =====================================================
// STUDENT FORUM
// =====================================================
const ForumPage = () => {
  const [posts] = useState([
    { id:1, author:'Arjun Mehta', company:'Google', content:'Happy to share my interview experience at Google! The key was strong DSA fundamentals. Practice LeetCode medium problems daily.', time:'2 hours ago', likes:45, replies:12 },
    { id:2, author:'Anita Patel', company:'TCS', content:'Batch 2025 students - start your resume early! Industry experience: communication skills matter as much as technical skills.', time:'1 day ago', likes:38, replies:8 },
    { id:3, author:'Vikram Nair', company:'Infosys', content:'We have campus recruitment openings at Infosys for 2025 batch. Refer students with CGPA > 7.5 and good communication.', time:'3 days ago', likes:67, replies:23 },
  ]);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alumni-Student Forum</h2>
        <p className="text-sm text-gray-500">Connect with alumni for guidance and opportunities</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <textarea placeholder="Share your experience or ask a question..." rows={3}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 resize-none mb-3"/>
        <Button icon="paper-plane" size="sm">Post</Button>
      </div>
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center text-white text-sm font-bold">{post.author.split(' ').map(w=>w[0]).join('')}</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{post.author}</div>
                <div className="text-xs text-gray-500">{post.company} • {post.time}</div>
              </div>
              <Badge color="green" size="xs" className="ml-auto">Alumni</Badge>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors">
                <i className="fas fa-thumbs-up"></i>{post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors">
                <i className="fas fa-comment"></i>{post.replies} replies
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors ml-auto">
                <i className="fas fa-share"></i>Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
