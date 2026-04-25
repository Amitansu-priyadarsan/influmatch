import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/layouts/OwnerLayout';

const APP_CSS = `
.ob-apps .back{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);cursor:pointer;margin-bottom:18px;transition:.15s}
.ob-apps .back:hover{color:var(--accent)}

.ob-apps .head{margin-bottom:24px}
.ob-apps .head h1{font-weight:600;font-size:clamp(26px,3vw,34px);line-height:1.15;letter-spacing:-.02em;margin:0 0 6px;color:var(--fg)}
.ob-apps .head .meta{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-dim)}
.ob-apps .head .meta .code{color:var(--accent)}

.ob-apps .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.ob-apps .stats .s{padding:16px 18px;border:1px solid var(--line);border-radius:11px;background:var(--bg-2);display:flex;align-items:center;gap:12px}
.ob-apps .stats .s .ico{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;flex:none}
.ob-apps .stats .s.p .ico{background:rgba(255,184,107,.12);color:#ffb86b;border:1px solid rgba(255,184,107,.4)}
.ob-apps .stats .s.a .ico{background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent-border)}
.ob-apps .stats .s.r .ico{background:var(--danger-soft);color:var(--danger);border:1px solid var(--danger-border)}
.ob-apps .stats .s .v{font-weight:600;font-size:22px;line-height:1;color:var(--fg)}
.ob-apps .stats .s .l{font-size:12px;color:var(--fg-dim);margin-top:4px}

.ob-apps .filters{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}
.ob-apps .filter{padding:7px 14px;border-radius:8px;border:1px solid var(--line-2);background:var(--surface-1);font-size:12.5px;color:var(--fg-dim);cursor:pointer;transition:.15s;font-weight:500}
.ob-apps .filter:hover{color:var(--fg)}
.ob-apps .filter.active{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.ob-apps .filter b{margin-left:6px}

.ob-apps .list{display:flex;flex-direction:column;gap:10px}
.ob-apps .row{display:flex;gap:14px;align-items:flex-start;padding:18px 20px;border:1px solid var(--line);border-radius:12px;background:var(--bg-2);transition:.15s}
.ob-apps .row:hover{border-color:var(--line-2)}
.ob-apps .row .av{width:46px;height:46px;border-radius:10px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:600;font-size:16px;flex:none}
.ob-apps .row .body{flex:1;min-width:0}
.ob-apps .row .body .top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}
.ob-apps .row .body .top h3{font-weight:600;font-size:15.5px;color:var(--fg);margin:0}
.ob-apps .row .body .pill{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:4px 9px;border-radius:999px;border:1px solid var(--line-2);color:var(--fg-dim)}
.ob-apps .row .body .pill.pending{color:#ffb86b;border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08)}
.ob-apps .row .body .pill.accepted{color:var(--accent);border-color:var(--accent-border);background:var(--accent-soft)}
.ob-apps .row .body .pill.rejected{color:var(--danger);border-color:var(--danger-border);background:var(--danger-soft)}
.ob-apps .row .body .info{display:flex;flex-wrap:wrap;gap:14px;font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--fg-dim);margin-bottom:10px}
.ob-apps .row .body .info span{display:inline-flex;align-items:center;gap:5px}
.ob-apps .row .body .info svg{color:var(--fg-mute)}
.ob-apps .row .body .pitch{padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--surface-faint);font-size:13px;color:var(--fg-dim);line-height:1.55;margin-bottom:8px}
.ob-apps .row .body .pitch .l{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:5px;display:flex;align-items:center;gap:6px}
.ob-apps .row .body .applied-at{font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;color:var(--fg-mute)}
.ob-apps .row .actions{display:flex;flex-direction:column;gap:6px;flex:none}
.ob-apps .row .actions .btn{justify-content:center;width:140px}

.ob-apps .empty{padding:80px 24px;border:1px dashed var(--line-2);border-radius:12px;text-align:center;background:var(--surface-faint)}
.ob-apps .empty p{color:var(--fg-dim);margin:0;font-size:14px}

@media (max-width:768px){
  .ob-apps .stats{grid-template-columns:1fr}
  .ob-apps .row{flex-wrap:wrap}
  .ob-apps .row .actions{flex-direction:row;width:100%}
  .ob-apps .row .actions .btn{flex:1;width:auto}
}

/* Profile modal */
.ob-modal .profile-head{display:flex;align-items:center;gap:14px;padding:14px;border:1px solid var(--accent-border);background:var(--accent-soft);border-radius:11px;margin-bottom:18px}
.ob-modal .profile-head .av{width:54px;height:54px;border-radius:12px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:600;font-size:20px;flex:none}
.ob-modal .profile-head h4{font-weight:600;font-size:18px;margin:0;color:var(--fg)}
.ob-modal .profile-head .h{font-family:var(--mono);font-size:11px;color:var(--fg-dim);margin-top:3px}
.ob-modal .profile-head .stats{display:flex;gap:14px;margin-top:6px;font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--fg-dim)}
.ob-modal .profile-head .stats b{color:var(--accent);font-weight:600}
.ob-modal .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.ob-modal .info-cell{padding:12px 14px;border:1px solid var(--line);border-radius:9px;background:var(--surface-faint)}
.ob-modal .info-cell.full{grid-column:1 / -1}
.ob-modal .info-cell .l{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:5px;display:flex;align-items:center;gap:5px}
.ob-modal .info-cell .v{font-size:13.5px;color:var(--fg);line-height:1.55}
.ob-modal .pitch-box{padding:14px;border:1px solid var(--accent-border);background:var(--accent-soft);border-radius:11px;margin-bottom:14px}
.ob-modal .pitch-box .l{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
.ob-modal .pitch-box .v{font-size:13.5px;color:var(--fg);line-height:1.55;font-style:italic}

/* Confirm */
.ob-modal .confirm-banner{padding:18px;border-radius:11px;text-align:center;margin-bottom:18px;border:1px solid}
.ob-modal .confirm-banner.acc{background:var(--accent-soft);border-color:var(--accent-border)}
.ob-modal .confirm-banner.rej{background:var(--danger-soft);border-color:var(--danger-border)}
.ob-modal .confirm-banner .ic{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;margin:0 auto 10px}
.ob-modal .confirm-banner.acc .ic{background:var(--accent);color:var(--accent-ink)}
.ob-modal .confirm-banner.rej .ic{background:var(--danger);color:#fff}
.ob-modal .confirm-banner h4{font-weight:600;font-size:16px;margin:0 0 5px;color:var(--fg)}
.ob-modal .confirm-banner p{font-size:13px;color:var(--fg-dim);margin:0;line-height:1.5}
`;

