// ============================================================
// auth.js  –  Register + Login pages
// ============================================================

// ============================================================
//  RegisterPage
// ============================================================
function RegisterPage({ onNavigate, toast }) {
  const [step, setStep]     = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const [form, setForm] = React.useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: '', department: '', semester: '',
  });
  const [errors, setErrors] = React.useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  function validateStep1() {
    const errs = {};
    if (!validateName(form.name))        errs.name = 'Full name must be at least 2 characters';
    if (!validateEmail(form.email))      errs.email = 'Enter a valid email address';
    if (!validatePassword(form.password)) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.role)                      errs.role = 'Please select a role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs = {};
    if (form.role !== 'admin' && !form.department) errs.department = 'Please select a department';
    if (form.role === 'student' && !form.semester)  errs.semester  = 'Please select current semester';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() { if (validateStep1()) setStep(2); }

  async function handleRegister() {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const extra = {};
      if (form.role !== 'admin') extra.department = form.department;
      if (form.role === 'student') extra.semester = form.semester;
      const data = await API.register(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.role, extra);
      toast('🎉 Account created! Your ID: ' + data.user.unique_id, 'success', 5000);
      setTimeout(() => onNavigate('login'), 1600);
    } catch (err) {
      toast(err.message || 'Registration failed', 'error');
      if (err.message && err.message.toLowerCase().includes('email')) { setErrors({ email: err.message }); setStep(1); }
    } finally { setLoading(false); }
  }

  const roleOptions = [
    { value: 'student', label: '🎓 Student' },
    { value: 'teacher', label: '📚 Teacher' },
    { value: 'admin',   label: '🛡️ Admin'   },
  ];

  const StepBar = () =>
    React.createElement('div', { className: 'flex items-center gap-2 mb-6' },
      [1,2].map((s,i) =>
        React.createElement(React.Fragment, { key: s },
          i > 0 && React.createElement('div', { className: 'flex-1 h-0.5 ' + (step > 1 ? 'bg-blue-500' : 'bg-slate-200') }),
          React.createElement('div', {
            className: 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ' +
              (step >= s ? 'grad-hero text-white shadow-md' : 'bg-slate-100 text-slate-400')
          }, step > s ? React.createElement('i',{className:'fas fa-check text-xs'}) : s)
        )
      ),
      React.createElement('span', { className: 'ml-2 text-xs text-slate-400' }, 'Step ' + step + ' of 2')
    );

  return React.createElement('div', { className: 'min-h-screen flex' },
    // Left decorative panel
    React.createElement('div', { className: 'hidden lg:flex lg:w-2/5 grad-hero flex-col justify-between p-10 text-white relative overflow-hidden' },
      React.createElement('div',{style:{position:'absolute',width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,0.07)',top:-70,right:-70}}),
      React.createElement('div',{style:{position:'absolute',width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.07)',bottom:-50,left:-50}}),
      React.createElement('div', { className: 'relative z-10' },
        React.createElement('div', { className: 'flex items-center gap-3 mb-10' },
          React.createElement('div', { className: 'w-11 h-11 rounded-2xl flex items-center justify-center text-xl', style:{background:'rgba(255,255,255,0.2)'} },
            React.createElement('i', { className: 'fas fa-university' })
          ),
          React.createElement('div', null,
            React.createElement('div', { className: 'font-extrabold text-lg' }, 'EduManage'),
            React.createElement('div', { className: 'text-blue-200 text-xs' }, 'College Management System')
          )
        ),
        React.createElement('h1', { className: 'text-3xl font-extrabold mb-4 leading-tight' }, 'Join Our\nAcademic\nCommunity'),
        React.createElement('p', { className: 'text-blue-200 text-sm leading-relaxed' },
          'Register and get instant access to your personalised academic dashboard.')
      ),
      React.createElement('div', { className: 'relative z-10 space-y-4' },
        [
          { icon:'fa-id-card',       text:'Auto-generated unique ID (STU001, TEA001…)' },
          { icon:'fa-shield-halved', text:'Secure bcrypt password hashing + JWT tokens' },
          { icon:'fa-layer-group',   text:'Role-based access: Student · Teacher · Admin' },
        ].map(f =>
          React.createElement('div', { key: f.icon, className: 'flex items-center gap-3' },
            React.createElement('div', { className:'w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0', style:{background:'rgba(255,255,255,0.15)'} },
              React.createElement('i', { className: 'fas ' + f.icon })
            ),
            React.createElement('span', { className: 'text-blue-100 text-sm' }, f.text)
          )
        )
      )
    ),

    // Right form panel
    React.createElement('div', { className: 'flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto' },
      React.createElement('div', { className: 'w-full max-w-md animate-fadeIn' },
        React.createElement('div', { className: 'text-center mb-7' },
          React.createElement('div', { className: 'lg:hidden w-14 h-14 grad-hero rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg' },
            React.createElement('i', { className: 'fas fa-user-plus' })
          ),
          React.createElement('h2', { className: 'text-2xl font-extrabold text-slate-800' }, 'Create Account'),
          React.createElement('p', { className: 'text-slate-500 text-sm mt-1' }, 'Fill in your details to get started')
        ),

        React.createElement('div', { className: 'card p-7' },
          React.createElement(StepBar),

          // STEP 1
          step === 1 && React.createElement('div', { className: 'animate-fadeIn', key: 'step1' },
            React.createElement(Input, { label:'Full Name', required:true, icon:'fa-user', placeholder:'e.g. Rahul Verma', value:form.name, onChange:e=>set('name',e.target.value), error:errors.name }),
            React.createElement(Input, { label:'Email Address', required:true, icon:'fa-envelope', type:'email', placeholder:'you@college.edu', value:form.email, onChange:e=>set('email',e.target.value), error:errors.email }),
            React.createElement(Input, { label:'Password', required:true, icon:'fa-lock', type:'password', placeholder:'At least 6 characters', value:form.password, onChange:e=>set('password',e.target.value), error:errors.password }),
            React.createElement(Input, { label:'Confirm Password', required:true, icon:'fa-lock-open', type:'password', placeholder:'Re-enter password', value:form.confirmPassword, onChange:e=>set('confirmPassword',e.target.value), error:errors.confirmPassword }),
            React.createElement(Select, { label:'Register As', required:true, value:form.role, onChange:e=>set('role',e.target.value), error:errors.role, placeholder:'Select your role…', options:roleOptions }),
            form.role && React.createElement('div', { className: 'rounded-xl p-3 mb-4 flex items-center gap-3', style:{background:'#f0f9ff',border:'1.5px solid #bae6fd'} },
              React.createElement('div', { className: (ROLE_META[form.role]?.gradient||'grad-hero') + ' w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm' },
                React.createElement('i', { className: 'fas ' + (ROLE_META[form.role]?.icon||'fa-user') })
              ),
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-semibold text-slate-700' }, 'Registering as ' + (ROLE_META[form.role]?.label||form.role)),
                React.createElement('p', { className: 'text-xs text-slate-500' }, 'Your ID will look like ' + (ROLE_META[form.role]?.prefix||'')+'001')
              )
            ),
            React.createElement('button', { className: 'btn btn-primary btn-full mt-1', onClick: handleNext },
              'Next ', React.createElement('i', { className: 'fas fa-arrow-right' })
            )
          ),

          // STEP 2
          step === 2 && React.createElement('div', { className: 'animate-fadeIn', key: 'step2' },
            React.createElement('div', { className: 'flex items-center gap-3 p-3 rounded-xl mb-5', style:{background:'#f8fafc',border:'1px solid #e2e8f0'} },
              React.createElement(Avatar, { name: form.name, size: 42, gradient: ROLE_META[form.role]?.gradient || 'grad-hero' }),
              React.createElement('div', null,
                React.createElement('p', { className: 'font-semibold text-slate-800 text-sm' }, form.name),
                React.createElement('p', { className: 'text-xs text-slate-500' }, form.email),
                React.createElement(RoleBadge, { role: form.role })
              )
            ),

            form.role === 'admin'
              ? React.createElement('div', { className: 'text-center py-6' },
                  React.createElement('i', { className: 'fas fa-shield-halved text-4xl text-purple-400 mb-3 block' }),
                  React.createElement('p', { className: 'text-slate-600 text-sm font-medium' }, 'Admin accounts have full system access.'),
                  React.createElement('p', { className: 'text-slate-400 text-xs mt-1' }, 'No additional details required.')
                )
              : React.createElement(React.Fragment, null,
                  React.createElement(Select, { label:'Department', required:true, value:form.department, onChange:e=>set('department',e.target.value), error:errors.department, placeholder:'Select department…', options:DEPARTMENTS }),
                  form.role === 'student' && React.createElement(Select, { label:'Current Semester', required:true, value:form.semester, onChange:e=>set('semester',e.target.value), error:errors.semester, placeholder:'Select semester…', options:SEMESTERS })
                ),

            React.createElement('div', { className: 'flex gap-3 mt-2' },
              React.createElement('button', { className: 'btn btn-ghost flex-1', onClick: ()=>setStep(1) },
                React.createElement('i', { className: 'fas fa-arrow-left' }), ' Back'
              ),
              React.createElement('button', { className: 'btn btn-success flex-1', onClick: handleRegister, disabled: loading },
                loading ? React.createElement(Spinner,{small:true,white:true}) : React.createElement('i',{className:'fas fa-user-plus'}),
                ' ', loading ? 'Creating…' : 'Create Account'
              )
            )
          )
        ),

        React.createElement('p', { className: 'text-center text-sm text-slate-500 mt-5' },
          'Already have an account? ',
          React.createElement('button', { onClick: ()=>onNavigate('login'), className: 'text-blue-600 font-semibold hover:underline' }, 'Sign In')
        )
      )
    )
  );
}

// ============================================================
//  LoginPage
// ============================================================
function LoginPage({ onNavigate, onLogin, toast }) {
  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors]     = React.useState({});
  const [loading, setLoading]   = React.useState(false);

  function validate() {
    const errs = {};
    if (!validateEmail(email)) errs.email    = 'Enter a valid email address';
    if (!password)             errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await API.login(email.trim().toLowerCase(), password);
      Storage.set('cms_token', data.token);
      Storage.set('cms_user', data.user);
      toast('Welcome back, ' + data.user.name + '! 👋', 'success');
      setTimeout(() => onLogin(data.user), 600);
    } catch (err) {
      toast(err.message || 'Login failed. Please check your credentials.', 'error');
      if (err.message?.toLowerCase().includes('email'))    setErrors({ email: err.message });
      else if (err.message?.toLowerCase().includes('password')) setErrors({ password: err.message });
    } finally { setLoading(false); }
  }

  function handleKeyDown(e) { if (e.key === 'Enter') handleLogin(); }

  const demos = [
    { label: 'Admin',   email: 'admin@college.edu', password: 'admin123',   gradient: 'grad-admin'   },
    { label: 'Teacher', email: 'raj@college.edu',   password: 'teacher123', gradient: 'grad-teacher' },
    { label: 'Student', email: 'rahul@college.edu', password: 'student123', gradient: 'grad-student' },
  ];

  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center p-4 bg-slate-50' },
    React.createElement('div', { className: 'w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 card overflow-hidden animate-fadeIn', style:{boxShadow:'0 25px 60px rgba(0,0,0,0.12)'} },

      // Left visual panel
      React.createElement('div', { className: 'grad-hero p-10 text-white flex-col justify-between hidden lg:flex relative overflow-hidden' },
        React.createElement('div',{style:{position:'absolute',width:280,height:280,borderRadius:'50%',background:'rgba(255,255,255,0.06)',top:-60,right:-60}}),
        React.createElement('div',{style:{position:'absolute',width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,0.06)',bottom:-40,left:-40}}),
        React.createElement('div', { className: 'relative z-10' },
          React.createElement('div', { className: 'flex items-center gap-3 mb-12' },
            React.createElement('div', { className: 'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl', style:{background:'rgba(255,255,255,0.2)'} },
              React.createElement('i', { className: 'fas fa-university' })
            ),
            React.createElement('div', null,
              React.createElement('div', { className: 'font-extrabold text-xl' }, 'EduManage'),
              React.createElement('div', { className: 'text-blue-200 text-xs' }, 'College Management System')
            )
          ),
          React.createElement('h1', { className: 'text-3xl font-extrabold leading-tight mb-5' }, 'Your Academic\nWorld, One\nLogin Away'),
          React.createElement('p', { className: 'text-blue-200 text-sm leading-relaxed' },
            'Access your personalised dashboard, manage tasks, and stay connected with your college community.'
          )
        ),
        React.createElement('div', { className: 'relative z-10 space-y-3' },
          [{icon:'fa-shield-halved',label:'Admin',desc:'Full system control',g:'grad-admin'},
           {icon:'fa-chalkboard-user',label:'Teacher',desc:'Classes & student management',g:'grad-teacher'},
           {icon:'fa-user-graduate',label:'Student',desc:'Grades & academic profile',g:'grad-student'}]
          .map(r =>
            React.createElement('div', { key: r.label, className: 'glass rounded-xl p-3 flex items-center gap-3' },
              React.createElement('div', { className: r.g + ' w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm' },
                React.createElement('i', { className: 'fas ' + r.icon })
              ),
              React.createElement('div', null,
                React.createElement('p', { className: 'font-semibold text-sm' }, r.label),
                React.createElement('p', { className: 'text-blue-200 text-xs' }, r.desc)
              )
            )
          )
        )
      ),

      // Right form
      React.createElement('div', { className: 'p-8 flex flex-col justify-center bg-white' },
        React.createElement('div', { className: 'text-center mb-7' },
          React.createElement('div', { className: 'lg:hidden w-14 h-14 grad-hero rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg' },
            React.createElement('i', { className: 'fas fa-university' })
          ),
          React.createElement('h2', { className: 'text-2xl font-extrabold text-slate-800' }, 'Welcome Back'),
          React.createElement('p', { className: 'text-slate-500 text-sm mt-1' }, 'Sign in to your account')
        ),

        // Quick demo buttons
        React.createElement('div', { className: 'mb-5' },
          React.createElement('p', { className: 'text-xs text-slate-400 text-center mb-2.5 font-medium uppercase tracking-wide' }, '⚡ Quick Demo Login'),
          React.createElement('div', { className: 'grid grid-cols-3 gap-2' },
            demos.map(d =>
              React.createElement('button', {
                key: d.label,
                className: d.gradient + ' text-white rounded-xl py-2 text-xs font-semibold hover:opacity-90 transition-all hover:-translate-y-0.5',
                onClick: () => { setEmail(d.email); setPassword(d.password); setErrors({}); }
              }, d.label)
            )
          )
        ),

        React.createElement('div', { className: 'relative mb-5' },
          React.createElement('div', { className: 'absolute inset-0 flex items-center' }, React.createElement('div',{className:'flex-1 border-t border-slate-200'})),
          React.createElement('div', { className: 'relative flex justify-center' },
            React.createElement('span', { className: 'bg-white px-3 text-xs text-slate-400' }, 'or sign in manually')
          )
        ),

        React.createElement(Input, { label:'Email Address', required:true, icon:'fa-envelope', type:'email', placeholder:'your@college.edu', value:email, onChange:e=>{setEmail(e.target.value);setErrors({})}, error:errors.email, onKeyDown:handleKeyDown }),
        React.createElement(Input, { label:'Password', required:true, icon:'fa-lock', type:'password', placeholder:'Your password', value:password, onChange:e=>{setPassword(e.target.value);setErrors({})}, error:errors.password, onKeyDown:handleKeyDown }),

        React.createElement('button', { className: 'btn btn-primary btn-full mt-1', onClick: handleLogin, disabled: loading },
          loading ? React.createElement(Spinner,{small:true,white:true}) : React.createElement('i',{className:'fas fa-right-to-bracket'}),
          ' ', loading ? 'Signing in…' : 'Sign In'
        ),

        React.createElement('div', { className: 'mt-4 p-3 rounded-xl text-xs', style:{background:'#f8fafc',border:'1px solid #e2e8f0'} },
          React.createElement('p', { className: 'font-semibold text-slate-600 mb-1.5' }, '📋 Demo Credentials:'),
          React.createElement('div', { className: 'space-y-0.5 text-slate-500' },
            React.createElement('p', null, '🛡️ Admin:   admin@college.edu / admin123'),
            React.createElement('p', null, '📚 Teacher: raj@college.edu / teacher123'),
            React.createElement('p', null, '🎓 Student: rahul@college.edu / student123')
          )
        ),

        React.createElement('p', { className: 'text-center text-sm text-slate-500 mt-5' },
          "Don't have an account? ",
          React.createElement('button', { onClick:()=>onNavigate('register'), className:'text-blue-600 font-semibold hover:underline' }, 'Register Now')
        )
      )
    )
  );
}
