import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/layouts/OwnerLayout';

/**
 * Brand-owner view of a single applicant.
 * Layout mirrors InfluencerConversation (chat left, context right).
 * Adds owner-only controls: Accept / Reject, with the "already-assigned" lock.
 */

const CSS = `
.ob-rev{display:grid;grid-template-columns:minmax(0,1.55fr) 340px;gap:18px;height:calc(100vh - 200px);min-height:540px}

.ob-rev .pane{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:14px;background:var(--bg-2);min-height:0;overflow:hidden}
.ob-rev .pane-head{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line);background:var(--surface-faint)}
.ob-rev .pane-head .av{width:42px;height:42px;border-radius:11px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:600;font-size:16px;flex:none}
.ob-rev .pane-head .who b{display:block;font-size:14.5px;font-weight:600;color:var(--fg);line-height:1.2}
.ob-rev .pane-head .who span{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-mute);margin-top:3px}
.ob-rev .pane-head .pill{margin-left:auto;font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;padding:5px 11px;border:1px solid var(--line-2);border-radius:999px;color:var(--fg-dim)}
.ob-rev .pane-head .pill.pending{color:#ffb86b;border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08)}
.ob-rev .pane-head .pill.accepted{color:var(--accent);border-color:var(--accent);background:var(--accent-soft)}
.ob-rev .pane-head .pill.rejected{color:var(--danger);border-color:var(--danger-border);background:var(--danger-soft)}

.ob-rev .stream{flex:1;min-height:0;overflow-y:auto;padding:22px 24px;display:flex;flex-direction:column;gap:14px}
.ob-rev .stream .day{font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);text-align:center;margin:8px 0}
.ob-rev .stream .empty{margin:auto;text-align:center;color:var(--fg-mute);max-width:340px}
.ob-rev .stream .empty p{font-size:13.5px;line-height:1.55;margin:0;color:var(--fg-dim)}

.ob-rev .bubble{max-width:72%;padding:10px 14px;border-radius:14px;border:1px solid var(--line);background:var(--surface-faint);align-self:flex-start;animation:ob-bubble-in .18s ease}
.ob-rev .bubble.mine{align-self:flex-end;background:var(--accent-soft);border-color:var(--accent-border)}
.ob-rev .bubble .who{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:4px}
.ob-rev .bubble.mine .who{color:var(--accent)}
.ob-rev .bubble .body{font-size:14px;color:var(--fg);line-height:1.55;white-space:pre-wrap;word-wrap:break-word}
.ob-rev .bubble .at{font-family:var(--mono);font-size:9.5px;letter-spacing:.04em;color:var(--fg-mute);margin-top:4px}
@keyframes ob-bubble-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}

.ob-rev .composer{padding:14px 18px;border-top:1px solid var(--line);background:var(--bg-2);display:flex;gap:10px;align-items:flex-end}
.ob-rev .composer textarea{flex:1;border-radius:12px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:11px 14px;font-family:var(--sans);font-size:14px;resize:none;min-height:46px;max-height:160px;outline:none;line-height:1.45;transition:.15s}
.ob-rev .composer textarea:focus{border-color:var(--accent);background:var(--accent-soft)}
.ob-rev .composer .send{height:46px;padding:0 22px;border-radius:10px;background:var(--accent);color:var(--accent-ink);border:0;font-weight:600;font-size:13.5px;cursor:pointer;display:flex;align-items:center;gap:8px;flex:none;transition:.15s}
.ob-rev .composer .send:hover:not(:disabled){filter:brightness(1.08)}
.ob-rev .composer .send:disabled{opacity:.5;cursor:not-allowed}
.ob-rev .composer-hint{font-family:var(--mono);font-size:10px;letter-spacing:.06em;color:var(--fg-mute);padding:0 18px 10px}
.ob-rev .composer-err{font-family:var(--mono);font-size:11px;color:var(--danger);padding:0 18px 8px}

/* Right column */
.ob-rev .ctx{display:flex;flex-direction:column;gap:14px;overflow-y:auto}
.ob-rev .ctx .card{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:18px}
.ob-rev .ctx .card h4{font-weight:600;font-size:16px;margin:0 0 4px;color:var(--fg);line-height:1.2}
.ob-rev .ctx .card .sub{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:12px}
.ob-rev .ctx .card p{font-size:13.5px;color:var(--fg-dim);line-height:1.55;margin:0 0 10px}
.ob-rev .ctx .card .row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid var(--line);font-family:var(--mono);font-size:11px}
.ob-rev .ctx .card .row .k{color:var(--fg-mute);text-transform:uppercase;letter-spacing:.1em}
.ob-rev .ctx .card .row .v{color:var(--fg);text-align:right}

.ob-rev .ctx .profile-block{display:flex;align-items:center;gap:14px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.ob-rev .ctx .profile-block .av{width:54px;height:54px;border-radius:13px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:600;font-size:20px;flex:none}
.ob-rev .ctx .profile-block .who b{display:block;font-weight:600;font-size:15px;color:var(--fg);line-height:1.2}
.ob-rev .ctx .profile-block .who .h{font-family:var(--mono);font-size:11px;color:var(--fg-mute);margin-top:3px}
.ob-rev .ctx .profile-block .who .stats{display:flex;gap:8px;margin-top:6px;font-family:var(--mono);font-size:10.5px;color:var(--fg-dim);flex-wrap:wrap;align-items:center}
.ob-rev .ctx .profile-block .who .stats b{color:var(--accent);font-weight:600}

.ob-rev .ctx .quote{padding:10px 12px;border:1px solid var(--accent-border);background:var(--accent-soft);border-radius:10px;font-size:13px;color:var(--fg);line-height:1.5;margin-bottom:10px}
.ob-rev .ctx .quote .l{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:5px;display:block}
.ob-rev .ctx .quote.offer{border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08)}
.ob-rev .ctx .quote.offer .l{color:#ffb86b}
.ob-rev .ctx .quote.offer .price{font-weight:700;color:var(--fg);font-size:16px;margin-bottom:4px}

.ob-rev .actions-card{position:sticky;bottom:0}
.ob-rev .actions-card .actions{display:flex;gap:8px}
.ob-rev .actions-card .actions .btn-success,.ob-rev .actions-card .actions .btn-danger{flex:1;justify-content:center}
.ob-rev .actions-card .alert{padding:10px 12px;border-radius:8px;font-size:12.5px;line-height:1.5;background:rgba(255,184,107,.08);border:1px solid rgba(255,184,107,.45);color:#ffb86b;margin-bottom:10px}
.ob-rev .actions-card .alert.success{background:var(--accent-soft);border-color:var(--accent-border);color:var(--accent)}
.ob-rev .actions-card .alert.error{background:var(--danger-soft);border-color:var(--danger-border);color:var(--danger)}

.ob-rev .back-bar{display:flex;align-items:center;gap:10px;margin-bottom:18px}
.ob-rev .back-bar .back{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--line-2);border-radius:8px;background:var(--surface-1);color:var(--fg-dim);font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:.15s}
.ob-rev .back-bar .back:hover{color:var(--fg);border-color:var(--accent-border)}

@media (max-width:1100px){
  .ob-rev{grid-template-columns:1fr;height:auto}
  .ob-rev .pane{height:60vh;min-height:440px}
}

/* Confirm overlay */
.ob-rev-confirm-back{position:fixed;inset:0;z-index:70;background:var(--scrim);backdrop-filter:blur(10px);display:grid;place-items:center;padding:24px}
.ob-rev-confirm{width:100%;max-width:440px;background:var(--bg-2);border:1px solid var(--line-2);border-radius:14px;padding:22px;text-align:center}
.ob-rev-confirm .ic{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;margin:0 auto 10px}
.ob-rev-confirm.acc .ic{background:var(--accent);color:var(--accent-ink)}
.ob-rev-confirm.rej .ic{background:var(--danger);color:#fff}
.ob-rev-confirm h4{font-weight:600;font-size:18px;margin:0 0 5px;color:var(--fg)}
.ob-rev-confirm p{font-size:13.5px;color:var(--fg-dim);margin:0 0 14px;line-height:1.5}
.ob-rev-confirm .row{display:flex;gap:8px;justify-content:center}
`;

