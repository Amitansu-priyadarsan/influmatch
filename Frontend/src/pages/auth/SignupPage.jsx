import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CSS = `
.im-signup{--bg:#0b0b0c;--bg-2:#111113;--bg-3:#17171a;--line:rgba(255,255,255,0.08);--line-2:rgba(255,255,255,0.14);--fg:#ededec;--fg-dim:#a6a6a3;--fg-mute:#6b6b68;--accent:oklch(0.86 0.14 104);--accent-ink:#0b0b0c;--serif:'Instrument Serif','Times New Roman',serif;--sans:'Geist',ui-sans-serif,system-ui,sans-serif;--mono:'Geist Mono',ui-monospace,monospace;background:var(--bg);color:var(--fg);font-family:var(--sans);font-weight:400;-webkit-font-smoothing:antialiased;min-height:100vh;overflow-x:hidden;position:relative}
.im-signup *{box-sizing:border-box}
.im-signup a{color:inherit;text-decoration:none}
.im-signup button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.im-signup .amb{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.im-signup .amb::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:80px 80px;-webkit-mask-image:radial-gradient(ellipse 1000px 600px at 20% 10%,black 30%,transparent 80%);mask-image:radial-gradient(ellipse 1000px 600px at 20% 10%,black 30%,transparent 80%)}
.im-signup .amb::after{content:"";position:absolute;width:700px;height:700px;left:-200px;top:-200px;background:radial-gradient(circle,color-mix(in oklab,var(--accent) 8%,transparent) 0%,transparent 60%);filter:blur(80px)}
.im-signup .shell{position:relative;z-index:1;min-height:100vh;display:grid;grid-template-columns:1.05fr 1fr}
.im-signup .side{position:relative;padding:36px 56px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid var(--line);overflow:hidden}
.im-signup .side-top{display:flex;justify-content:space-between;align-items:center}
.im-signup .brand{display:inline-flex;align-items:center;gap:10px;font-family:var(--serif);font-size:22px;letter-spacing:-.01em}
.im-signup .brand .mark{width:14px;height:14px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(255,255,255,.04)}
.im-signup .brand em{font-style:italic;color:var(--fg-dim)}
.im-signup .side-back{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}
.im-signup .side-back:hover{color:var(--fg)}
.im-signup .side-body{max-width:520px}
.im-signup .eye{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-dim);padding:6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--bg-2);margin-bottom:26px}
.im-signup .eye .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px rgba(212,244,52,.14)}
.im-signup .side h1{font-family:var(--serif);font-weight:400;font-size:clamp(44px,4.8vw,68px);line-height:.98;letter-spacing:-.025em;margin:0 0 20px}
.im-signup .side h1 em{font-style:italic;color:var(--fg-dim)}
.im-signup .side h1 .accent{color:var(--accent)}
.im-signup .side p.lede{color:var(--fg-dim);font-size:16px;line-height:1.55;max-width:460px;margin:0 0 36px}
.im-signup .pulse-card{border:1px solid var(--line);border-radius:14px;background:linear-gradient(180deg,var(--bg-2),var(--bg));padding:18px 20px;max-width:440px}
.im-signup .pc-head{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:14px}
.im-signup .pc-head .live{color:var(--accent);display:inline-flex;align-items:center;gap:7px}
.im-signup .pc-head .live .d{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:im-pulse2 1.6s infinite}
@keyframes im-pulse2{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.6)}}
.im-signup .pc-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--line);font-size:13px}
.im-signup .pc-row .l{font-family:var(--serif);font-size:17px}
.im-signup .pc-row .r{font-family:var(--mono);font-size:11px;color:var(--accent);letter-spacing:.08em}
.im-signup .pc-row .sub{font-family:var(--mono);font-size:10px;color:var(--fg-mute);letter-spacing:.1em;text-transform:uppercase;margin-top:3px}
.im-signup .side-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;padding-top:26px;border-top:1px solid var(--line);max-width:460px}
.im-signup .side-stats .s b{display:block;font-family:var(--serif);font-size:28px;font-weight:400;letter-spacing:-.01em;line-height:1}
.im-signup .side-stats .s span{font-family:var(--mono);font-size:10px;color:var(--fg-mute);text-transform:uppercase;letter-spacing:.12em;margin-top:6px;display:block}
.im-signup .form-side{padding:36px 56px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto}
.im-signup .form-top{width:100%;max-width:440px;display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;font-size:13px;color:var(--fg-dim)}
.im-signup .form-top a.link{color:var(--fg);font-weight:500;border-bottom:1px solid var(--line-2);padding-bottom:1px}
.im-signup .form-top a.link:hover{border-bottom-color:var(--accent)}
.im-signup .form-wrap{width:100%;max-width:440px}
.im-signup .kicker{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:14px}
.im-signup .form-wrap h2{font-family:var(--serif);font-weight:400;font-size:40px;line-height:1;letter-spacing:-.02em;margin:0 0 10px}
.im-signup .form-wrap h2 em{font-style:italic;color:var(--fg-dim)}
.im-signup .form-wrap .sub{color:var(--fg-dim);font-size:14.5px;margin:0 0 30px;line-height:1.55;max-width:400px}
.im-signup .role-lbl{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:10px}
.im-signup .roles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:26px;border:1px solid var(--line);border-radius:14px;padding:6px;background:var(--bg-2)}
.im-signup .role{position:relative;padding:14px;border-radius:10px;cursor:pointer;text-align:left;transition:.18s ease;display:flex;gap:12px;align-items:center;background:transparent;border:1px solid transparent}
.im-signup .role:hover .r-title{color:var(--fg)}
.im-signup .role .ico{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.03);display:grid;place-items:center;color:var(--fg-dim);flex:none;border:1px solid var(--line)}
.im-signup .role .ico svg{width:16px;height:16px}
.im-signup .role .r-title{font-weight:500;font-size:13.5px;color:var(--fg-dim);letter-spacing:-.005em}
.im-signup .role .r-sub{font-family:var(--mono);font-size:9.5px;color:var(--fg-mute);margin-top:3px;letter-spacing:.1em;text-transform:uppercase}
.im-signup .role.active{background:var(--bg-3);border-color:var(--line-2)}
.im-signup .role.active::after{content:"";position:absolute;bottom:-1px;left:12px;right:12px;height:1px;background:var(--accent);box-shadow:0 0 12px var(--accent)}
.im-signup .role.active .ico{background:color-mix(in oklab,var(--accent) 12%,transparent);color:var(--accent);border-color:color-mix(in oklab,var(--accent) 40%,transparent)}
.im-signup .role.active .r-title{color:var(--fg)}
.im-signup .fld{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.im-signup .fld label{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);display:flex;justify-content:space-between;align-items:center}
.im-signup .fld label .hint{color:var(--fg-mute);font-size:10px;font-weight:400;text-transform:none;letter-spacing:0}
.im-signup .inp-wrap{position:relative}
.im-signup .inp-wrap .lico{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--fg-mute)}
.im-signup .inp-wrap .rico{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--fg-mute);padding:6px;border-radius:6px;display:grid;place-items:center}
.im-signup .inp-wrap .rico svg{width:15px;height:15px}
.im-signup .inp-wrap .rico:hover{color:var(--fg);background:rgba(255,255,255,0.06)}
.im-signup .inp{width:100%;height:48px;border-radius:10px;border:1px solid var(--line-2);background:var(--bg-2);color:var(--fg);padding:0 16px 0 42px;font-size:14.5px;font-family:inherit;outline:none;transition:.15s;letter-spacing:-.005em}
.im-signup .inp::placeholder{color:var(--fg-mute);font-family:var(--sans)}
.im-signup .inp:focus{border-color:var(--accent);background:var(--bg-3);box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 14%,transparent)}
.im-signup .pw-meter{display:flex;gap:4px;margin-top:10px}
.im-signup .pw-meter i{flex:1;height:2px;background:var(--line);transition:.2s}
.im-signup .pw-meter i.on-1{background:#9a5454}
.im-signup .pw-meter i.on-2{background:#b5925a}
.im-signup .pw-meter i.on-3{background:color-mix(in oklab,var(--accent) 60%,transparent)}
.im-signup .pw-meter i.on-4{background:var(--accent)}
.im-signup .pw-hint{font-family:var(--mono);font-size:10px;color:var(--fg-mute);margin-top:8px;letter-spacing:.06em}
.im-signup .pw-hint .ok{color:var(--accent)}
.im-signup .cbx{display:flex;gap:10px;align-items:flex-start;margin:6px 0 22px;font-size:12.5px;color:var(--fg-dim);line-height:1.5;cursor:pointer;user-select:none}
.im-signup .cbx input{display:none}
.im-signup .cbx .box{width:16px;height:16px;border:1px solid var(--line-2);border-radius:4px;flex:none;margin-top:2px;display:grid;place-items:center;transition:.15s;background:var(--bg-2)}
.im-signup .cbx .box svg{width:9px;height:9px;color:var(--accent-ink);opacity:0}
.im-signup .cbx input:checked ~ .box{background:var(--accent);border-color:var(--accent)}
.im-signup .cbx input:checked ~ .box svg{opacity:1}
.im-signup .cbx a{color:var(--fg);border-bottom:1px solid var(--line-2)}
.im-signup .cbx a:hover{border-bottom-color:var(--accent)}
.im-signup .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;border-radius:999px;font-size:13.5px;font-weight:500;transition:.18s ease;border:1px solid transparent;white-space:nowrap;cursor:pointer;width:100%;font-family:var(--sans)}
.im-signup .btn-primary{background:var(--accent);color:var(--accent-ink);font-weight:500}
.im-signup .btn-primary:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
.im-signup .btn:disabled{opacity:.6;cursor:not-allowed}
.im-signup .btn .arrow{transition:transform .18s}
.im-signup .btn:hover:not(:disabled) .arrow{transform:translateX(3px)}
.im-signup .divider{display:flex;align-items:center;gap:12px;color:var(--fg-mute);font-family:var(--mono);font-size:10px;margin:22px 0 14px;text-transform:uppercase;letter-spacing:.14em}
.im-signup .divider::before,.im-signup .divider::after{content:"";flex:1;height:1px;background:var(--line)}
.im-signup .socials{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.im-signup .social{display:flex;align-items:center;justify-content:center;gap:10px;height:46px;border-radius:10px;border:1px solid var(--line-2);background:var(--bg-2);font-size:13.5px;font-weight:500;color:var(--fg);transition:.15s;font-family:var(--sans)}
.im-signup .social:hover{background:var(--bg-3);border-color:var(--fg-mute)}
.im-signup .social svg{width:16px;height:16px}
.im-signup .terms{font-family:var(--mono);font-size:10px;color:var(--fg-mute);text-align:center;margin-top:26px;letter-spacing:.06em;line-height:1.6}
.im-signup .err{background:rgba(222,90,90,.08);border:1px solid rgba(222,90,90,.35);color:#f0a0a0;border-radius:10px;padding:10px 12px;font-size:12.5px;margin-bottom:14px;font-family:var(--mono);letter-spacing:.02em}
@media (max-width:900px){
  .im-signup .shell{grid-template-columns:1fr}
  .im-signup .side{border-right:0;border-bottom:1px solid var(--line);padding:28px 24px 44px}
  .im-signup .form-side{padding:32px 24px 60px}
  .im-signup .side h1{font-size:36px}
  .im-signup .side-stats{display:none}
  .im-signup .pulse-card{display:none}
}
`;

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('influencer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const score = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const hint = score >= 3
    ? <span className="ok">STRONG PASSWORD</span>
    : score >= 1
      ? 'KEEP GOING — MIX UPPERCASE, NUMBERS, SYMBOLS'
      : 'MIN 8 CHARS · MIX LETTERS + NUMBERS';

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!agree) { setError('Please accept the terms to continue'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = signup({ role: role === 'brand' ? 'owner' : 'influencer', email, password, name });
      setLoading(false);
      if (!result.success) { setError(result.error); return; }
      if (result.role === 'owner') navigate('/owner/onboarding');
      else if (result.role === 'influencer') navigate('/influencer/onboarding');
    }, 500);
  };

  return (
    <div className="im-signup">
      <style>{CSS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div className="amb"></div>

      <div className="shell">
        <aside className="side">
          <div className="side-top">
            <Link to="/" className="brand"><span className="mark"></span>Influ<em>Match</em></Link>
            <Link to="/" className="side-back">← Back to site</Link>
          </div>

          <div className="side-body">
            <span className="eye"><span className="dot"></span> 1,248 open briefs · live now</span>
            <h1>Get paid to post<br/>what you'd <em>already</em><br/>make <span className="accent">anyway.</span></h1>
            <p className="lede">Join 12,400+ creators and 820 brands running campaign-based collaborations. Briefs, approvals, performance and payouts — one dashboard.</p>

            <div className="pulse-card">
              <div className="pc-head">
                <span>LAST 7 DAYS · MATCHES</span>
                <span className="live"><span className="d"></span> LIVE</span>
              </div>
              <div className="pc-row">
                <div><div className="l">Aperture Coffee</div><div className="sub">@maia.field · 98% fit</div></div>
                <div className="r">$1,200</div>
              </div>
              <div className="pc-row">
                <div><div className="l">Noctua Watches</div><div className="sub">@jules.atelier · 91% fit</div></div>
                <div className="r">$4,800</div>
              </div>
              <div className="pc-row">
                <div><div className="l">Folio Linen</div><div className="sub">@rowan.roast · 87% fit</div></div>
                <div className="r">$800</div>
              </div>
            </div>
          </div>

          <div className="side-stats">
            <div className="s"><b>12.4K+</b><span>Creators</span></div>
            <div className="s"><b>$38M</b><span>Paid out</span></div>
            <div className="s"><b>94%</b><span>Fill rate</span></div>
          </div>
        </aside>

        <main className="form-side">
          <div className="form-top">
            <div>Step <b style={{color:'var(--fg)'}}>01</b> <span style={{color:'var(--fg-mute)',margin:'0 8px'}}>/</span> 03</div>
            <div>Already a member? <Link to="/login" className="link">Sign in</Link></div>
          </div>

          <div className="form-wrap">
            <div className="kicker">Create account</div>
            <h2>Join the <em>marketplace.</em></h2>
            <p className="sub">It takes about four minutes. Pick your role — we'll tailor the next steps.</p>

            <form onSubmit={handleSignup}>
              <div className="role-lbl">I'm joining as a</div>
              <div className="roles">
                <button type="button" className={`role ${role === 'influencer' ? 'active' : ''}`} onClick={()=>setRole('influencer')}>
                  <span className="ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
                  </span>
                  <div><div className="r-title">Creator</div><div className="r-sub">Apply to briefs</div></div>
                </button>
                <button type="button" className={`role ${role === 'brand' ? 'active' : ''}`} onClick={()=>setRole('brand')}>
                  <span className="ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/></svg>
                  </span>
                  <div><div className="r-title">Brand</div><div className="r-sub">Post campaigns</div></div>
                </button>
              </div>

              <div className="fld">
                <label htmlFor="name"><span>Full name</span></label>
                <div className="inp-wrap">
                  <svg className="lico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
                  <input className="inp" id="name" type="text" placeholder="Maia Field" autoComplete="name" value={name} onChange={(e)=>setName(e.target.value)}/>
                </div>
              </div>

              <div className="fld">
                <label htmlFor="email"><span>Email</span><span className="hint">We'll send a verification link</span></label>
                <div className="inp-wrap">
                  <svg className="lico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                  <input className="inp" id="email" type="email" placeholder="you@studio.com" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                </div>
              </div>

              <div className="fld">
                <label htmlFor="pw"><span>Password</span></label>
                <div className="inp-wrap">
                  <svg className="lico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
                  <input className="inp" id="pw" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                  <button type="button" className="rico" onClick={()=>setShowPassword(!showPassword)} aria-label="toggle password">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                <div className="pw-meter">
                  {[0,1,2,3].map(i => <i key={i} className={i < score ? `on-${score}` : ''}/>)}
                </div>
                <div className="pw-hint">{hint}</div>
              </div>

              <label className="cbx">
                <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)}/>
                <span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg></span>
                <span>I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>. Send me campaign alerts and product updates.</span>
              </label>

              {error && <div className="err">{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating account…' : <>Continue to onboarding <span className="arrow">→</span></>}
              </button>

              <p className="terms">PROTECTED BY ESCROW · SOC 2 TYPE II · GDPR COMPLIANT</p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
