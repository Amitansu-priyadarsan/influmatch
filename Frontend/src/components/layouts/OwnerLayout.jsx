import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const APP_CSS = `
.ob-app{
  --accent:oklch(0.72 0.14 250);
  --accent-ink:#ffffff;
  --accent-soft:rgba(96,140,220,0.10);
  --accent-border:rgba(96,140,220,0.50);
  min-height:100vh;background:var(--bg);color:var(--fg);font-family:var(--sans);-webkit-font-smoothing:antialiased;display:flex
}
:root[data-theme="light"] .ob-app{
  --accent:oklch(0.55 0.16 255);
  --accent-soft:rgba(45,90,180,0.10);
  --accent-border:rgba(45,90,180,0.45);
}
.ob-app *{box-sizing:border-box}
.ob-app a{color:inherit;text-decoration:none}
.ob-app button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}

.ob-app .sb{width:248px;flex:none;background:var(--bg);border-right:1px solid var(--line);display:flex;flex-direction:column;position:fixed;inset:0 auto 0 0;z-index:50;transition:transform .25s ease}
.ob-app .sb .sb-brand{padding:22px 20px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px}
.ob-app .sb .sb-brand .mark{width:30px;height:30px;border-radius:8px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;flex:none}
.ob-app .sb .sb-brand .mark svg{width:16px;height:16px}
.ob-app .sb .sb-brand .name{font-weight:600;font-size:15px;letter-spacing:-.01em;color:var(--fg)}
.ob-app .sb .sb-brand .role{font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-top:2px}

.ob-app .sb-section{padding:20px 18px 8px;font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute)}
.ob-app .sb-nav{padding:6px 12px;display:flex;flex-direction:column;gap:2px;flex:1}
.ob-app .sb-link{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;font-size:13.5px;font-weight:500;color:var(--fg-dim);transition:.15s;border:1px solid transparent}
.ob-app .sb-link:hover{background:var(--surface-1);color:var(--fg)}
.ob-app .sb-link.active{background:var(--accent-soft);color:var(--accent);border-color:var(--accent-border)}
.ob-app .sb-link .ico{width:18px;height:18px;display:grid;place-items:center;flex:none}
.ob-app .sb-link .ico svg{width:18px;height:18px}
.ob-app .sb-link .badge{margin-left:auto;font-family:var(--mono);font-size:10px;background:var(--accent);color:var(--accent-ink);padding:2px 7px;border-radius:999px;font-weight:600}

.ob-app .sb-foot{border-top:1px solid var(--line);padding:14px}
.ob-app .sb-user{display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;margin-bottom:8px;width:100%;text-align:left;border:1px solid var(--line);background:var(--surface-faint)}
.ob-app .sb-user .av{width:36px;height:36px;border-radius:10px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:600;font-size:14px;flex:none}
.ob-app .sb-user .who{min-width:0;flex:1}
.ob-app .sb-user .who b{font-size:13px;font-weight:600;display:block;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ob-app .sb-user .who span{font-size:11px;color:var(--fg-mute);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.ob-app .sb-theme{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:12.5px;color:var(--fg-dim);border:1px solid var(--line);background:transparent;transition:.15s;margin-bottom:6px;cursor:pointer}
.ob-app .sb-theme:hover{color:var(--fg);border-color:var(--line-2)}
.ob-app .sb-theme .pill{margin-left:auto;font-family:var(--mono);font-size:9.5px;color:var(--accent);letter-spacing:.12em}
.ob-app .sb-logout{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:12.5px;color:var(--fg-mute);border:1px solid var(--line);background:transparent;transition:.15s}
.ob-app .sb-logout:hover{color:var(--danger);border-color:var(--danger-border);background:var(--danger-soft)}

.ob-app .main{flex:1;margin-left:248px;min-width:0;min-height:100vh;display:flex;flex-direction:column;position:relative}

.ob-app .topbar{border-bottom:1px solid var(--line);padding:14px 32px;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:var(--fg-dim);position:sticky;top:0;background:var(--bg-translucent);backdrop-filter:blur(12px);z-index:20}
.ob-app .topbar .crumb{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute)}
.ob-app .topbar .crumb b{color:var(--fg);font-weight:500}
.ob-app .topbar .biz{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute)}
.ob-app .topbar .biz b{color:var(--accent);font-weight:500;margin-left:8px}

.ob-app .page{padding:36px 32px 64px;max-width:1240px;width:100%;margin:0 auto;position:relative;z-index:1}

.ob-app .mobile-top{display:none}
.ob-app .sb-overlay{display:none}

@media (max-width:900px){
  .ob-app .sb{transform:translateX(-100%)}
  .ob-app .sb.open{transform:translateX(0)}
  .ob-app .sb-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:40}
  .ob-app .main{margin-left:0}
  .ob-app .mobile-top{display:flex;position:sticky;top:0;z-index:30;background:var(--bg-translucent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:12px 18px;align-items:center;justify-content:space-between}
  .ob-app .mobile-top .brand{display:flex;gap:10px;align-items:center;font-weight:600;font-size:15px}
  .ob-app .mobile-top .brand .mark{width:26px;height:26px;border-radius:7px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center}
  .ob-app .mobile-top button{width:36px;height:36px;border:1px solid var(--line-2);border-radius:8px;display:grid;place-items:center;color:var(--fg)}
  .ob-app .topbar{display:none}
  .ob-app .page{padding:22px 18px 48px}
}

/* Shared modal — used across all brand pages */
.ob-modal-back{position:fixed;inset:0;z-index:70;background:var(--scrim);backdrop-filter:blur(10px);display:grid;place-items:center;padding:24px;animation:ob-fade .18s ease}
@keyframes ob-fade{from{opacity:0}to{opacity:1}}
.ob-modal{width:100%;max-width:560px;max-height:90vh;overflow:auto;background:var(--bg-2);border:1px solid var(--line-2);border-radius:14px;padding:26px;position:relative;animation:ob-rise .22s cubic-bezier(.2,.7,.2,1)}
@keyframes ob-rise{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
.ob-modal .x{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:8px;border:1px solid var(--line);display:grid;place-items:center;color:var(--fg-mute);cursor:pointer;transition:.15s}
.ob-modal .x:hover{color:var(--fg);border-color:var(--line-2)}
.ob-modal .m-kick{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
.ob-modal h3{font-weight:600;font-size:24px;letter-spacing:-.015em;margin:0 0 6px;color:var(--fg)}
.ob-modal .m-sub{font-size:13.5px;color:var(--fg-dim);margin:0 0 22px;line-height:1.5}
.ob-modal .fld{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.ob-modal .fld label{font-size:12px;color:var(--fg-dim);font-weight:500;text-transform:uppercase;letter-spacing:.08em;font-family:var(--mono)}
.ob-modal .fld input,.ob-modal .fld textarea{width:100%;border-radius:10px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:12px 14px;font-family:var(--sans);font-size:14px;outline:none;transition:.15s;line-height:1.5}
.ob-modal .fld textarea{min-height:90px;resize:vertical}
.ob-modal .fld input:focus,.ob-modal .fld textarea:focus{border-color:var(--accent);background:var(--accent-soft)}
.ob-modal .fld .err{color:var(--danger);font-size:11.5px;font-family:var(--mono);letter-spacing:.04em;margin-top:2px}
.ob-modal .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ob-modal .m-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px}
.ob-modal .ok-state{text-align:center;padding:18px 6px}
.ob-modal .ok-state .tick{width:48px;height:48px;border-radius:50%;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;margin:0 auto 14px}
.ob-modal .ok-state h4{font-weight:600;font-size:20px;margin:0 0 6px;color:var(--fg)}
.ob-modal .ok-state p{color:var(--fg-dim);font-size:13.5px;margin:0}

.ob-app .btn{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;border:1px solid transparent;cursor:pointer;transition:.15s;white-space:nowrap}
.ob-app .btn-line,.ob-modal .btn-line{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:.15s;border:1px solid var(--line-2);color:var(--fg);background:var(--surface-1)}
.ob-app .btn-line:hover,.ob-modal .btn-line:hover{background:var(--surface-1-hover)}
.ob-app .btn-solid,.ob-modal .btn-solid{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:.15s;background:var(--accent);color:var(--accent-ink);border:1px solid var(--accent)}
.ob-app .btn-solid:hover,.ob-modal .btn-solid:hover{filter:brightness(1.08)}
.ob-app .btn-danger,.ob-modal .btn-danger{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:.15s;background:var(--danger-soft);color:var(--danger);border:1px solid var(--danger-border)}
.ob-app .btn-danger:hover,.ob-modal .btn-danger:hover{background:var(--danger);color:#fff}
.ob-app .btn-success,.ob-modal .btn-success{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:.15s;background:var(--accent);color:var(--accent-ink);border:1px solid var(--accent)}
.ob-app .btn-sm,.ob-modal .btn-sm{padding:7px 12px;font-size:12px;border-radius:7px}
`;