if (typeof document !== 'undefined' && !document.getElementById('ob-rev-styles')) {
  const tag = document.createElement('style');
  tag.id = 'ob-rev-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

function fmtTime(s) {
  if (!s) return '';
  try { return new Date(s).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  catch { return ''; }
}
function fmtDay(s) {
  if (!s) return '';
  try {
    const d = new Date(s);
    const today = new Date();
    const yest = new Date(); yest.setDate(today.getDate() - 1);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, yest)) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch { return ''; }
}

function Stars({ score, count }) {
  if (score == null) return <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)' }}>No ratings</span>;
  const full = Math.round(score);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)' }}>
      <span aria-hidden>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
      <span style={{ color: 'var(--fg-dim)' }}>{score.toFixed(2)} · {count || 0}</span>
    </span>
  );
}

export default function OwnerApplicantReview() {
  const { campaignId, influencerId } = useParams();
  const navigate = useNavigate();
  const {
    user, campaigns, influencers,
    acceptApplication, rejectApplication, postComment,
  } = useAuth();

  const campaign = campaigns.find((c) => c.id === campaignId);
  const app = useMemo(
    () => (campaign?.applications || []).find((a) => a.influencerId === influencerId) || null,
    [campaign, influencerId]
  );
  const inf = (app && app.creator) || influencers.find((i) => i.id === influencerId) || null;

  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);
  const [chatError, setChatError] = useState('');
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const streamRef = useRef(null);
  const composerRef = useRef(null);

  const messages = app?.comments || [];
  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [reply]);

  if (!campaign) {
    return (
      <OwnerLayout title="Review applicant">
        <div className="ob-rev">
          <div className="pane" style={{ gridColumn: '1 / -1', display: 'grid', placeItems: 'center', padding: 40 }}>
            <div style={{ textAlign: 'center', color: 'var(--fg-dim)' }}>
              <p>Campaign not found.</p>
              <button onClick={() => navigate('/owner/campaigns')} style={{
                marginTop: 14, padding: '10px 18px', borderRadius: 8, background: 'var(--accent)',
                color: 'var(--accent-ink)', fontWeight: 600, fontSize: 13, border: 0, cursor: 'pointer',
              }}>Back to campaigns</button>
            </div>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  if (!app || !inf) {
    return (
      <OwnerLayout title="Review applicant">
        <div className="ob-rev">
          <div className="pane" style={{ gridColumn: '1 / -1', display: 'grid', placeItems: 'center', padding: 40 }}>
            <div style={{ textAlign: 'center', color: 'var(--fg-dim)' }}>
              <p>Applicant not found.</p>
              <button onClick={() => navigate(`/owner/applicants/${campaignId}`)} style={{
                marginTop: 14, padding: '10px 18px', borderRadius: 8, background: 'var(--accent)',
                color: 'var(--accent-ink)', fontWeight: 600, fontSize: 13, border: 0, cursor: 'pointer',
              }}>Back to applicants</button>
            </div>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  const handleSend = async () => {
    const body = reply.trim();
    if (!body) return;
    setPosting(true);
    setChatError('');
    try {
      await postComment(campaignId, influencerId, body);
      setReply('');
    } catch (err) {
      setChatError(err.message || 'Could not send');
    } finally {
      setPosting(false);
    }
  };
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const blockedByOther = !!campaign.assignedInfluencer && campaign.assignedInfluencer !== influencerId;

  const handleAccept = async () => {
    setActing(true);
    setActionError('');
    try {
      await acceptApplication(campaignId, influencerId);
      setActionSuccess('Accepted ✓');
      setConfirmAccept(false);
    } catch (err) {
      setActionError(err.message || 'Could not accept');
    } finally {
      setActing(false);
    }
  };
  const handleReject = async () => {
    setActing(true);
    setActionError('');
    try {
      await rejectApplication(campaignId, influencerId);
      setActionSuccess('Rejected');
      setConfirmReject(false);
    } catch (err) {
      setActionError(err.message || 'Could not reject');
    } finally {
      setActing(false);
    }
  };

  const groupedItems = [];
  let lastDay = '';
  for (const m of messages) {
    const day = fmtDay(m.createdAt);
    if (day !== lastDay) {
      groupedItems.push({ kind: 'sep', id: `sep-${day}-${m.id}`, label: day });
      lastDay = day;
    }
    groupedItems.push({ kind: 'msg', message: m });
  }

  return (
    <OwnerLayout title={`Review · ${inf.profile?.fullName || 'Applicant'}`}>
      <div className="back-bar" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button
          onClick={() => navigate(`/owner/applicants/${campaignId}`)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', border: '1px solid var(--line-2)', borderRadius: 8,
            background: 'var(--surface-1)', color: 'var(--fg-dim)',
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em',
            textTransform: 'uppercase', cursor: 'pointer', transition: '.15s',
          }}
        >← Back to applicants</button>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>
          {campaign.title}
        </div>
      </div>

      <div className="ob-rev">
        {/* ---------- Chat ---------- */}
        <div className="pane">
          <div className="pane-head">
            <div
              className="av"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/owner/influencers/${influencerId}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/owner/influencers/${influencerId}`); }}
              style={{ cursor: 'pointer' }}
              title={`View ${inf.profile?.fullName || 'creator'} profile`}
            >
              {inf.profile?.fullName?.charAt(0) || 'C'}
            </div>
            <div
              className="who"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/owner/influencers/${influencerId}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/owner/influencers/${influencerId}`); }}
              style={{ cursor: 'pointer' }}
              title={`View ${inf.profile?.fullName || 'creator'} profile`}
            >
              <b>{inf.profile?.fullName}</b>
              <span>@{inf.profile?.instagram} · {inf.profile?.followers}</span>
            </div>
            <span className={'pill ' + app.status}>{app.status}</span>
          </div>

          <div className="stream" ref={streamRef}>
            {groupedItems.length === 0 ? (
              <div className="empty">
                <p>No messages yet — open the conversation by introducing yourself or asking about deliverables.</p>
              </div>
            ) : groupedItems.map((it) => {
              if (it.kind === 'sep') return <div key={it.id} className="day">{it.label}</div>;
              const cm = it.message;
              const mine = cm.authorId === user?.id;
              return (
                <div key={cm.id} className={'bubble' + (mine ? ' mine' : '')}>
                  <div className="who">{mine ? 'You' : (cm.authorName || inf.profile?.fullName || 'Creator')}</div>
                  <div className="body">{cm.body}</div>
                  <div className="at">{fmtTime(cm.createdAt)}</div>
                </div>
              );
            })}
          </div>

          {chatError && <div className="composer-err">{chatError}</div>}

          <div className="composer">
            <textarea
              ref={composerRef}
              rows={1}
              placeholder={`Message ${inf.profile?.fullName?.split(' ')[0] || 'creator'}…`}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="send" onClick={handleSend} disabled={posting || !reply.trim()}>
              {posting ? '…' : <>Send <span style={{ fontSize: 14 }}>→</span></>}
            </button>
          </div>
          <div className="composer-hint">⏎ Send · ⇧⏎ Newline</div>
        </div>

        {/* ---------- Context column ---------- */}
        <div className="ctx">
          {/* Profile card */}
          <div
            className="card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/owner/influencers/${influencerId}`)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/owner/influencers/${influencerId}`); }}
            style={{ cursor: 'pointer' }}
            title={`View ${inf.profile?.fullName || 'creator'} profile`}
          >
            <div className="profile-block">
              <div className="av">{inf.profile?.fullName?.charAt(0) || 'C'}</div>
              <div className="who">
                <b>{inf.profile?.fullName}</b>
                <div className="h">@{inf.profile?.instagram}</div>
                <div className="stats">
                  <span><b>{inf.profile?.followers}</b> followers</span>
                  <span>·</span><span>{inf.profile?.niche}</span>
                </div>
                {inf.rating && <div style={{ marginTop: 6 }}><Stars score={inf.rating.score} count={inf.rating.count} /></div>}
              </div>
            </div>
            {inf.profile?.city && (
              <div className="row" style={{ borderTop: 0, paddingTop: 0 }}>
                <span className="k">Location</span><span className="v">{inf.profile.city}</span>
              </div>
            )}
            {inf.profile?.bio && (
              <p style={{ marginTop: 8 }}>{inf.profile.bio}</p>
            )}
          </div>

          {/* Pitch + counter-offer */}
          {(app.message || app.proposedPrice || app.proposedNote) && (
            <div className="card">
              <h4>Application</h4>
              <div className="sub">Applied {app.appliedAt}</div>
              {app.message && (
                <div className="quote">
                  <span className="l">Pitch</span>
                  "{app.message}"
                </div>
              )}
              {(app.proposedPrice || app.proposedNote) && (
                <div className="quote offer">
                  <span className="l">Counter-offer</span>
                  {app.proposedPrice && <div className="price">₹{Number(app.proposedPrice).toLocaleString()}</div>}
                  {app.proposedNote && <div>{app.proposedNote}</div>}
                </div>
              )}
            </div>
          )}

          {/* Decision card */}
          <div className="card actions-card">
            <h4>Decision</h4>
            <div className="sub">
              {app.status === 'pending' && (blockedByOther ? 'Locked — another creator is assigned' : 'Choose to accept or reject')}
              {app.status === 'accepted' && 'You accepted this creator'}
              {app.status === 'rejected' && 'You rejected this applicant'}
            </div>

            {actionSuccess && <div className="alert success">{actionSuccess}</div>}
            {actionError && <div className="alert error">{actionError}</div>}
            {blockedByOther && app.status === 'pending' && (
              <div className="alert" style={{ marginBottom: 10 }}>
                Unassign the current creator on the applicants page first.
              </div>
            )}

            {app.status === 'pending' && (
              <div className="actions">
                <button className="btn-danger" onClick={() => setConfirmReject(true)} disabled={acting}>
                  Reject
                </button>
                <button className="btn-success" onClick={() => setConfirmAccept(true)} disabled={acting || blockedByOther}>
                  Accept & assign
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm modals */}
      {confirmAccept && (
        <div className="ob-rev-confirm-back" onClick={() => setConfirmAccept(false)}>
          <div className="ob-rev-confirm acc" onClick={(e) => e.stopPropagation()}>
            <div className="ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
            </div>
            <h4>Accept {inf.profile?.fullName}?</h4>
            <p>This assigns them to the campaign and rejects all other pending applications.</p>
            <div className="row">
              <button className="btn-line" onClick={() => setConfirmAccept(false)} disabled={acting}>Cancel</button>
              <button className="btn-success" onClick={handleAccept} disabled={acting}>
                {acting ? 'Saving…' : 'Confirm accept'}
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmReject && (
        <div className="ob-rev-confirm-back" onClick={() => setConfirmReject(false)}>
          <div className="ob-rev-confirm rej" onClick={(e) => e.stopPropagation()}>
            <div className="ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </div>
            <h4>Reject {inf.profile?.fullName}?</h4>
            <p>They'll see they were not selected for this campaign.</p>
            <div className="row">
              <button className="btn-line" onClick={() => setConfirmReject(false)} disabled={acting}>Cancel</button>
              <button className="btn-danger" onClick={handleReject} disabled={acting}>
                {acting ? 'Saving…' : 'Confirm reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
