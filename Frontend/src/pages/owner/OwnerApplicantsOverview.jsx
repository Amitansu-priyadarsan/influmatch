import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OwnerLayout from '../../components/layouts/OwnerLayout';

const OV_CSS = `
.ob-ov .head{margin-bottom:26px}
.ob-ov .head h1{font-weight:600;font-size:clamp(28px,3vw,38px);line-height:1.1;letter-spacing:-.02em;margin:0;color:var(--fg)}
.ob-ov .head .sub{color:var(--fg-dim);font-size:14px;margin-top:6px}

.ob-ov .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:26px}
.ob-ov .summary .s{padding:18px 20px;border:1px solid var(--line);border-radius:12px;background:var(--bg-2)}
.ob-ov .summary .s .l{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:8px}
.ob-ov .summary .s .v{font-weight:600;font-size:28px;color:var(--fg);letter-spacing:-.02em;line-height:1}
.ob-ov .summary .s.pending .v{color:#ffb86b}
.ob-ov .summary .s.accepted .v{color:var(--accent)}

.ob-ov .row{display:flex;flex-direction:column;gap:10px}
.ob-ov .item{display:flex;align-items:center;gap:14px;padding:16px 18px;border:1px solid var(--line);border-radius:10px;background:var(--bg-2);transition:.15s;cursor:pointer}
.ob-ov .item:hover{border-color:var(--accent-border);background:var(--surface-hover)}
.ob-ov .item .logo{width:40px;height:40px;border-radius:9px;background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent-border);display:grid;place-items:center;font-weight:600;flex:none}
.ob-ov .item .info{flex:1;min-width:0}
.ob-ov .item .info .t{font-weight:600;font-size:14.5px;color:var(--fg);margin-bottom:3px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.ob-ov .item .info .meta{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-mute)}
.ob-ov .item .info .meta .code{color:var(--accent)}
.ob-ov .item .stack{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ob-ov .item .chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid var(--line-2);border-radius:999px;font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;color:var(--fg-dim)}
.ob-ov .item .chip.pending{color:#ffb86b;border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08)}
.ob-ov .item .chip.accepted{color:var(--accent);border-color:var(--accent-border);background:var(--accent-soft)}
.ob-ov .item .chip.rejected{color:var(--danger);border-color:var(--danger-border);background:var(--danger-soft)}
.ob-ov .item .arr{color:var(--fg-mute);transition:.15s}
.ob-ov .item:hover .arr{color:var(--accent);transform:translateX(2px)}
.ob-ov .item .pill{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:5px 10px;border:1px solid var(--line-2);border-radius:999px;color:var(--fg-dim)}

.ob-ov .empty{padding:80px 24px;border:1px dashed var(--line-2);border-radius:12px;text-align:center;background:var(--surface-faint)}
.ob-ov .empty p{color:var(--fg-dim);margin:0;font-size:14px}

@media (max-width:700px){
  .ob-ov .summary{grid-template-columns:1fr}
  .ob-ov .item{flex-wrap:wrap}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('ob-ov-styles')) {
  const tag = document.createElement('style');
  tag.id = 'ob-ov-styles';
  tag.textContent = OV_CSS;
  document.head.appendChild(tag);
}

export default function OwnerApplicantsOverview() {
  const { user, campaigns } = useAuth();
  const navigate = useNavigate();

  const myCampaigns = campaigns.filter((c) => c.ownerId === user.id);
  const totalApps = myCampaigns.reduce((s, c) => s + (c.applications || []).length, 0);
  const totalPending = myCampaigns.reduce(
    (s, c) => s + (c.applications || []).filter((a) => a.status === 'pending').length, 0
  );
  const totalAccepted = myCampaigns.reduce(
    (s, c) => s + (c.applications || []).filter((a) => a.status === 'accepted').length, 0
  );

  return (
    <OwnerLayout title="Applicants">
      <div className="ob-ov">
        <div className="head">
          <h1>Applicants</h1>
          <div className="sub">
            Review creators applying to your campaigns.
          </div>
        </div>

        <div className="summary">
          <div className="s"><div className="l">Total applications</div><div className="v">{totalApps}</div></div>
          <div className="s pending"><div className="l">Pending review</div><div className="v">{totalPending}</div></div>
          <div className="s accepted"><div className="l">Accepted</div><div className="v">{totalAccepted}</div></div>
        </div>

        {myCampaigns.length === 0 ? (
          <div className="empty">
            <p>No campaigns yet. Create one to start receiving applications.</p>
          </div>
        ) : (
          <div className="row">
            {myCampaigns.map((c) => {
              const apps = c.applications || [];
              const pending = apps.filter((a) => a.status === 'pending').length;
              const accepted = apps.filter((a) => a.status === 'accepted').length;
              const rejected = apps.filter((a) => a.status === 'rejected').length;

              return (
                <div key={c.id} className="item" onClick={() => navigate(`/owner/applicants/${c.id}`)}>
                  <div className="logo">{(c.brand || 'B').charAt(0)}</div>
                  <div className="info">
                    <div className="t">
                      {c.title}
                      <span className="pill">{c.submittedPost ? 'Submitted' : c.status}</span>
                    </div>
                    <div className="meta">
                      <span className="code">{c.promoCode}</span> · {c.startDate} → {c.endDate}
                    </div>
                  </div>

                  <div className="stack">
                    {pending > 0 && (
                      <span className="chip pending">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                        {pending}
                      </span>
                    )}
                    {accepted > 0 && (
                      <span className="chip accepted">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                        {accepted}
                      </span>
                    )}
                    {rejected > 0 && (
                      <span className="chip rejected">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                        {rejected}
                      </span>
                    )}
                    {apps.length === 0 && (
                      <span className="chip" style={{ fontStyle: 'italic' }}>No applications</span>
                    )}
                  </div>

                  <span className="arr">→</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
