import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ensureSession } from '../../lib/api';

const CSS = `
.im-auth{--bg:#0b0b0c;--bg-2:#111113;--bg-3:#17171a;--line:rgba(255,255,255,0.08);--line-2:rgba(255,255,255,0.14);--fg:#ededec;--fg-dim:#a6a6a3;--fg-mute:#6b6b68;--accent:oklch(0.86 0.14 104);--accent-ink:#0b0b0c;--serif:'Instrument Serif','Times New Roman',serif;--sans:'Geist',ui-sans-serif,system-ui,sans-serif;--mono:'Geist Mono',ui-monospace,monospace;background:var(--bg);color:var(--fg);font-family:var(--sans);font-weight:400;-webkit-font-smoothing:antialiased;min-height:100vh;overflow-x:hidden;position:relative}
.im-auth *{box-sizing:border-box}
.im-auth a{color:inherit;text-decoration:none}
.im-auth button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.im-auth .amb{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.im-auth .amb::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:80px 80px;-webkit-mask-image:radial-gradient(ellipse 1000px 600px at 50% 20%,black 30%,transparent 80%);mask-image:radial-gradient(ellipse 1000px 600px at 50% 20%,black 30%,transparent 80%)}
.im-auth .amb::after{content:"";position:absolute;width:700px;height:700px;right:-200px;bottom:-200px;background:radial-gradient(circle,color-mix(in oklab,var(--accent) 10%,transparent) 0%,transparent 60%);filter:blur(80px)}
.im-auth .nav{position:relative;z-index:2;padding:28px 32px;display:flex;justify-content:space-between;align-items:center;max-width:1280px;margin:0 auto}
.im-auth .brand{display:inline-flex;align-items:center;gap:10px;font-family:var(--serif);font-size:22px;letter-spacing:-.01em}
.im-auth .brand .mark{width:14px;height:14px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(255,255,255,.04)}
.im-auth .brand em{font-style:italic;color:var(--fg-dim)}
.im-auth .nav-right{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}
.im-auth .nav-right a{color:var(--fg)}
.im-auth .nav-right a:hover{color:var(--accent)}
.im-auth .main{position:relative;z-index:1;min-height:calc(100vh - 160px);display:flex;align-items:center;justify-content:center;padding:20px}
.im-auth .card{width:100%;max-width:460px;background:var(--bg-2);border:1px solid var(--line);border-radius:20px;padding:44px 40px 32px;position:relative;box-shadow:0 40px 100px -40px rgba(0,0,0,.6)}
.im-auth .kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:14px}
.im-auth .card h1{font-family:var(--serif);font-weight:400;font-size:48px;line-height:1;letter-spacing:-.02em;margin:0 0 10px}
.im-auth .card h1 em{font-style:italic;color:var(--fg-dim)}
.im-auth .card .sub{color:var(--fg-dim);font-size:14.5px;margin:0 0 32px;line-height:1.55}
.im-auth .fld{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.im-auth .fld label{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);display:flex;justify-content:space-between;align-items:center}
.im-auth .fld label a{color:var(--fg-dim);font-size:10px;letter-spacing:.06em;text-transform:none;font-family:var(--sans);cursor:pointer}
.im-auth .fld label a:hover{color:var(--accent)}
.im-auth .inp-wrap{position:relative}
.im-auth .inp-wrap .lico{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--fg-mute)}
.im-auth .inp-wrap .rico{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--fg-mute);padding:6px;border-radius:6px;display:grid;place-items:center}
.im-auth .inp-wrap .rico svg{width:15px;height:15px}
.im-auth .inp-wrap .rico:hover{color:var(--fg);background:rgba(255,255,255,0.06)}
.im-auth .inp{width:100%;height:48px;border-radius:10px;border:1px solid var(--line-2);background:var(--bg);color:var(--fg);padding:0 16px 0 42px;font-size:14.5px;font-family:inherit;outline:none;transition:.15s;letter-spacing:-.005em}
.im-auth .inp::placeholder{color:var(--fg-mute);font-family:var(--sans)}
.im-auth .inp:focus{border-color:var(--accent);background:var(--bg-3);box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 14%,transparent)}
.im-auth .row{display:flex;justify-content:space-between;align-items:center;margin:6px 0 24px}
.im-auth .cbx{display:flex;gap:10px;align-items:center;font-size:12.5px;color:var(--fg-dim);cursor:pointer;user-select:none}
.im-auth .cbx input{display:none}
.im-auth .cbx .box{width:16px;height:16px;border:1px solid var(--line-2);border-radius:4px;display:grid;place-items:center;transition:.15s;background:var(--bg)}
.im-auth .cbx .box svg{width:9px;height:9px;color:var(--accent-ink);opacity:0}
.im-auth .cbx input:checked ~ .box{background:var(--accent);border-color:var(--accent)}
.im-auth .cbx input:checked ~ .box svg{opacity:1}
.im-auth .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;border-radius:999px;font-size:13.5px;font-weight:500;transition:.18s ease;border:1px solid transparent;white-space:nowrap;cursor:pointer;width:100%;font-family:var(--sans)}
.im-auth .btn-primary{background:var(--accent);color:var(--accent-ink);font-weight:500}
.im-auth .btn-primary:hover{filter:brightness(1.08);transform:translateY(-1px)}
.im-auth .btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.im-auth .btn .arrow{transition:transform .18s}
.im-auth .btn:hover:not(:disabled) .arrow{transform:translateX(3px)}
.im-auth .divider{display:flex;align-items:center;gap:12px;color:var(--fg-mute);font-family:var(--mono);font-size:10px;margin:22px 0 14px;text-transform:uppercase;letter-spacing:.14em}
.im-auth .divider::before,.im-auth .divider::after{content:"";flex:1;height:1px;background:var(--line)}
.im-auth .socials{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.im-auth .social{display:flex;align-items:center;justify-content:center;gap:10px;height:46px;border-radius:10px;border:1px solid var(--line-2);background:var(--bg);font-size:13.5px;font-weight:500;color:var(--fg);transition:.15s;font-family:var(--sans)}
.im-auth .social:hover{background:var(--bg-3);border-color:var(--fg-mute)}
.im-auth .social svg{width:16px;height:16px}
.im-auth .sso{margin-top:18px;text-align:center;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-mute)}
.im-auth .sso a{color:var(--fg-dim);cursor:pointer}
.im-auth .sso a:hover{color:var(--accent)}
.im-auth .below{margin-top:28px;text-align:center;font-size:13.5px;color:var(--fg-dim)}
.im-auth .below a{color:var(--fg);border-bottom:1px solid var(--line-2);padding-bottom:1px}
.im-auth .below a:hover{border-bottom-color:var(--accent)}
.im-auth .err{background:rgba(222,90,90,.08);border:1px solid rgba(222,90,90,.35);color:#f0a0a0;border-radius:10px;padding:10px 12px;font-size:12.5px;margin-bottom:14px;font-family:var(--mono);letter-spacing:.02em}
.im-auth .demo{margin-top:22px;padding-top:18px;border-top:1px solid var(--line)}
.im-auth .demo-lbl{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);text-align:center;margin-bottom:10px}
.im-auth .demo-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.im-auth .demo-btn{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;padding:8px 6px;border:1px solid var(--line-2);border-radius:8px;background:var(--bg);color:var(--fg-dim);transition:.15s}
.im-auth .demo-btn:hover{color:var(--accent);border-color:color-mix(in oklab,var(--accent) 50%,transparent)}
.im-auth .foot{position:relative;z-index:1;padding:24px 32px;max-width:1280px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);gap:12px;flex-wrap:wrap}
.im-auth .foot .dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--accent);margin-right:6px;vertical-align:middle;animation:im-pulse 1.6s infinite}
@keyframes im-pulse{0%,100%{opacity:1}50%{opacity:.4}}
@media (max-width:540px){.im-auth .card{padding:36px 26px 28px}.im-auth .card h1{font-size:38px}}
`;