if (typeof document !== 'undefined' && !document.getElementById('ob-app-styles')) {
  const tag = document.createElement('style');
  tag.id = 'ob-app-styles';
  tag.textContent = APP_CSS;
  document.head.appendChild(tag);
}

const NAV = [
  {
    to: '/owner/dashboard', label: 'Dashboard',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
  },
  {
    to: '/owner/campaigns', label: 'My Campaigns',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-7v16L3 13z"/><path d="M7 12v5"/></svg>
  },
  {
    to: '/owner/applicants', label: 'Applicants',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M21.5 18.5c0-2-1.5-3.5-4-3.5"/></svg>
  },
];

export default function OwnerLayout({ children, title, crumb }) {
  const { user, logout, campaigns } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const myCampaigns = (campaigns || []).filter((c) => c.ownerId === user?.id);
  const pendingApps = myCampaigns.reduce(
    (sum, c) => sum + (c.applications || []).filter((a) => a.status === 'pending').length, 0
  );

  const business = user?.business || 'Brand';
  const initials = (business?.charAt(0) || 'B').toUpperCase();

  return (
    <div className="ob-app">
      {open && <div className="sb-overlay" onClick={() => setOpen(false)} />}

      <aside className={'sb' + (open ? ' open' : '')}>
        <div className="sb-brand">
          <span className="mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7"/></svg>
          </span>
          <div>
            <div className="name">InfluMatch</div>
            <div className="role">Brand workspace</div>
          </div>
        </div>

        <div className="sb-section">Menu</div>
        <nav className="sb-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)} end={n.to === '/owner/applicants'}
              className={({ isActive }) => 'sb-link' + (isActive ? ' active' : '')}>
              <span className="ico">{n.svg}</span>
              <span>{n.label}</span>
              {n.to === '/owner/applicants' && pendingApps > 0 && <span className="badge">{pendingApps}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sb-foot">
          <div className="sb-user">
            <div className="av">{initials}</div>
            <div className="who">
              <b>{business}</b>
              <span>{user?.email}</span>
            </div>
          </div>
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
          <div className="brand">
            <span className="mark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7"/></svg>
            </span>
            InfluMatch
          </div>
          <button onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            )}
          </button>
        </div>

        <div className="topbar">
          <div className="crumb">
            <span>Brand</span>
            <span>/</span>
            <b>{title || crumb || 'Dashboard'}</b>
          </div>
          <div className="biz">
            Workspace<b>{business}</b>
          </div>
        </div>

        <div className="page">{children}</div>
      </div>
    </div>
  );
}
