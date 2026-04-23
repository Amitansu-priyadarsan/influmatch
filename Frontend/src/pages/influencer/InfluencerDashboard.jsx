import { useAuth } from '../../context/AuthContext';
import InfluencerLayout from '../../components/layouts/InfluencerLayout';
import { useNavigate } from 'react-router-dom';

const DASH_CSS = `
.im-dash .hello{display:flex;align-items:flex-end;justify-content:space-between;gap:32px;margin-bottom:44px;flex-wrap:wrap}
.im-dash .kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:14px}
.im-dash .kicker .n{color:var(--accent)}
.im-dash h1.greet{font-family:var(--serif);font-weight:400;font-size:clamp(44px,5vw,68px);line-height:1;letter-spacing:-.02em;margin:0}
.im-dash h1.greet em{font-style:italic;color:var(--fg-dim)}
.im-dash .who-line{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim);margin-top:14px}
.im-dash .who-line span{color:var(--fg-mute);margin:0 8px}

.im-dash .cta-row{display:flex;gap:10px;flex-wrap:wrap}
.im-dash .btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;font-size:13px;font-weight:500;border:1px solid transparent;cursor:pointer;transition:.15s;white-space:nowrap}
.im-dash .btn-line{border-color:var(--line-2);color:var(--fg);background:var(--surface-1)}
.im-dash .btn-line:hover{background:var(--surface-1-hover)}
.im-dash .btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:500}
.im-dash .btn-solid:hover{filter:brightness(1.08)}

.im-dash .stats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--bg-2);margin-bottom:32px}
.im-dash .stat{padding:24px 22px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:10px;min-height:140px;position:relative}
.im-dash .stat:last-child{border-right:0}
.im-dash .stat .lbl{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute)}
.im-dash .stat .val{font-family:var(--serif);font-size:48px;line-height:1;color:var(--fg);letter-spacing:-.02em}
.im-dash .stat .delta{font-family:var(--mono);font-size:10px;letter-spacing:.12em;color:var(--fg-dim);margin-top:auto}
.im-dash .stat .delta.up{color:var(--accent)}

.im-dash .callout{display:flex;align-items:center;gap:18px;padding:20px 22px;border:1px solid var(--accent-border);background:linear-gradient(90deg,var(--accent-soft),rgba(212,244,52,0.02));border-radius:14px;margin-bottom:32px;cursor:pointer;transition:.15s}
.im-dash .callout:hover{transform:translateY(-1px);box-shadow:0 14px 36px -20px rgba(212,244,52,.3)}
.im-dash .callout .ico{width:38px;height:38px;border-radius:10px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;flex:none}
.im-dash .callout .ico svg{width:18px;height:18px}
.im-dash .callout .body{flex:1;min-width:0}
.im-dash .callout .t{font-size:15px;font-weight:500;color:var(--fg)}
.im-dash .callout .s{font-size:13px;color:var(--fg-dim);margin-top:3px}
.im-dash .callout .arrow{font-family:var(--mono);color:var(--accent)}

.im-dash .profile{display:grid;grid-template-columns:auto 1fr auto;gap:22px;align-items:center;padding:22px 24px;border:1px solid var(--line);border-radius:14px;background:var(--bg-2);margin-bottom:44px}
.im-dash .profile .av{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--avatar-from),var(--avatar-to));border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:24px;color:var(--fg-dim)}
.im-dash .profile .info h3{font-family:var(--serif);font-weight:400;font-size:22px;letter-spacing:-.01em;margin:0;line-height:1.1}
.im-dash .profile .info .handle{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--fg-dim);margin-top:6px}
.im-dash .profile .info .bio{font-size:13.5px;color:var(--fg-dim);line-height:1.5;margin-top:10px;max-width:520px}
.im-dash .profile .followers{text-align:right;padding-left:22px;border-left:1px solid var(--line)}
.im-dash .profile .followers .lbl{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute)}
.im-dash .profile .followers .val{font-family:var(--serif);font-size:30px;color:var(--accent);line-height:1;margin-top:6px;font-style:italic}

.im-dash .sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin:12px 0 20px}
.im-dash .sec-head h2{font-family:var(--serif);font-weight:400;font-size:32px;letter-spacing:-.015em;margin:0;line-height:1.05}
.im-dash .sec-head h2 em{font-style:italic;color:var(--fg-dim)}
.im-dash .sec-head .link{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-dim);cursor:pointer}
.im-dash .sec-head .link:hover{color:var(--accent)}

.im-dash .camps{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.im-dash .camp{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:22px;position:relative;transition:.2s;display:flex;flex-direction:column;min-height:210px}
.im-dash .camp:hover{border-color:var(--line-2);background:var(--surface-hover);transform:translateY(-2px)}
.im-dash .camp .row1{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.im-dash .camp .logo{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--logo-from),var(--logo-to));border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);color:var(--fg-dim);font-size:16px}
.im-dash .camp .status{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;display:flex;gap:6px;align-items:center;color:var(--fg-dim)}
.im-dash .camp .status .d{width:5px;height:5px;border-radius:50%;background:var(--fg-mute)}
.im-dash .camp .status.active{color:var(--accent)}
.im-dash .camp .status.active .d{background:var(--accent)}
.im-dash .camp h4{font-family:var(--serif);font-weight:400;font-size:22px;line-height:1.1;letter-spacing:-.01em;margin:0 0 6px}
.im-dash .camp .brand-name{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute)}
.im-dash .camp .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;padding-top:14px;border-top:1px solid var(--line)}
.im-dash .camp .foot .lbl{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}
.im-dash .camp .foot .val{font-family:var(--mono);font-size:11.5px;color:var(--fg);margin-top:4px}
.im-dash .camp .foot .pill{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;border:1px solid var(--line-2);border-radius:999px;color:var(--fg-dim)}
.im-dash .camp .foot .pill.ok{color:var(--accent);border-color:var(--accent)}

.im-dash .empty{padding:60px 24px;border:1px dashed var(--line-2);border-radius:14px;text-align:center;background:var(--surface-faint)}
.im-dash .empty .g{font-family:var(--serif);font-style:italic;font-size:40px;color:var(--fg-mute);margin-bottom:12px;line-height:1}
.im-dash .empty p{color:var(--fg-dim);margin:0;font-size:14px}
.im-dash .empty .sub{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);margin-top:10px}

@media (max-width:1020px){
  .im-dash .stats{grid-template-columns:repeat(2,1fr)}
  .im-dash .stat:nth-child(2){border-right:0}
  .im-dash .stat:nth-child(1),.im-dash .stat:nth-child(2){border-bottom:1px solid var(--line)}
  .im-dash .camps{grid-template-columns:1fr}
  .im-dash .profile{grid-template-columns:auto 1fr;gap:16px}
  .im-dash .profile .followers{grid-column:1 / -1;text-align:left;padding-left:0;border-left:0;border-top:1px solid var(--line);padding-top:14px}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('im-dash-styles')) {
  const tag = document.createElement('style');
  tag.id = 'im-dash-styles';
  tag.textContent = DASH_CSS;
  document.head.appendChild(tag);
}

export default function InfluencerDashboard() {
  const { user, campaigns } = useAuth();
  const navigate = useNavigate();

  const myCampaigns = campaigns.filter((c) => c.assignedInfluencer === user.id);
  const activeCampaigns = myCampaigns.filter((c) => c.status === 'active');
  const submitted = myCampaigns.filter((c) => c.submittedPost);
  const myApplications = campaigns.filter((c) =>
    (c.applications || []).some((a) => a.influencerId === user.id)
  );
  const pendingApplications = myApplications.filter((c) =>
    (c.applications || []).some((a) => a.influencerId === user.id && a.status === 'pending')
  );
  const openCampaigns = campaigns.filter((c) => c.status === 'open');

  const name = user.profile?.fullName || 'Creator';
  const firstName = name.split(' ')[0];
  const initial = (user.profile?.fullName?.charAt(0) || 'C').toUpperCase();

  return (
    <InfluencerLayout title="Dashboard">
      <div className="im-dash">
        <div className="hello">
          <div>
            <h1 className="greet">Hey, <em>{firstName}.</em></h1>
            <div className="who-line">
              {user.profile?.instagram || 'no handle'}
              <span>·</span>
              {user.profile?.niche || 'no niche'}
              <span>·</span>
              {user.profile?.followers || '0'} followers
            </div>
          </div>
          <div className="cta-row">
            <button className="btn btn-line" onClick={() => navigate('/influencer/campaigns')}>My campaigns</button>
            <button className="btn btn-solid" onClick={() => navigate('/influencer/browse')}>Browse campaigns →</button>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="lbl">Assigned</div>
            <div className="val">{myCampaigns.length}</div>
            <div className="delta">Total campaigns</div>
          </div>
          <div className="stat">
            <div className="lbl">Active now</div>
            <div className="val">{activeCampaigns.length}</div>
            <div className={'delta' + (activeCampaigns.length > 0 ? ' up' : '')}>In progress</div>
          </div>
          <div className="stat">
            <div className="lbl">Applied</div>
            <div className="val">{myApplications.length}</div>
            <div className="delta">{pendingApplications.length} pending</div>
          </div>
          <div className="stat">
            <div className="lbl">Submitted</div>
            <div className="val">{submitted.length}</div>
            <div className={'delta' + (submitted.length > 0 ? ' up' : '')}>Awaiting approval</div>
          </div>
        </div>

        {openCampaigns.length > 0 && (
          <div className="callout" onClick={() => navigate('/influencer/browse')}>
            <div className="ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            </div>
            <div className="body">
              <div className="t">
                {openCampaigns.length} open campaign{openCampaigns.length !== 1 ? 's' : ''} waiting for creators like you
              </div>
              <div className="s">
                {pendingApplications.length > 0
                  ? `${pendingApplications.length} pending application${pendingApplications.length !== 1 ? 's' : ''} — brands are reviewing now.`
                  : 'Browse and apply to campaigns that match your niche.'}
              </div>
            </div>
            <span className="arrow">→</span>
          </div>
        )}

        <div className="profile">
          <div className="av">{initial}</div>
          <div className="info">
            <h3>{user.profile?.fullName || 'Your profile'}</h3>
            <div className="handle">
              {(user.profile?.instagram || user.email)}
              {user.profile?.city && <> · {user.profile.city}</>}
              {user.profile?.niche && <> · {user.profile.niche}</>}
            </div>
            {user.profile?.bio && <p className="bio">{user.profile.bio}</p>}
          </div>
          <div className="followers">
            <div className="lbl">Followers</div>
            <div className="val">{user.profile?.followers || '—'}</div>
          </div>
        </div>

        <div className="sec-head">
          <h2>Assigned <em>campaigns.</em></h2>
          <span className="link" onClick={() => navigate('/influencer/campaigns')}>View all →</span>
        </div>

        {myCampaigns.length === 0 ? (
          <div className="empty">
            <div className="g">nothing yet.</div>
            <p>No campaigns assigned to you.</p>
            <div className="sub">Brands will reach out once they review your pitches.</div>
          </div>
        ) : (
          <div className="camps">
            {myCampaigns.slice(-4).reverse().map((c) => (
              <div key={c.id} className="camp">
                <div className="row1">
                  <div className="logo">{(c.brand || 'B').charAt(0)}</div>
                  <div className={'status' + (c.status === 'active' ? ' active' : '')}>
                    <span className="d" /> {c.submittedPost ? 'Submitted' : c.status === 'active' ? 'Active' : c.status}
                  </div>
                </div>
                <h4>{c.title}</h4>
                <div className="brand-name">{c.brand} · {c.promoCode}</div>
                <div className="foot">
                  <div>
                    <div className="lbl">Window</div>
                    <div className="val">{c.startDate} → {c.endDate}</div>
                  </div>
                  <span className={'pill' + (c.submittedPost ? ' ok' : '')}>
                    {c.submittedPost ? 'Post submitted' : 'Action needed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InfluencerLayout>
  );
}
