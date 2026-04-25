import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ONBOARDING_CSS = `
.im-onb{min-height:100vh;background:var(--bg);color:var(--fg);font-family:var(--sans);-webkit-font-smoothing:antialiased;position:relative}
.im-onb *{box-sizing:border-box}
.im-onb a{color:inherit;text-decoration:none}
.im-onb button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}

.im-onb .grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:linear-gradient(var(--surface-tint) 1px,transparent 1px),linear-gradient(90deg,var(--surface-tint) 1px,transparent 1px);
  background-size:48px 48px;
  mask-image:radial-gradient(ellipse 80% 60% at 50% 40%,#000 0%,transparent 70%);
  -webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 40%,#000 0%,transparent 70%)}
.im-onb .glow{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.im-onb .glow::before{content:"";position:absolute;width:640px;height:640px;left:-180px;top:-220px;border-radius:50%;background:radial-gradient(circle,rgba(212,244,52,0.09) 0%,transparent 70%);filter:blur(60px)}
.im-onb .glow::after{content:"";position:absolute;width:540px;height:540px;right:-160px;bottom:-200px;border-radius:50%;background:radial-gradient(circle,rgba(212,244,52,0.06) 0%,transparent 70%);filter:blur(60px)}

.im-onb .shell{position:relative;z-index:1;min-height:100vh;display:grid;grid-template-columns:360px 1fr}

.im-onb .side{padding:28px 32px 32px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:48px;background:linear-gradient(180deg,var(--surface-faint),transparent 40%)}
.im-onb .brand{display:flex;align-items:center;gap:10px;font-family:var(--serif);font-size:22px;letter-spacing:-.01em}
.im-onb .brand .mark{width:14px;height:14px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--surface-tint)}
.im-onb .brand em{font-style:italic;color:var(--fg-dim)}
.im-onb .side-eyebrow{font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:14px}
.im-onb .side-tag{font-family:var(--serif);font-size:34px;line-height:1.08;letter-spacing:-.015em;margin:0 0 14px;max-width:290px;font-weight:400}
.im-onb .side-tag em{font-style:italic;color:var(--fg-dim)}
.im-onb .side-tag .accent{color:var(--accent)}
.im-onb .side-lede{color:var(--fg-dim);font-size:13.5px;line-height:1.55;max-width:290px;margin:0}

.im-onb .stepper{margin-top:auto;display:flex;flex-direction:column;gap:4px}
.im-onb .step{display:flex;gap:14px;align-items:center;padding:12px 10px;border-radius:10px;position:relative;transition:.2s}
.im-onb .step .dot{width:26px;height:26px;border-radius:50%;flex:none;border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--mono);font-size:11px;color:var(--fg-mute);transition:.2s;background:var(--bg)}
.im-onb .step .label{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute);transition:.2s}
.im-onb .step .chev{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--accent);opacity:0;transition:.2s}
.im-onb .step.done .dot{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.im-onb .step.done .label{color:var(--fg-dim)}
.im-onb .step.active{background:linear-gradient(90deg,var(--accent-soft),transparent 70%)}
.im-onb .step.active .dot{border-color:var(--accent);color:var(--accent);box-shadow:0 0 0 4px rgba(212,244,52,0.08)}
.im-onb .step.active .label{color:var(--fg)}
.im-onb .step.active .chev{opacity:1}

.im-onb .side-foot{display:flex;gap:10px;align-items:center;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);padding-top:22px;border-top:1px solid var(--line)}
.im-onb .side-foot .pulse{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:im-pulse 1.8s infinite}
@keyframes im-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}

.im-onb .main{display:flex;flex-direction:column;min-height:100vh;position:relative;align-items:center}
.im-onb .main-top{display:flex;justify-content:space-between;align-items:center;padding:22px 48px;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);width:100%;max-width:1100px;margin:0 auto}
.im-onb .main-top .right a{color:var(--accent);cursor:pointer}
.im-onb .main-top .right a:hover{text-decoration:underline}
.im-onb .main-top .progress{display:flex;gap:10px;align-items:center}
.im-onb .main-top .progress .bar{width:160px;height:4px;border-radius:999px;background:var(--line);overflow:hidden}
.im-onb .main-top .progress .bar i{display:block;height:100%;background:var(--accent);transition:width .4s cubic-bezier(.2,.7,.2,1)}

.im-onb .main-body{padding:56px 48px 32px;max-width:900px;width:100%;flex:1;margin:0 auto}
.im-onb .q-kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:16px;display:flex;gap:10px;align-items:center}
.im-onb .q-kicker .n{color:var(--accent)}
.im-onb h2.q{font-family:var(--serif);font-weight:400;font-size:clamp(40px,4.6vw,60px);line-height:1.02;letter-spacing:-.02em;margin:0 0 14px}
.im-onb h2.q em{font-style:italic;color:var(--fg-dim)}
.im-onb .q-sub{color:var(--fg-dim);font-size:15.5px;line-height:1.55;max-width:560px;margin:0 0 40px}

.im-onb .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:780px}
.im-onb .tile{position:relative;padding:26px 18px 22px;border:1px solid var(--line-2);border-radius:14px;background:var(--surface-faint);cursor:pointer;transition:.18s ease;display:flex;flex-direction:column;align-items:center;gap:14px;min-height:140px;text-align:center}
.im-onb .tile:hover{border-color:var(--line-2);background:var(--surface-tint)}
.im-onb .tile .ico{width:28px;height:28px;color:var(--fg-dim);display:grid;place-items:center}
.im-onb .tile .ico svg{width:26px;height:26px}
.im-onb .tile .name{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-dim);line-height:1.35}
.im-onb .tile .count{font-family:var(--mono);font-size:10px;color:var(--fg-mute);letter-spacing:.1em;text-transform:uppercase;margin-top:-6px}
.im-onb .tile .chk{position:absolute;top:10px;right:10px;width:18px;height:18px;border-radius:6px;border:1px solid var(--line-2);display:grid;place-items:center;transition:.15s}
.im-onb .tile .chk svg{width:10px;height:10px;color:var(--accent-ink);opacity:0}
.im-onb .tile.selected{border-color:var(--accent);background:linear-gradient(180deg,var(--accent-soft),rgba(212,244,52,0.02));box-shadow:inset 0 0 0 1px var(--accent-border),0 18px 40px -22px rgba(212,244,52,0.3)}
.im-onb .tile.selected .chk{background:var(--accent);border-color:var(--accent)}
.im-onb .tile.selected .chk svg{opacity:1}
.im-onb .tile.selected .ico,.im-onb .tile.selected .name{color:var(--accent)}
.im-onb .tile.selected .count{color:var(--fg-dim)}

.im-onb .reach-stack{display:flex;flex-direction:column;gap:14px;max-width:720px}
.im-onb .reach-row{border:1px solid var(--line);border-radius:14px;padding:18px;background:var(--bg-2);display:grid;grid-template-columns:auto 1fr 1fr;gap:14px;align-items:center}
.im-onb .reach-row .plat{display:flex;align-items:center;gap:10px;min-width:140px}
.im-onb .reach-row .plat .piko{width:30px;height:30px;border-radius:8px;background:var(--surface-tint);border:1px solid var(--line-2);display:grid;place-items:center;color:var(--fg-dim)}
.im-onb .reach-row .plat .piko svg{width:16px;height:16px}
.im-onb .reach-row .plat .pname{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg)}
.im-onb .inp{position:relative}
.im-onb .inp .lico{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--fg-mute);font-family:var(--mono);font-size:13px;pointer-events:none;display:flex;align-items:center}
.im-onb .inp input{width:100%;height:44px;border-radius:10px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:0 14px 0 36px;font-family:var(--sans);font-size:14px;outline:none;transition:.15s}
.im-onb .inp input::placeholder{color:var(--fg-mute)}
.im-onb .inp input:focus{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 3px rgba(212,244,52,0.08)}
.im-onb .reach-empty{border:1px dashed var(--line-2);border-radius:14px;padding:28px;text-align:center;color:var(--fg-mute);font-size:13px;font-family:var(--mono);letter-spacing:.08em}

.im-onb .form-col{display:flex;flex-direction:column;gap:18px;max-width:620px}
.im-onb .fld label{display:block;font-size:13px;color:var(--fg);margin-bottom:8px;font-weight:500}
.im-onb .fld label .req{color:var(--accent);margin-left:2px}
.im-onb .fld .inp input,.im-onb .fld textarea{width:100%;border-radius:10px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:12px 14px 12px 40px;font-family:var(--sans);font-size:14px;outline:none;transition:.15s;line-height:1.5}
.im-onb .fld .inp .lico{left:14px;top:14px;transform:none}
.im-onb .fld textarea{min-height:110px;resize:vertical}
.im-onb .fld .inp input:focus,.im-onb .fld textarea:focus{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 3px rgba(212,244,52,0.08)}
.im-onb .fld textarea::placeholder{color:var(--fg-mute)}
.im-onb .fld .err{color:var(--danger);font-family:var(--mono);font-size:11px;letter-spacing:.08em;margin-top:6px}

.im-onb .success{display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-radius:12px;border:1px solid var(--accent-border);background:var(--accent-soft)}
.im-onb .success .chk{width:22px;height:22px;border-radius:50%;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;flex:none;margin-top:1px}
.im-onb .success .chk svg{width:12px;height:12px}
.im-onb .success b{font-size:14px;color:var(--fg);display:block;margin-bottom:3px}
.im-onb .success span{color:var(--fg-dim);font-size:13px;line-height:1.5}
.im-onb .success span kbd{font-family:var(--mono);font-size:11.5px;color:var(--accent);background:none;padding:0}

.im-onb .nav-row{display:flex;justify-content:space-between;align-items:center;max-width:780px;padding-top:16px;margin-top:24px}
.im-onb .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:999px;font-size:13.5px;font-weight:500;transition:.15s ease;border:1px solid transparent;white-space:nowrap;cursor:pointer}
.im-onb .btn-line{border-color:var(--line-2);color:var(--fg);background:var(--surface-1)}
.im-onb .btn-line:hover{background:var(--surface-1-hover)}
.im-onb .btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:500}
.im-onb .btn-solid:hover{filter:brightness(1.08);transform:translateY(-1px)}
.im-onb .btn-solid:disabled{opacity:.45;cursor:not-allowed;transform:none;filter:none}
.im-onb .sel-count{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}
.im-onb .sel-count b{color:var(--accent);font-weight:500}

.im-onb .overlay{position:fixed;inset:0;z-index:80;background:var(--scrim);backdrop-filter:blur(10px);display:grid;place-items:center}
.im-onb .overlay .card{max-width:420px;text-align:center;padding:40px;border:1px solid var(--accent-border);background:var(--bg-2);border-radius:18px;box-shadow:0 40px 80px -20px rgba(0,0,0,.5)}
.im-onb .overlay .card h3{font-family:var(--serif);font-size:32px;line-height:1.1;margin:0 0 8px;font-weight:400}
.im-onb .overlay .card h3 em{color:var(--fg-dim);font-style:italic}
.im-onb .overlay .card p{color:var(--fg-dim);font-size:14px;line-height:1.55;margin:0 0 22px}

@media (max-width:960px){
  .im-onb .shell{grid-template-columns:1fr}
  .im-onb .side{border-right:0;border-bottom:1px solid var(--line);gap:28px}
  .im-onb .side-tag{font-size:28px}
  .im-onb .stepper{flex-direction:row;overflow-x:auto;margin-top:10px}
  .im-onb .step{min-width:140px}
  .im-onb .main-top,.im-onb .main-body{padding-left:24px;padding-right:24px}
  .im-onb .grid{grid-template-columns:repeat(2,1fr)}
  .im-onb .reach-row{grid-template-columns:1fr;gap:10px}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('im-onb-styles')) {
  const tag = document.createElement('style');
  tag.id = 'im-onb-styles';
  tag.textContent = ONBOARDING_CSS;
  document.head.appendChild(tag);
}

const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>
);

const PLATFORMS = [
  { id:'instagram', name:'Instagram', sub:'Posts · Reels', placeholder:'@yourhandle',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg> },
  { id:'youtube', name:'YouTube', sub:'Long · Shorts', placeholder:'Channel name or URL',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg> },
  { id:'tiktok', name:'TikTok', sub:'Short-form', placeholder:'@yourhandle',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.5a3.5 3.5 0 11-3.5-3.5"/><path d="M14 4c0 2.5 2 4.5 4.5 4.5"/></svg> },
  { id:'twitter', name:'X / Twitter', sub:'Threads', placeholder:'@yourhandle',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M20 4L4 20"/></svg> },
  { id:'linkedin', name:'LinkedIn', sub:'Thought leadership', placeholder:'linkedin.com/in/...',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 114 0v4M12 10v7" strokeLinecap="round"/></svg> },
  { id:'substack', name:'Newsletter', sub:'Substack · Beehiiv', placeholder:'yoursubstack.com',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d="M4 5h16M4 10h16M4 15h16v5l-8-4-8 4z"/></svg> },
];

const NICHES = [
  { id:'food', name:'Food & Dining', count:'2,140 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v18M18 3v6a3 3 0 01-3 3v9M9 3v6M12 3v6M6 10a3 3 0 006 0"/></svg> },
  { id:'travel', name:'Travel', count:'1,620 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16l20-8-8 14-3-6z"/></svg> },
  { id:'fashion', name:'Fashion & Beauty', count:'3,410 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d="M8 4l4 3 4-3 4 3-2 4-2-1v10H6V10l-2 1-2-4z"/></svg> },
  { id:'fitness', name:'Fitness & Health', count:'1,980 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h2M19 12h2M7 8v8M17 8v8M7 12h10"/></svg> },
  { id:'tech', name:'Tech', count:'1,240 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 21h8M12 17v4"/></svg> },
  { id:'gaming', name:'Gaming', count:'860 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d="M6 8h12a3 3 0 013 3v2a3 3 0 01-3 3l-2-2H8l-2 2a3 3 0 01-3-3v-2a3 3 0 013-3z"/><circle cx="8.5" cy="12" r=".6" fill="currentColor"/><circle cx="15.5" cy="12" r=".6" fill="currentColor"/></svg> },
  { id:'parenting', name:'Parenting', count:'740 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="4"/><path d="M10 10h.01M14 10h.01M10 14c.8.6 1.3.9 2 .9s1.2-.3 2-.9"/></svg> },
  { id:'finance', name:'Finance', count:'520 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="16" cy="12.5" r="1.4"/></svg> },
  { id:'education', name:'Education', count:'680 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d="M4 7l8-4 8 4-8 4-8-4zM6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg> },
  { id:'lifestyle', name:'Lifestyle', count:'2,860 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2 5 5 .5-4 3.5 1.5 5-4.5-3-4.5 3L9 12 5 8.5 10 8z"/></svg> },
  { id:'home', name:'Home & Decor', count:'1,120 campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H10v6H4a1 1 0 01-1-1z"/></svg> },
  { id:'other', name:'Other', count:'Tell us more',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/></svg> },
];

const STEPS = [
  { id:1, label:'Platforms' },
  { id:2, label:'Reach' },
  { id:3, label:'Niche' },
  { id:4, label:'About you' },
];

export default function InfluencerOnboarding() {
  const { completeOnboarding } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [platforms, setPlatforms] = useState({});
  const [niches, setNiches] = useState(new Set());
  const [form, setForm] = useState({ fullName:'', phone:'', city:'', bio:'' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const togglePlatform = (id) => {
    setPlatforms((p) => {
      const n = { ...p };
      if (n[id]) delete n[id];
      else n[id] = { handle:'', followers:'' };
      return n;
    });
  };

  const updatePlatform = (id, field, val) => {
    setPlatforms((p) => ({ ...p, [id]: { ...p[id], [field]: val } }));
  };

  const toggleNiche = (id) => {
    setNiches((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else if (n.size < 3) n.add(id);
      return n;
    });
  };

  const goto = (n) => {
    if (n < 1 || n > 4) return;
    setStep(n);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const selectedPlatforms = Object.keys(platforms);
  const canContinue =
    (step === 1 && selectedPlatforms.length > 0) ||
    (step === 2) ||
    (step === 3 && niches.size > 0) ||
    (step === 4);

  const finish = async () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (Object.keys(e).length) { setErrors(e); return; }

    const nicheNames = [...niches].map((id) => NICHES.find((n) => n.id === id)?.name).filter(Boolean);
    const primary = platforms.instagram || Object.values(platforms)[0] || {};
    try {
      await completeOnboarding({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        bio: form.bio.trim(),
        niche: nicheNames[0] || '',
        niches: nicheNames,
        platforms,
        instagram: platforms.instagram?.handle || '',
        followers: primary.followers || '',
      });
      setDone(true);
    } catch (err) {
      setErrors({ submit: err.message || 'Could not save profile. Try again.' });
    }
  };

  const progress = step * 25;

  return (
    <div className="im-onb">
      <div className="grid-bg" />
      <div className="glow" />

      <div className="shell">
        <aside className="side">
          <a href="/" className="brand"><span className="mark" />Influ<em>Match</em></a>

          <div>
            <div className="side-eyebrow">Creator onboarding</div>
            <h3 className="side-tag">A few <em>clicks</em> from your next <span className="accent">brand deal.</span></h3>
            <p className="side-lede">Build your creator profile in minutes. Discover campaigns, get paid, grow your following.</p>
          </div>

          <nav className="stepper">
            {STEPS.map((s) => {
              const cls = 'step' + (step === s.id ? ' active' : step > s.id ? ' done' : '');
              return (
                <div key={s.id} className={cls}>
                  <span className="dot">{step > s.id ? <IconCheck width="13" height="13" /> : s.id}</span>
                  <span className="label">{s.label}</span>
                  <span className="chev">→</span>
                </div>
              );
            })}
          </nav>

          <div className="side-foot">
            <span className="pulse" />
            <span>Autosaving · encrypted</span>
          </div>
        </aside>

        <main className="main">
          <div className="main-top">
            <div className="progress">
              <span>Step {String(step).padStart(2,'0')} of 04</span>
              <span className="bar"><i style={{ width: progress + '%' }} /></span>
            </div>
            <div className="right" style={{ display:'flex', gap:18, alignItems:'center' }}>
              <button onClick={toggleTheme} title="Toggle theme" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--fg-dim)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.14em', textTransform:'uppercase' }}>
                {theme === 'dark' ? '☀ Light' : '☾ Dark'}
              </button>
            
            </div>
          </div>

          <div className="main-body">
            {step === 1 && (
              <section>
                <div className="q-kicker"><span className="n">01 —</span> Platforms</div>
                <h2 className="q">Where do you <em>create?</em></h2>
                <p className="q-sub">Pick every platform where you post content. You can select more than one — we'll only show campaigns that match.</p>

                <div className="grid">
                  {PLATFORMS.map((p) => (
                    <button key={p.id} type="button"
                      className={'tile' + (platforms[p.id] ? ' selected' : '')}
                      onClick={() => togglePlatform(p.id)}>
                      <span className="chk"><IconCheck /></span>
                      <span className="ico">{p.svg}</span>
                      <span className="name">{p.name}</span>
                      <span className="count">{p.sub}</span>
                    </button>
                  ))}
                </div>

                <div className="nav-row">
                  <span className="sel-count"><b>{selectedPlatforms.length}</b> selected</span>
                  <button className="btn btn-solid" disabled={selectedPlatforms.length === 0} onClick={() => goto(2)}>Continue <span>→</span></button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <div className="q-kicker"><span className="n">02 —</span> Reach</div>
                <h2 className="q">How big is your <em>audience?</em></h2>
                <p className="q-sub">Add your handle and follower count for each selected platform. We use this to match you to campaigns in your tier.</p>

                <div className="reach-stack">
                  {selectedPlatforms.length === 0 && (
                    <div className="reach-empty">No platforms selected — go back and pick at least one.</div>
                  )}
                  {selectedPlatforms.map((id) => {
                    const meta = PLATFORMS.find((p) => p.id === id);
                    return (
                      <div key={id} className="reach-row">
                        <div className="plat"><span className="piko">{meta.svg}</span><span className="pname">{meta.name}</span></div>
                        <div className="inp">
                          <span className="lico">@</span>
                          <input type="text" placeholder={meta.placeholder}
                            value={platforms[id].handle}
                            onChange={(e) => updatePlatform(id,'handle',e.target.value)} />
                        </div>
                        <div className="inp">
                          <span className="lico">#</span>
                          <input type="text" placeholder="Followers (e.g. 45K)"
                            value={platforms[id].followers}
                            onChange={(e) => updatePlatform(id,'followers',e.target.value)} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="nav-row">
                  <button className="btn btn-line" onClick={() => goto(1)}>← Back</button>
                  <button className="btn btn-solid" onClick={() => goto(3)}>Continue <span>→</span></button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <div className="q-kicker"><span className="n">03 —</span> Niche</div>
                <h2 className="q">What's your <em>niche?</em></h2>
                <p className="q-sub">Your main content focus — this is how brands will discover you. Pick up to three.</p>

                <div className="grid">
                  {NICHES.map((n) => (
                    <button key={n.id} type="button"
                      className={'tile' + (niches.has(n.id) ? ' selected' : '')}
                      onClick={() => toggleNiche(n.id)}>
                      <span className="chk"><IconCheck /></span>
                      <span className="ico">{n.svg}</span>
                      <span className="name">{n.name}</span>
                      <span className="count">{n.count}</span>
                    </button>
                  ))}
                </div>

                <div className="nav-row">
                  <button className="btn btn-line" onClick={() => goto(2)}>← Back</button>
                  <div style={{ display:'flex', gap:18, alignItems:'center' }}>
                    <span className="sel-count"><b>{niches.size}</b> / 3 selected</span>
                    <button className="btn btn-solid" disabled={niches.size === 0} onClick={() => goto(4)}>Continue <span>→</span></button>
                  </div>
                </div>
              </section>
            )}

            {step === 4 && (
              <section>
                <div className="q-kicker"><span className="n">04 —</span> About you</div>
                <h2 className="q">A little <em>about</em> you.</h2>
                <p className="q-sub">Basic info so brands can reach out. This is the last step — we'll take you to your dashboard next.</p>

                <div className="form-col">
                  <div className="fld">
                    <label>Full name <span className="req">*</span></label>
                    <div className="inp">
                      <span className="lico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
                      </span>
                      <input type="text" placeholder="e.g. Maia Field"
                        value={form.fullName}
                        onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
                    </div>
                    {errors.fullName && <div className="err">{errors.fullName}</div>}
                  </div>

                  <div className="fld">
                    <label>Phone number <span className="req">*</span></label>
                    <div className="inp">
                      <span className="lico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 012-2h2l2 5-2 1a12 12 0 006 6l1-2 5 2v2a2 2 0 01-2 2A16 16 0 014 5z"/></svg>
                      </span>
                      <input type="tel" placeholder="+1 (415) 555 0123"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                    </div>
                    {errors.phone && <div className="err">{errors.phone}</div>}
                  </div>

                  <div className="fld">
                    <label>City <span className="req">*</span></label>
                    <div className="inp">
                      <span className="lico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>
                      </span>
                      <input type="text" placeholder="e.g. Brooklyn, NY"
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                    </div>
                    {errors.city && <div className="err">{errors.city}</div>}
                  </div>

                  <div className="fld">
                    <label>Bio <span style={{ color:'var(--fg-mute)', fontWeight:400 }}>— optional</span></label>
                    <div className="inp">
                      <span className="lico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>
                      </span>
                      <textarea placeholder="Tell brands a little about your content and what you care about..."
                        value={form.bio}
                        onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                    </div>
                  </div>

                  <div className="success">
                    <span className="chk"><IconCheck /></span>
                    <div>
                      <b>You're all set.</b>
                      <span>Hit <kbd>Finish</kbd> to complete your profile — we'll match you to campaigns within the hour.</span>
                    </div>
                  </div>
                </div>

                <div className="nav-row">
                  <button className="btn btn-line" onClick={() => goto(3)}>← Back</button>
                  <button className="btn btn-solid" onClick={finish}>Finish <span>→</span></button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {done && (
        <div className="overlay">
          <div className="card">
            <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--accent)', color:'var(--accent-ink)', display:'grid', placeItems:'center', margin:'0 auto 18px' }}>
              <IconCheck width="22" height="22" />
            </div>
            <h3>Welcome to <em>InfluMatch.</em></h3>
            <p>Your profile is live. We're matching you to campaigns now — check your dashboard in a minute.</p>
            <button className="btn btn-solid" onClick={() => navigate('/influencer/dashboard')}>Go to dashboard →</button>
          </div>
        </div>
      )}
    </div>
  );
}
