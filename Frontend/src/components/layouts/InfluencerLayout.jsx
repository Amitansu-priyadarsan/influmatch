import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const APP_CSS = `
.im-app{min-height:100vh;background:var(--bg);color:var(--fg);font-family:var(--sans);-webkit-font-smoothing:antialiased;display:flex}
.im-app *{box-sizing:border-box}
.im-app a{color:inherit;text-decoration:none}
.im-app button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}

.im-app .sb{width:260px;flex:none;background:var(--bg);border-right:1px solid var(--line);display:flex;flex-direction:column;position:fixed;inset:0 auto 0 0;z-index:50;transition:transform .25s ease}
.im-app .sb .sb-brand{padding:24px 22px 22px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:10px}
.im-app .sb .sb-brand .mark{width:12px;height:12px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(255,255,255,.04)}
.im-app .sb .sb-brand .name{font-family:var(--serif);font-size:20px;letter-spacing:-.01em}
.im-app .sb .sb-brand .name em{font-style:italic;color:var(--fg-dim)}
.im-app .sb .sb-role{font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-top:2px}

.im-app .sb-section{padding:22px 14px 6px;font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute)}
.im-app .sb-nav{padding:6px 10px;display:flex;flex-direction:column;gap:2px;flex:1}
.im-app .sb-link{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:8px;font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-dim);transition:.15s;position:relative;border:1px solid transparent}
.im-app .sb-link:hover{background:rgba(255,255,255,0.03);color:var(--fg)}
.im-app .sb-link.active{background:linear-gradient(90deg,var(--accent-soft),transparent 80%);color:var(--accent);border-color:rgba(212,244,52,0.18)}
.im-app .sb-link.active::before{content:"";position:absolute;left:-10px;top:50%;transform:translateY(-50%);width:3px;height:18px;background:var(--accent);border-radius:2px}
.im-app .sb-link .ico{width:16px;height:16px;display:grid;place-items:center;flex:none;color:currentColor}
.im-app .sb-link .ico svg{width:16px;height:16px}
.im-app .sb-link .arrow{margin-left:auto;opacity:0;color:var(--accent);transition:.15s}
.im-app .sb-link.active .arrow{opacity:1}

.im-app .sb-foot{border-top:1px solid var(--line);padding:14px}
.im-app .sb-user{display:flex;align-items:center;gap:10px;padding:10px 8px;border-radius:10px;margin-bottom:8px;width:100%;text-align:left;border:1px solid transparent;background:transparent;transition:.15s}
.im-app .sb-user-btn{cursor:pointer}
.im-app .sb-user-btn:hover{background:rgba(255,255,255,.03);border-color:var(--line)}
.im-app .sb-user-chev{margin-left:auto;color:var(--fg-mute);font-family:var(--mono);opacity:0;transition:.15s}
.im-app .sb-user-btn:hover .sb-user-chev{opacity:1;color:var(--accent)}
.im-app .sb-user .av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--avatar-from),var(--avatar-to));border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:15px;color:var(--fg-dim);flex:none}
.im-app .sb-user .who{min-width:0}
.im-app .sb-user .who b{font-size:13px;font-weight:500;display:block;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.im-app .sb-user .who span{font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--fg-mute);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.im-app .sb-logout{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);border:1px solid var(--line);background:var(--surface-faint);transition:.15s}
.im-app .sb-logout:hover{color:var(--danger);border-color:var(--danger-border);background:var(--danger-soft)}
.im-app .sb-theme{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-dim);border:1px solid var(--line);background:transparent;transition:.15s;margin-bottom:8px;cursor:pointer}
.im-app .sb-theme:hover{color:var(--fg);border-color:var(--line-2)}
.im-app .sb-theme .pill{margin-left:auto;font-family:var(--mono);font-size:9.5px;color:var(--accent);letter-spacing:.12em}

.im-app .main{flex:1;margin-left:260px;min-width:0;min-height:100vh;display:flex;flex-direction:column;position:relative}
.im-app .glow{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.im-app .glow::before{content:"";position:absolute;width:540px;height:540px;right:-160px;top:-200px;border-radius:50%;background:radial-gradient(circle,rgba(212,244,52,0.05) 0%,transparent 70%);filter:blur(60px)}

.im-app .topbar{border-bottom:1px solid var(--line);padding:16px 32px;display:flex;align-items:center;justify-content:space-between;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);position:sticky;top:0;background:var(--bg-translucent);backdrop-filter:blur(12px);z-index:20}
.im-app .topbar .bar{width:180px;height:4px;background:var(--line);border-radius:999px;overflow:hidden}
.im-app .topbar .bar i{display:block;height:100%;background:var(--accent);transition:width .3s}

.im-app .page{padding:40px 32px 60px;max-width:1200px;width:100%;margin:0 auto;position:relative;z-index:1}

.im-app .mobile-top{display:none}
.im-app .sb-overlay{display:none}

@media (max-width:900px){
  .im-app .sb{transform:translateX(-100%)}
  .im-app .sb.open{transform:translateX(0)}
  .im-app .sb-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:40}
  .im-app .main{margin-left:0}
  .im-app .mobile-top{display:flex;position:sticky;top:0;z-index:30;background:var(--bg-translucent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:14px 18px;align-items:center;justify-content:space-between}
  .im-app .mobile-top .brand{display:flex;gap:10px;align-items:center;font-family:var(--serif);font-size:18px}
  .im-app .mobile-top .brand .mark{width:10px;height:10px;border-radius:50%;background:var(--accent)}
  .im-app .mobile-top button{width:36px;height:36px;border:1px solid var(--line-2);border-radius:8px;display:grid;place-items:center;color:var(--fg)}
  .im-app .topbar{display:none}
  .im-app .page{padding:24px 18px 48px}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('im-app-styles')) {
  const tag = document.createElement('style');
  tag.id = 'im-app-styles';
  tag.textContent = APP_CSS;
  document.head.appendChild(tag);
}

const NAV = [
  {
    to:'/influencer/dashboard', label:'Dashboard',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
  },
  {
    to:'/influencer/browse', label:'Browse Campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
  },
  {
    to:'/influencer/campaigns', label:'My Campaigns',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-7v16L3 13z"/><path d="M7 12v5"/></svg>
  },
  {
    to:'/influencer/profile', label:'Profile',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
  },
];

function computeProfilePct(user) {
  const p = user?.profile;
  if (!p) return 0;
  const fields = [
    p.fullName,
    p.phone,
    p.city,
    p.bio,
    p.niche,
    p.instagram || (p.platforms && Object.keys(p.platforms).length > 0),
    p.followers,
  ];
  const filled = fields.filter((f) => !!f && String(f).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export default function InfluencerLayout({ children, title }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const name = user?.profile?.fullName || user?.email || 'Creator';
  const initials = (user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'C').toUpperCase();
  const handle = user?.profile?.instagram || user?.email || '';
  const profilePct = computeProfilePct(user);

  return (
    <div className="im-app">
      <div className="glow" />

      {open && <div className="sb-overlay" onClick={() => setOpen(false)} />}

      <aside className={'sb' + (open ? ' open' : '')}>
        <div className="sb-brand">
          <span className="mark" />
          <div>
            <div className="name">Influ<em>Match</em></div>
            <div className="sb-role">Creator</div>
          </div>
        </div>

        <nav className="sb-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)}
              className={({ isActive }) => 'sb-link' + (isActive ? ' active' : '')}>
              <span className="ico">{n.svg}</span>
              <span>{n.label}</span>
              <span className="arrow">→</span>
            </NavLink>
          ))}
        </nav>

        <div className="sb-foot">
          <button type="button" className="sb-user sb-user-btn" onClick={() => { setOpen(false); navigate('/influencer/profile'); }}>
            <div className="av">{initials}</div>
            <div className="who">
              <b>{name}</b>
              <span>{handle}</span>
            </div>
            <span className="sb-user-chev">→</span>
          </button>
          <button className="sb-theme" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            )}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            <span className="pill">{theme === 'dark' ? 'OFF' : 'ON'}</span>
          </button>
          <button className="sb-logout" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="mobile-top">
          <div className="brand"><span className="mark" />Influ<em style={{ color:'var(--fg-dim)', fontStyle:'italic' }}>Match</em></div>
          <button onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            )}
          </button>
        </div>

        <div className="topbar">
          <span>{title || 'Creator workspace'}</span>
          <div style={{ display:'flex', gap:16, alignItems:'center', cursor:'pointer' }} onClick={() => navigate('/influencer/profile')}>
            <span>Profile · {profilePct}% complete</span>
            <span className="bar"><i style={{ width: profilePct + '%' }} /></span>
          </div>
        </div>

        <div className="page">{children}</div>
      </div>
    </div>
  );
}