const MailIcon = () => (<svg className="lico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>);
const LockIcon = () => (<svg className="lico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>);
const EyeIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>);
const CheckIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>);

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) return;
    ensureSession().catch(() => {});
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    if (result.role === 'admin') navigate('/admin/dashboard');
    else if (result.role === 'owner') navigate(result.onboarded ? '/owner/dashboard' : '/owner/onboarding');
    else if (result.role === 'influencer') navigate(result.onboarded ? '/influencer/dashboard' : '/influencer/onboarding');
  };

  const fillAdmin = () => {
    setEmail('admin@influmatch.com');
    setPassword('Admin@1234');
  };

  return (
    <div className="im-auth">
      <style>{CSS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div className="amb"></div>

      <header className="nav">
        <Link to="/" className="brand"><span className="mark"></span>Influ<em>Match</em></Link>
        <div className="nav-right">← <Link to="/">Back to site</Link></div>
      </header>

      <main className="main">
        <div className="card">
          <div className="kicker">Sign in</div>
          <h1>Welcome <em>back.</em></h1>
          <p className="sub">Pick up where you left off — your briefs, applicants and payouts are waiting.</p>

          <form onSubmit={handleLogin}>
            <div className="fld">
              <label htmlFor="email">Email</label>
              <div className="inp-wrap">
                <MailIcon/>
                <input className="inp" id="email" type="email" placeholder="you@studio.com" autoComplete="email" autoFocus value={email} onChange={(e)=>setEmail(e.target.value)} required/>
              </div>
            </div>

            <div className="fld">
              <div className="inp-wrap">
                <LockIcon/>
                <input className="inp" id="pw" type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                <button type="button" className="rico" onClick={()=>setShowPassword(!showPassword)} aria-label="toggle password"><EyeIcon/></button>
              </div>
            </div>

            <div className="row">
              <label className="cbx">
                <input type="checkbox" checked={keepSignedIn} onChange={(e)=>setKeepSignedIn(e.target.checked)}/>
                <span className="box"><CheckIcon/></span>
                <span>Keep me signed in</span>
              </label>
            </div>

            {error && <div className="err">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : <>Sign in <span className="arrow">→</span></>}
            </button>

            <div className="demo">
              <div className="demo-lbl">Admin · click to fill</div>
              <div className="demo-row" style={{ gridTemplateColumns: '1fr' }}>
                <button type="button" className="demo-btn" onClick={fillAdmin}>Use admin credentials</button>
              </div>
            </div>

            <div className="below">
              New to InfluMatch? <Link to="/signup">Create an account</Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="foot">
        <div><span className="dot"></span>ALL SYSTEMS NOMINAL · V4.12</div>
        <div>© 2026 INFLUMATCH · SOC 2 TYPE II</div>
      </footer>
    </div>
  );
}
