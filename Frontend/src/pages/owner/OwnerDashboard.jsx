import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import { useNavigate } from 'react-router-dom';

const DASH_CSS = `
.ob-dash .hello{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:32px;flex-wrap:wrap}
.ob-dash .kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.ob-dash h1{font-weight:600;font-size:clamp(28px,3vw,38px);line-height:1.1;letter-spacing:-.02em;margin:0;color:var(--fg)}
.ob-dash .sub{color:var(--fg-dim);font-size:14px;margin-top:8px}

.ob-dash .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
.ob-dash .stat{padding:20px;border:1px solid var(--line);border-radius:12px;background:var(--bg-2);display:flex;flex-direction:column;gap:8px;transition:.15s}
.ob-dash .stat:hover{border-color:var(--line-2)}
.ob-dash .stat .ico{width:34px;height:34px;border-radius:8px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;border:1px solid var(--accent-border);margin-bottom:6px}
.ob-dash .stat .ico svg{width:16px;height:16px}
.ob-dash .stat .lbl{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}
.ob-dash .stat .val{font-weight:600;font-size:30px;color:var(--fg);letter-spacing:-.02em;line-height:1}
.ob-dash .stat .delta{font-size:12px;color:var(--fg-dim)}

.ob-dash .callout{display:flex;align-items:center;gap:18px;padding:18px 20px;border:1px solid var(--accent-border);background:var(--accent-soft);border-radius:12px;margin-bottom:28px;cursor:pointer;transition:.15s}
.ob-dash .callout:hover{transform:translateY(-1px)}
.ob-dash .callout .ico{width:40px;height:40px;border-radius:10px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;flex:none}
.ob-dash .callout .body{flex:1;min-width:0}
.ob-dash .callout .t{font-size:14.5px;font-weight:600;color:var(--fg)}
.ob-dash .callout .s{font-size:13px;color:var(--fg-dim);margin-top:2px}
.ob-dash .callout .arrow{color:var(--accent);font-weight:600}

.ob-dash .sec-head{display:flex;justify-content:space-between;align-items:center;margin:8px 0 14px}
.ob-dash .sec-head h2{font-weight:600;font-size:18px;letter-spacing:-.01em;margin:0;color:var(--fg)}
.ob-dash .sec-head .link{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);cursor:pointer}
.ob-dash .sec-head .link:hover{text-decoration:underline}

.ob-dash .row{display:flex;flex-direction:column;gap:10px}
.ob-dash .camp{display:flex;align-items:center;gap:14px;padding:16px 18px;border:1px solid var(--line);border-radius:10px;background:var(--bg-2);transition:.15s}
.ob-dash .camp:hover{border-color:var(--line-2);background:var(--surface-hover)}
.ob-dash .camp .logo{width:38px;height:38px;border-radius:9px;background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent-border);display:grid;place-items:center;font-weight:600;flex:none}
.ob-dash .camp .info{flex:1;min-width:0}
.ob-dash .camp .info .t{font-weight:600;font-size:14.5px;color:var(--fg);margin-bottom:3px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ob-dash .camp .info .meta{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:var(--fg-mute);text-transform:uppercase;display:flex;gap:14px;flex-wrap:wrap}
.ob-dash .camp .info .meta .code{color:var(--accent)}
.ob-dash .camp .info .meta .pending{color:#ffb86b}
.ob-dash .camp .pill{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:5px 10px;border:1px solid var(--line-2);border-radius:999px;color:var(--fg-dim)}
.ob-dash .camp .pill.open{color:var(--accent);border-color:var(--accent-border);background:var(--accent-soft)}
.ob-dash .camp .pill.active{color:var(--accent);border-color:var(--accent);background:var(--accent-soft)}
.ob-dash .camp .pill.submitted{color:#7ee8a3;border-color:rgba(126,232,163,.45);background:rgba(126,232,163,.08)}

.ob-dash .empty{padding:60px 24px;border:1px dashed var(--line-2);border-radius:12px;text-align:center;background:var(--surface-faint)}
.ob-dash .empty p{color:var(--fg-dim);margin:0 0 14px;font-size:14px}

@media (max-width:1020px){
  .ob-dash .stats{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:600px){
  .ob-dash .stats{grid-template-columns:1fr}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('ob-dash-styles')) {
  const tag = document.createElement('style');
  tag.id = 'ob-dash-styles';
  tag.textContent = DASH_CSS;
  document.head.appendChild(tag);
}

export default function OwnerDashboard() {
  const { user, campaigns, influencers } = useAuth();
  const navigate = useNavigate();

  const myCampaigns = campaigns.filter((c) => c.ownerId === user.id);
  const activeCampaigns = myCampaigns.filter((c) => c.status === 'active');
  const submittedCampaigns = myCampaigns.filter((c) => c.submittedPost);
  const pendingApps = myCampaigns.reduce(
    (sum, c) => sum + (c.applications || []).filter((a) => a.status === 'pending').length, 0
  );

  const stats = [
    {
      label: 'Total campaigns', value: myCampaigns.length,
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-7v16L3 13z"/></svg>,
      delta: 'All campaigns'
    },
    {
      label: 'Active now', value: activeCampaigns.length,
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
      delta: 'In progress'
    },
    {
      label: 'Pending review', value: pendingApps,
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
      delta: pendingApps > 0 ? 'Awaiting your decision' : 'No pending'
    },
    {
      label: 'Posts received', value: submittedCampaigns.length,
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>,
      delta: 'Submitted'
    },
  ];

  return (
    <OwnerLayout title="Dashboard">
      <div className="ob-dash">
        <div className="hello">
          <div>
            <h1>{user.business}</h1>
            <div className="sub">Here's how your campaigns are performing today.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-line" onClick={() => navigate('/owner/applicants')}>Review applicants</button>
            <button className="btn-solid" onClick={() => navigate('/owner/campaigns')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              New campaign
            </button>
          </div>
        </div>

        <div className="stats">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <div className="ico">{s.svg}</div>
              <div className="lbl">{s.label}</div>
              <div className="val">{s.value}</div>
              <div className="delta">{s.delta}</div>
            </div>
          ))}
        </div>

        {pendingApps > 0 && (
          <div className="callout" onClick={() => navigate('/owner/applicants')}>
            <div className="ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/></svg>
            </div>
            <div className="body">
              <div className="t">{pendingApps} application{pendingApps !== 1 ? 's' : ''} waiting for your review</div>
              <div className="s">Accept the right creators to assign them to your campaigns.</div>
            </div>
            <span className="arrow">→</span>
          </div>
        )}

        <div className="sec-head">
          <h2>Recent campaigns</h2>
          <span className="link" onClick={() => navigate('/owner/campaigns')}>View all →</span>
        </div>

        {myCampaigns.length === 0 ? (
          <div className="empty">
            <p>No campaigns yet. Create your first to start receiving applications.</p>
            <button className="btn-solid" onClick={() => navigate('/owner/campaigns')}>Create a campaign</button>
          </div>
        ) : (
          <div className="row">
            {myCampaigns.slice(-4).reverse().map((c) => {
              const accApp = (c.applications || []).find((a) => a.influencerId === c.assignedInfluencer);
              const inf = (accApp && accApp.creator)
                || influencers.find((i) => i.id === c.assignedInfluencer);
              const apps = c.applications || [];
              const pendingCount = apps.filter((a) => a.status === 'pending').length;
              const statusClass = c.submittedPost ? 'submitted' : c.status === 'active' ? 'active' : 'open';
              const statusLabel = c.submittedPost ? 'Submitted' : c.status;
              return (
                <div key={c.id} className="camp" onClick={() => navigate(`/owner/applicants/${c.id}`)}
                  style={{ cursor: 'pointer' }}>
                  <div className="logo">{(c.brand || 'B').charAt(0)}</div>
                  <div className="info">
                    <div className="t">{c.title}</div>
                    <div className="meta">
                      <span className="code">{c.promoCode}</span>
                      <span>{apps.length} applicant{apps.length !== 1 ? 's' : ''}</span>
                      {pendingCount > 0 && <span className="pending">{pendingCount} pending</span>}
                      {inf && <span>Assigned · {inf.profile?.fullName}</span>}
                    </div>
                  </div>
                  <span className={'pill ' + statusClass}>{statusLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