if (typeof document !== 'undefined' && !document.getElementById('ob-apps-styles')) {
  const tag = document.createElement('style');
  tag.id = 'ob-apps-styles';
  tag.textContent = APP_CSS;
  document.head.appendChild(tag);
}

const STATUS = {
  pending: { label: 'Pending', cls: 'pending' },
  accepted: { label: 'Accepted', cls: 'accepted' },
  rejected: { label: 'Rejected', cls: 'rejected' },
};

export default function OwnerApplicants() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { campaigns, influencers, acceptApplication, rejectApplication } = useAuth();
  const [profileOpen, setProfileOpen] = useState(null);
  const [confirmAccept, setConfirmAccept] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);
  const [filter, setFilter] = useState('all');

  const campaign = campaigns.find((c) => c.id === campaignId);

  if (!campaign) {
    return (
      <OwnerLayout title="Applicants">
        <div className="ob-apps">
          <div onClick={() => navigate('/owner/campaigns')} className="back">← Back to Campaigns</div>
          <div className="empty"><p>Campaign not found.</p></div>
        </div>
      </OwnerLayout>
    );
  }

  const applications = campaign.applications || [];
  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const filtered = applications.filter((a) => filter === 'all' || a.status === filter);
  // Prefer the inlined creator snapshot from the API; fall back to the
  // influencers list (used when the assigned creator was direct-assigned
  // and has no application row).
  const getInf = (id, app) =>
    (app && app.creator) || influencers.find((i) => i.id === id) || null;

  const handleAccept = async (id) => {
    try { await acceptApplication(campaignId, id); }
    finally { setConfirmAccept(null); setProfileOpen(null); }
  };
  const handleReject = async (id) => {
    try { await rejectApplication(campaignId, id); }
    finally { setConfirmReject(null); setProfileOpen(null); }
  };

  return (
    <OwnerLayout title={campaign.title}>
      <div className="ob-apps">
        <div onClick={() => navigate('/owner/campaigns')} className="back">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to campaigns
        </div>

        <div className="head">
          <h1>{campaign.title}</h1>
          <div className="meta">
            {campaign.brand} · <span className="code">{campaign.promoCode}</span> · {campaign.startDate} → {campaign.endDate}
          </div>
        </div>

        <div className="stats">
          <div className="s p">
            <div className="ico">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            </div>
            <div><div className="v">{counts.pending}</div><div className="l">Pending review</div></div>
          </div>
          <div className="s a">
            <div className="ico">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
            </div>
            <div><div className="v">{counts.accepted}</div><div className="l">Accepted</div></div>
          </div>
          <div className="s r">
            <div className="ico">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </div>
            <div><div className="v">{counts.rejected}</div><div className="l">Rejected</div></div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="empty">
            <p>No applications yet. Creators will start applying once they discover this campaign.</p>
          </div>
        ) : (
          <>
            <div className="filters">
              {['all', 'pending', 'accepted', 'rejected'].map((k) => (
                <button key={k} className={'filter' + (filter === k ? ' active' : '')} onClick={() => setFilter(k)}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}<b>{counts[k]}</b>
                </button>
              ))}
            </div>

            <div className="list">
              {filtered.length === 0 ? (
                <div className="empty"><p>No applications match this filter.</p></div>
              ) : filtered.map((app) => {
                const inf = getInf(app.influencerId, app);
                if (!inf) return null;
                const st = STATUS[app.status];
                return (
                  <div key={app.influencerId} className="row">
                    <div className="av">{inf.profile?.fullName?.charAt(0) || 'I'}</div>
                    <div className="body">
                      <div className="top">
                        <h3>{inf.profile?.fullName}</h3>
                        <span className={'pill ' + st.cls}>{st.label}</span>
                      </div>
                      <div className="info">
                        <span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
                          @{inf.profile?.instagram}
                        </span>
                        <span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                          {inf.profile?.followers}
                        </span>
                        <span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                          {inf.profile?.niche}
                        </span>
                        {inf.profile?.city && (
                          <span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {inf.profile.city}
                          </span>
                        )}
                      </div>
                      {app.message && (
                        <div className="pitch">
                          <div className="l">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                            Pitch
                          </div>
                          "{app.message}"
                        </div>
                      )}
                      <div className="applied-at">Applied {app.appliedAt}</div>
                    </div>
                    <div className="actions">
                      <button className="btn-line btn-sm" onClick={() => setProfileOpen(inf)}>
                        View profile
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button className="btn-success btn-sm" onClick={() => setConfirmAccept(inf)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                            Accept
                          </button>
                          <button className="btn-danger btn-sm" onClick={() => setConfirmReject(inf)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Profile Modal */}
      {profileOpen && (() => {
        const inf = profileOpen;
        const app = applications.find((a) => a.influencerId === inf.id);
        return (
          <div className="ob-modal-back" onClick={() => setProfileOpen(null)}>
            <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
              <button className="x" onClick={() => setProfileOpen(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
              <div className="m-kick">Creator profile</div>
              <h3>Review application</h3>
              <p className="m-sub">Full details for this creator and their pitch.</p>

              <div className="profile-head">
                <div className="av">{inf.profile?.fullName?.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4>{inf.profile?.fullName}</h4>
                  <div className="h">@{inf.profile?.instagram}</div>
                  <div className="stats">
                    <span><b>{inf.profile?.followers}</b> followers</span>
                    <span>·</span>
                    <span>{inf.profile?.niche}</span>
                  </div>
                </div>
              </div>

              <div className="grid2">
                <div className="info-cell">
                  <div className="l">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Location
                  </div>
                  <div className="v">{inf.profile?.city || '—'}</div>
                </div>
                <div className="info-cell">
                  <div className="l">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Niche
                  </div>
                  <div className="v">{inf.profile?.niche || '—'}</div>
                </div>
                {inf.profile?.bio && (
                  <div className="info-cell full">
                    <div className="l">Bio</div>
                    <div className="v">{inf.profile.bio}</div>
                  </div>
                )}
              </div>

              {app?.message && (
                <div className="pitch-box">
                  <div className="l">Their pitch for this campaign</div>
                  <div className="v">"{app.message}"</div>
                </div>
              )}

              {app?.status === 'pending' && (
                <div className="m-actions">
                  <button className="btn-danger" onClick={() => { setProfileOpen(null); setConfirmReject(inf); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                    Reject
                  </button>
                  <button className="btn-success" onClick={() => { setProfileOpen(null); setConfirmAccept(inf); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    Accept & assign
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Confirm Accept */}
      {confirmAccept && (
        <div className="ob-modal-back" onClick={() => setConfirmAccept(null)}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <button className="x" onClick={() => setConfirmAccept(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
            <div className="m-kick">Confirm</div>
            <h3>Accept application?</h3>
            <p className="m-sub">This will assign them to the campaign and reject other pending applications.</p>

            <div className="confirm-banner acc">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
              </div>
              <h4>{confirmAccept.profile?.fullName}</h4>
              <p>@{confirmAccept.profile?.instagram} · {confirmAccept.profile?.followers} followers</p>
            </div>

            <div className="m-actions">
              <button className="btn-line" onClick={() => setConfirmAccept(null)}>Cancel</button>
              <button className="btn-success" onClick={() => handleAccept(confirmAccept.id)}>Confirm accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reject */}
      {confirmReject && (
        <div className="ob-modal-back" onClick={() => setConfirmReject(null)}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <button className="x" onClick={() => setConfirmReject(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
            <div className="m-kick">Confirm</div>
            <h3>Reject application?</h3>
            <p className="m-sub">This creator will be notified that they were not selected.</p>

            <div className="confirm-banner rej">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </div>
              <h4>{confirmReject.profile?.fullName}</h4>
              <p>@{confirmReject.profile?.instagram} · {confirmReject.profile?.followers} followers</p>
            </div>

            <div className="m-actions">
              <button className="btn-line" onClick={() => setConfirmReject(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleReject(confirmReject.id)}>Confirm reject</button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
