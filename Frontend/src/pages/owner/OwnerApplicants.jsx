import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/layouts/OwnerLayout';

const APP_CSS = `
.ob-apps .back{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);cursor:pointer;margin-bottom:18px;transition:.15s}
.ob-apps .back:hover{color:var(--accent)}

.ob-apps .head h1{font-weight:600;font-size:clamp(26px,3vw,34px);line-height:1.15;letter-spacing:-.02em;margin:0 0 6px;color:var(--fg)}
.ob-apps .head .meta{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-dim)}
.ob-apps .head .meta .code{color:var(--accent)}

.ob-apps .assigned-banner{margin:14px 0 22px;padding:14px 16px;border:1px solid var(--accent-border);background:var(--accent-soft);border-radius:11px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.ob-apps .assigned-banner .av{width:38px;height:38px;border-radius:10px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:600}
.ob-apps .assigned-banner .who{flex:1;min-width:0}
.ob-apps .assigned-banner .who b{display:block;color:var(--fg);font-weight:600;font-size:14px}
.ob-apps .assigned-banner .who span{display:block;font-family:var(--mono);font-size:11px;color:var(--fg-dim);margin-top:2px}

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

/* Summary card per applicant */
.ob-apps .row{display:flex;gap:14px;align-items:center;padding:16px 18px;border:1px solid var(--line);border-radius:12px;background:var(--bg-2);transition:.15s}
.ob-apps .row:hover{border-color:var(--accent-border);background:var(--surface-hover)}
.ob-apps .row .av{width:46px;height:46px;border-radius:10px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:600;font-size:16px;flex:none}
.ob-apps .row .body{flex:1;min-width:0}
.ob-apps .row .body .top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:5px}
.ob-apps .row .body .top h3{font-weight:600;font-size:15px;color:var(--fg);margin:0}
.ob-apps .row .body .pill{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:4px 9px;border-radius:999px;border:1px solid var(--line-2);color:var(--fg-dim)}
.ob-apps .row .body .pill.pending{color:#ffb86b;border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08)}
.ob-apps .row .body .pill.accepted{color:var(--accent);border-color:var(--accent-border);background:var(--accent-soft)}
.ob-apps .row .body .pill.rejected{color:var(--danger);border-color:var(--danger-border);background:var(--danger-soft)}
.ob-apps .row .body .info{display:flex;flex-wrap:wrap;gap:12px;font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--fg-dim);margin-bottom:6px}
.ob-apps .row .body .info span{display:inline-flex;align-items:center;gap:5px}
.ob-apps .row .body .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.ob-apps .row .body .chip{font-family:var(--mono);font-size:10px;letter-spacing:.06em;padding:4px 9px;border-radius:999px;border:1px solid var(--line-2);color:var(--fg-dim);background:var(--surface-faint);display:inline-flex;align-items:center;gap:5px}
.ob-apps .row .body .chip.msg{color:var(--accent);border-color:var(--accent-border);background:var(--accent-soft)}
.ob-apps .row .body .chip.offer{color:#ffb86b;border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08)}
.ob-apps .row .review-btn{flex:none;padding:10px 16px;border-radius:8px;border:1px solid var(--accent-border);background:var(--accent-soft);color:var(--accent);font-weight:600;font-size:13px;cursor:pointer;transition:.15s;white-space:nowrap}
.ob-apps .row .review-btn:hover{background:var(--accent);color:var(--accent-ink)}

.ob-apps .empty{padding:80px 24px;border:1px dashed var(--line-2);border-radius:12px;text-align:center;background:var(--surface-faint)}
.ob-apps .empty p{color:var(--fg-dim);margin:0;font-size:14px}

@media (max-width:768px){
  .ob-apps .stats{grid-template-columns:1fr}
  .ob-apps .row{flex-wrap:wrap}
  .ob-apps .row .review-btn{flex:1;width:100%}
}

/* Review modal */
.ob-modal.wide{max-width:680px}
.ob-modal .profile-head{display:flex;align-items:center;gap:14px;padding:14px;border:1px solid var(--accent-border);background:var(--accent-soft);border-radius:11px;margin-bottom:14px}
.ob-modal .profile-head .av{width:54px;height:54px;border-radius:12px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:600;font-size:20px;flex:none}
.ob-modal .profile-head h4{font-weight:600;font-size:18px;margin:0;color:var(--fg)}
.ob-modal .profile-head .h{font-family:var(--mono);font-size:11px;color:var(--fg-dim);margin-top:3px}
.ob-modal .profile-head .meta-row{display:flex;gap:12px;margin-top:8px;font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--fg-dim);flex-wrap:wrap}

.ob-modal .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.ob-modal .info-cell{padding:11px 13px;border:1px solid var(--line);border-radius:9px;background:var(--surface-faint)}
.ob-modal .info-cell.full{grid-column:1 / -1}
.ob-modal .info-cell .l{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:4px}
.ob-modal .info-cell .v{font-size:13px;color:var(--fg);line-height:1.55}

.ob-modal .pitch-box{padding:13px;border:1px solid var(--line);border-radius:10px;margin-bottom:12px;background:var(--surface-faint)}
.ob-modal .pitch-box .l{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:5px}
.ob-modal .pitch-box .v{font-size:13.5px;color:var(--fg);line-height:1.55}
.ob-modal .pitch-box.offer{border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.06)}
.ob-modal .pitch-box.offer .l{color:#ffb86b}
.ob-modal .pitch-box.offer .price{font-weight:700;color:var(--fg);font-size:16px;margin-bottom:4px}

.ob-modal .thread-section{margin-top:6px;padding-top:14px;border-top:1px solid var(--line)}
.ob-modal .thread-section .title{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:10px;display:flex;justify-content:space-between;align-items:center}
.ob-modal .thread{display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto;padding:4px 2px;margin-bottom:10px}
.ob-modal .thread .empty-thread{font-size:13px;color:var(--fg-mute);text-align:center;padding:18px 0;font-style:italic}
.ob-modal .bubble{padding:9px 12px;border-radius:10px;max-width:78%;border:1px solid var(--line);background:var(--surface-faint);align-self:flex-start}
.ob-modal .bubble.mine{align-self:flex-end;background:var(--accent-soft);border-color:var(--accent-border)}
.ob-modal .bubble .who{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:3px}
.ob-modal .bubble.mine .who{color:var(--accent)}
.ob-modal .bubble .body{font-size:13.2px;color:var(--fg);line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
.ob-modal .bubble .at{font-family:var(--mono);font-size:9.5px;letter-spacing:.04em;color:var(--fg-mute);margin-top:3px}

.ob-modal .reply{display:flex;gap:8px;align-items:flex-end}
.ob-modal .reply textarea{flex:1;border-radius:8px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:10px 12px;font-family:var(--sans);font-size:13.5px;resize:vertical;min-height:42px;outline:none}
.ob-modal .reply textarea:focus{border-color:var(--accent);background:var(--accent-soft)}

.ob-modal .confirm-banner{padding:18px;border-radius:11px;text-align:center;margin-bottom:18px;border:1px solid}
.ob-modal .confirm-banner.acc{background:var(--accent-soft);border-color:var(--accent-border)}
.ob-modal .confirm-banner.rej{background:var(--danger-soft);border-color:var(--danger-border)}
.ob-modal .confirm-banner .ic{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;margin:0 auto 10px}
.ob-modal .confirm-banner.acc .ic{background:var(--accent);color:var(--accent-ink)}
.ob-modal .confirm-banner.rej .ic{background:var(--danger);color:#fff}
.ob-modal .confirm-banner h4{font-weight:600;font-size:16px;margin:0 0 5px;color:var(--fg)}
.ob-modal .confirm-banner p{font-size:13px;color:var(--fg-dim);margin:0;line-height:1.5}

.ob-modal .alert{padding:10px 12px;border:1px solid var(--line-2);border-radius:8px;background:var(--surface-faint);font-size:12.5px;color:var(--fg-dim);margin-bottom:12px;line-height:1.5}
.ob-modal .alert.warn{border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08);color:#ffb86b}
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

function Stars({ score, count }) {
  if (score == null) {
    return <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '.06em' }}>No ratings</span>;
  }
  const full = Math.round(score);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--accent)' }}>
      <span aria-hidden>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
      <span style={{ color: 'var(--fg-dim)' }}>{score.toFixed(2)} · {count || 0}</span>
    </span>
  );
}

export default function OwnerApplicants() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const {
    campaigns, influencers,
    unassignInfluencer, submitRating,
  } = useAuth();

  const [filter, setFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState('');

  // Unassign modal
  const [confirmUnassign, setConfirmUnassign] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  // Rate creator modal
  const [rateOpen, setRateOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');

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
  const getInf = (id, app) =>
    (app && app.creator) || influencers.find((i) => i.id === id) || null;

  const hasAssigned = !!campaign.assignedInfluencer;
  const acceptedApp = applications.find((a) => a.influencerId === campaign.assignedInfluencer);
  const assignedInf = acceptedApp ? getInf(campaign.assignedInfluencer, acceptedApp) : null;
  const canRate = ['submitted', 'closed'].includes(campaign.status) && hasAssigned;

  const openReview = (app) => {
    navigate(`/owner/applicants/${campaignId}/${app.influencerId}`);
  };

  const handleUnassign = async () => {
    setUnassigning(true);
    try {
      await unassignInfluencer(campaignId);
      setConfirmUnassign(false);
    } catch (err) {
      setErrorMsg(err.message || 'Could not unassign');
    } finally {
      setUnassigning(false);
    }
  };

  const handleSubmitRating = async () => {
    setRatingSubmitting(true);
    setRatingError('');
    try {
      await submitRating({ campaignId, score: ratingScore, comment: ratingComment });
      setRateOpen(false);
      setRatingComment('');
      setRatingScore(5);
    } catch (err) {
      setRatingError(err.message || 'Could not submit rating');
    } finally {
      setRatingSubmitting(false);
    }
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

        {/* Assigned creator banner with Unassign / Rate */}
        {hasAssigned && assignedInf && (
          <div className="assigned-banner">
            <div className="av">{assignedInf.profile?.fullName?.charAt(0) || 'C'}</div>
            <div className="who">
              <b>Assigned · {assignedInf.profile?.fullName || 'Creator'}</b>
              <span>@{assignedInf.profile?.instagram} · {assignedInf.profile?.followers} · {assignedInf.profile?.niche}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {canRate && <button className="btn-solid" onClick={() => setRateOpen(true)}>Rate creator ★</button>}
              {campaign.status !== 'submitted' && campaign.status !== 'closed' && (
                <button className="btn-line" onClick={() => setConfirmUnassign(true)}>Unassign</button>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{
            marginBottom: 16, padding: '10px 14px',
            border: '1px solid var(--danger-border)', background: 'var(--danger-soft)',
            color: 'var(--danger)', borderRadius: 10, fontSize: 13,
          }}>
            {errorMsg}
          </div>
        )}

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
                const msgs = (app.comments || []).length;
                return (
                  <div key={app.influencerId} className="row">
                    <div className="av">{inf.profile?.fullName?.charAt(0) || 'C'}</div>
                    <div className="body">
                      <div className="top">
                        <h3>{inf.profile?.fullName}</h3>
                        <span className={'pill ' + st.cls}>{st.label}</span>
                        {inf.rating && <Stars score={inf.rating.score} count={inf.rating.count} />}
                      </div>
                      <div className="info">
                        <span>@{inf.profile?.instagram}</span>
                        <span>·</span>
                        <span>{inf.profile?.followers} followers</span>
                        <span>·</span>
                        <span>{inf.profile?.niche}</span>
                        {inf.profile?.city && <><span>·</span><span>{inf.profile.city}</span></>}
                      </div>
                      <div className="chips">
                        {app.message && <span className="chip">Pitch attached</span>}
                        {app.proposedPrice && (
                          <span className="chip offer">
                            Counter-offer · ₹{Number(app.proposedPrice).toLocaleString()}
                          </span>
                        )}
                        {msgs > 0 && (
                          <span className="chip msg">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                            {msgs} message{msgs !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="chip">Applied {app.appliedAt}</span>
                      </div>
                    </div>
                    <button className="review-btn" onClick={() => openReview(app)}>
                      Review →
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ===================== UNASSIGN CONFIRM ===================== */}
      {confirmUnassign && (
        <div className="ob-modal-back" onClick={() => setConfirmUnassign(false)}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <button className="x" onClick={() => setConfirmUnassign(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
            <div className="m-kick">Free up this campaign</div>
            <h3>Unassign creator?</h3>
            <p className="m-sub">
              The campaign will go back to <b>open</b> and every applicant will be reset to <b>pending</b>, so you can pick again.
            </p>
            <div className="m-actions">
              <button className="btn-line" onClick={() => setConfirmUnassign(false)} disabled={unassigning}>Cancel</button>
              <button className="btn-danger" onClick={handleUnassign} disabled={unassigning}>
                {unassigning ? 'Saving…' : 'Confirm unassign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== RATE CREATOR ===================== */}
      {rateOpen && (
        <div className="ob-modal-back" onClick={() => setRateOpen(false)}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <button className="x" onClick={() => setRateOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
            <div className="m-kick">After-deal feedback</div>
            <h3>Rate this creator</h3>
            <p className="m-sub">Your rating affects their visibility on the marketplace.</p>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatingScore(n)}
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    border: '1px solid ' + (ratingScore >= n ? 'var(--accent)' : 'var(--line-2)'),
                    background: ratingScore >= n ? 'var(--accent-soft)' : 'var(--surface-1)',
                    color: ratingScore >= n ? 'var(--accent)' : 'var(--fg-mute)',
                    fontSize: 22, lineHeight: 1, cursor: 'pointer',
                  }}
                >★</button>
              ))}
            </div>

            <div className="fld">
              <label>Comment <span style={{ color: 'var(--fg-mute)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· optional</span></label>
              <textarea placeholder="Delivered on time, content was on-brand, would work with again."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)} />
            </div>

            {ratingError && <div className="err" style={{ marginBottom: 8 }}>{ratingError}</div>}

            <div className="m-actions">
              <button className="btn-line" onClick={() => setRateOpen(false)}>Cancel</button>
              <button className="btn-solid" onClick={handleSubmitRating} disabled={ratingSubmitting}>
                {ratingSubmitting ? 'Saving…' : 'Submit rating →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
