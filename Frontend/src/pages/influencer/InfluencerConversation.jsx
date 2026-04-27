import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InfluencerLayout from '../../components/layouts/InfluencerLayout';

/**
 * Dedicated conversation page (creator side).
 * Layout: chat (left, fluid) + campaign context (right, fixed).
 * Composer is sticky at the bottom of the chat column.
 */

const CSS = `
.im-chat{display:grid;grid-template-columns:minmax(0,1.6fr) 320px;gap:18px;height:calc(100vh - 200px);min-height:520px}

/* Left: chat column */
.im-chat .pane{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:14px;background:var(--bg-2);min-height:0;overflow:hidden}
.im-chat .pane-head{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line);background:var(--surface-faint)}
.im-chat .pane-head .av{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--logo-from),var(--logo-to));border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);color:var(--fg-dim);font-size:16px;flex:none}
.im-chat .pane-head .who b{display:block;font-size:14px;font-weight:600;color:var(--fg);line-height:1.2}
.im-chat .pane-head .who span{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-mute);margin-top:3px}
.im-chat .pane-head .pill{margin-left:auto;font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;padding:5px 11px;border:1px solid var(--line-2);border-radius:999px;color:var(--fg-dim)}
.im-chat .pane-head .pill.pending{color:#ffb86b;border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08)}
.im-chat .pane-head .pill.accepted,.im-chat .pane-head .pill.active{color:var(--accent);border-color:var(--accent);background:var(--accent-soft)}
.im-chat .pane-head .pill.submitted{color:#7ee8a3;border-color:rgba(126,232,163,.45);background:rgba(126,232,163,.08)}
.im-chat .pane-head .pill.rejected{color:var(--danger);border-color:var(--danger-border);background:var(--danger-soft)}

.im-chat .stream{flex:1;min-height:0;overflow-y:auto;padding:22px 24px;display:flex;flex-direction:column;gap:14px}
.im-chat .stream .day{font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);text-align:center;margin:8px 0}
.im-chat .stream .empty{margin:auto;text-align:center;color:var(--fg-mute);max-width:340px}
.im-chat .stream .empty .g{font-family:var(--serif);font-style:italic;font-size:36px;color:var(--fg-mute);margin-bottom:12px;line-height:1}
.im-chat .stream .empty p{font-size:13.5px;line-height:1.55;margin:0}

.im-chat .bubble{max-width:72%;padding:10px 14px;border-radius:14px;border:1px solid var(--line);background:var(--surface-faint);align-self:flex-start;animation:bubble-in .18s ease}
.im-chat .bubble.mine{align-self:flex-end;background:var(--accent-soft);border-color:var(--accent-border)}
.im-chat .bubble .who{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:4px}
.im-chat .bubble.mine .who{color:var(--accent)}
.im-chat .bubble .body{font-size:14px;color:var(--fg);line-height:1.55;white-space:pre-wrap;word-wrap:break-word}
.im-chat .bubble .at{font-family:var(--mono);font-size:9.5px;letter-spacing:.04em;color:var(--fg-mute);margin-top:4px}
@keyframes bubble-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}

/* Composer */
.im-chat .composer{padding:14px 18px;border-top:1px solid var(--line);background:var(--bg-2);display:flex;gap:10px;align-items:flex-end}
.im-chat .composer textarea{flex:1;border-radius:12px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:11px 14px;font-family:var(--sans);font-size:14px;resize:none;min-height:46px;max-height:160px;outline:none;line-height:1.45;transition:.15s}
.im-chat .composer textarea:focus{border-color:var(--accent);background:var(--accent-soft)}
.im-chat .composer .send{height:46px;padding:0 22px;border-radius:12px;background:var(--accent);color:var(--accent-ink);border:0;font-weight:600;font-size:13.5px;cursor:pointer;transition:.15s;display:flex;align-items:center;gap:8px;flex:none}
.im-chat .composer .send:hover:not(:disabled){filter:brightness(1.08)}
.im-chat .composer .send:disabled{opacity:.5;cursor:not-allowed}
.im-chat .composer .hint{font-family:var(--mono);font-size:10px;letter-spacing:.06em;color:var(--fg-mute);padding:0 18px 10px}
.im-chat .composer .err{font-family:var(--mono);font-size:11px;color:var(--danger);padding:0 18px 8px}

/* Right: context column */
.im-chat .ctx{display:flex;flex-direction:column;gap:14px;overflow-y:auto}
.im-chat .ctx .card{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:18px}
.im-chat .ctx .card h4{font-family:var(--serif);font-weight:400;font-size:20px;letter-spacing:-.01em;margin:0 0 4px;color:var(--fg);line-height:1.2}
.im-chat .ctx .card .brand-line{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:14px}
.im-chat .ctx .card p.offer{font-size:13.5px;color:var(--fg-dim);line-height:1.55;margin:0 0 14px}
.im-chat .ctx .card .row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid var(--line);font-family:var(--mono);font-size:11px}
.im-chat .ctx .card .row .k{color:var(--fg-mute);text-transform:uppercase;letter-spacing:.1em}
.im-chat .ctx .card .row .v{color:var(--fg);text-align:right}
.im-chat .ctx .card .row .v.code{color:var(--accent)}
.im-chat .ctx .card .pill{display:inline-block;padding:4px 10px;border:1px solid var(--line-2);border-radius:999px;font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim)}
.im-chat .ctx .card .pill.accepted,.im-chat .ctx .card .pill.active{color:var(--accent);border-color:var(--accent);background:var(--accent-soft)}
.im-chat .ctx .card .pill.submitted{color:#7ee8a3;border-color:rgba(126,232,163,.45);background:rgba(126,232,163,.08)}
.im-chat .ctx .card .pill.pending{color:#ffb86b;border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08)}
.im-chat .ctx .card .pill.rejected{color:var(--danger);border-color:var(--danger-border);background:var(--danger-soft)}
.im-chat .ctx .card .quote{margin-top:10px;padding:10px 12px;border:1px solid var(--accent-border);border-radius:10px;background:var(--accent-soft);font-size:13px;color:var(--fg);line-height:1.5;font-style:italic}
.im-chat .ctx .card .quote.note{font-style:normal;border-color:rgba(255,184,107,.45);background:rgba(255,184,107,.08);color:var(--fg-dim)}
.im-chat .ctx .card .quote .l{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:5px;font-style:normal;display:block}
.im-chat .ctx .card .quote.note .l{color:#ffb86b}

.im-chat .back-bar{display:flex;align-items:center;gap:10px;margin-bottom:18px}
.back-bar{display:flex;align-items:center;gap:10px;margin-bottom:32px}
.im-chat .back-bar .back{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid var(--line-2);border-radius:8px;background:var(--surface-1);color:var(--fg-dim);font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:.15s}
.im-chat .back-bar .back:hover{color:var(--fg);border-color:var(--accent-border)}

@media (max-width:1100px){
  .im-chat{grid-template-columns:1fr;height:auto}
  .im-chat .pane{height:62vh;min-height:440px}
  .im-chat .ctx{order:-1}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('im-chat-styles')) {
  const tag = document.createElement('style');
  tag.id = 'im-chat-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

function formatCompensation(c) {
  if (!c) return '';
  if (c.compensationType === 'cash') {
    if (c.priceMin && c.priceMax) return `₹${c.priceMin.toLocaleString()}–₹${c.priceMax.toLocaleString()}`;
    return c.priceMax ? `Up to ₹${c.priceMax.toLocaleString()}` : 'Cash';
  }
  if (c.compensationType === 'barter') return c.barterValue ? `Barter · ₹${c.barterValue.toLocaleString()}` : 'Barter';
  const cash = c.priceMin && c.priceMax ? `₹${c.priceMin.toLocaleString()}–₹${c.priceMax.toLocaleString()}` : (c.priceMax ? `up to ₹${c.priceMax.toLocaleString()}` : 'cash');
  return `${cash} + perks`;
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

export default function InfluencerConversation() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user, campaigns, postComment } = useAuth();

  const campaign = campaigns.find((c) => c.id === campaignId);
  const myApp = useMemo(
    () => (campaign?.applications || []).find((a) => a.influencerId === user?.id) || null,
    [campaign, user]
  );

  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const streamRef = useRef(null);
  const composerRef = useRef(null);

  const messages = myApp?.comments || [];

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Auto-resize composer.
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [reply]);

  if (!campaign) {
    return (
      <InfluencerLayout title="Conversation">
        <div className="im-chat">
          <div className="pane" style={{ gridColumn: '1 / -1', placeItems: 'center', display: 'grid' }}>
            <div className="empty" style={{ padding: 40, textAlign: 'center' }}>
              <div className="g" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 36, color: 'var(--fg-mute)' }}>not found.</div>
              <p style={{ color: 'var(--fg-dim)' }}>This campaign isn't in your list anymore.</p>
              <button onClick={() => navigate(-1)} style={{
                marginTop: 16, padding: '10px 20px', borderRadius: 999, background: 'var(--accent)',
                color: 'var(--accent-ink)', fontWeight: 600, fontSize: 13, border: 0, cursor: 'pointer',
              }}>← Back</button>
            </div>
          </div>
        </div>
      </InfluencerLayout>
    );
  }

  if (!myApp) {
    return (
      <InfluencerLayout title="Conversation">
        <div className="im-chat back-bar-wrap">
          <div className="back-bar" style={{ gridColumn: '1 / -1' }}>
            <button className="back" onClick={() => navigate(-1)}>← Back</button>
          </div>
          <div className="pane" style={{ gridColumn: '1 / -1', placeItems: 'center', display: 'grid', padding: 40 }}>
            <div style={{ textAlign: 'center', color: 'var(--fg-dim)' }}>
              <p>You haven't applied to this campaign yet.</p>
            </div>
          </div>
        </div>
      </InfluencerLayout>
    );
  }

  const handleSend = async () => {
    const body = reply.trim();
    if (!body) return;
    setPosting(true);
    setError('');
    try {
      await postComment(campaignId, user.id, body);
      setReply('');
    } catch (err) {
      setError(err.message || 'Could not send message');
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

  // Group messages by day for date separators.
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

  const status = myApp.status; // pending / accepted / rejected
  const liveStatus = campaign.status === 'submitted' ? 'submitted' : (status || campaign.status);

  return (
    <InfluencerLayout title={`Chat · ${campaign.brand || 'Brand'}`}>
      <div className="back-bar">
        <button className="back" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>
          Conversation · {campaign.title}
        </div>
      </div>

      <div className="im-chat">
        {/* ---------- Chat column ---------- */}
        <div className="pane">
          <div className="pane-head">
            {campaign.ownerId ? (
              <>
                <div
                  className="av"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/influencer/brands/${campaign.ownerId}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/influencer/brands/${campaign.ownerId}`); }}
                  style={{ cursor: 'pointer' }}
                  title={`View ${campaign.brand || 'brand'} profile`}
                >
                  {(campaign.brand || 'B').charAt(0)}
                </div>
                <div
                  className="who"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/influencer/brands/${campaign.ownerId}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/influencer/brands/${campaign.ownerId}`); }}
                  style={{ cursor: 'pointer' }}
                  title={`View ${campaign.brand || 'brand'} profile`}
                >
                  <b>{campaign.brand || 'Brand'}</b>
                  <span>{campaign.title}</span>
                </div>
              </>
            ) : (
              <>
                <div className="av">{(campaign.brand || 'B').charAt(0)}</div>
                <div className="who">
                  <b>{campaign.brand || 'Brand'}</b>
                  <span>{campaign.title}</span>
                </div>
              </>
            )}
            <span className={'pill ' + liveStatus}>{liveStatus}</span>
          </div>

          <div className="stream" ref={streamRef}>
            {groupedItems.length === 0 ? (
              <div className="empty">
                <div className="g">no messages.</div>
                <p>Send the brand a note — confirm deliverables, ask about timing, or send fresh ideas.</p>
              </div>
            ) : groupedItems.map((it) => {
              if (it.kind === 'sep') return <div key={it.id} className="day">{it.label}</div>;
              const cm = it.message;
              const mine = cm.authorId === user.id;
              return (
                <div key={cm.id} className={'bubble' + (mine ? ' mine' : '')}>
                  <div className="who">{mine ? 'You' : (cm.authorName || campaign.brand || 'Brand')}</div>
                  <div className="body">{cm.body}</div>
                  <div className="at">{fmtTime(cm.createdAt)}</div>
                </div>
              );
            })}
          </div>

          {error && <div className="err" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--danger)', padding: '0 18px 6px' }}>{error}</div>}

          <div className="composer">
            <textarea
              ref={composerRef}
              rows={1}
              placeholder={`Message ${campaign.brand || 'the brand'}…`}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={status === 'rejected'}
            />
            <button className="send" onClick={handleSend} disabled={posting || !reply.trim() || status === 'rejected'}>
              {posting ? '…' : <>Send <span style={{ fontSize: 14 }}>→</span></>}
            </button>
          </div>
          <div className="hint" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.06em', color: 'var(--fg-mute)', padding: '0 18px 10px' }}>
            ⏎ Send · ⇧⏎ Newline
          </div>
        </div>

        {/* ---------- Context column ---------- */}
        <div className="ctx">
          <div
            className="card"
            role={campaign.ownerId ? 'button' : undefined}
            tabIndex={campaign.ownerId ? 0 : undefined}
            onClick={campaign.ownerId ? () => navigate(`/influencer/brands/${campaign.ownerId}`) : undefined}
            onKeyDown={campaign.ownerId ? (e) => { if (e.key === 'Enter') navigate(`/influencer/brands/${campaign.ownerId}`); } : undefined}
            style={campaign.ownerId ? { cursor: 'pointer' } : undefined}
            title={campaign.ownerId ? `View ${campaign.brand || 'brand'} profile` : undefined}
          >
            <h4>{campaign.title}</h4>
            <div className="brand-line">{campaign.brand}</div>
            <p className="offer">{campaign.offer}</p>
            <span className={'pill ' + liveStatus}>{liveStatus}</span>

            <div className="row"><span className="k">Promo</span><span className="v code">{campaign.promoCode}</span></div>
            <div className="row"><span className="k">Window</span><span className="v">{campaign.startDate} → {campaign.endDate}</span></div>
            <div className="row"><span className="k">Compensation</span><span className="v">{formatCompensation(campaign)}</span></div>
            {campaign.barterDescription && (
              <div className="quote note" style={{ marginTop: 12 }}>
                <span className="l">Perks</span>
                {campaign.barterDescription}
              </div>
            )}
          </div>

          <div
            className="card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/influencer/profile')}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/influencer/profile'); }}
            style={{ cursor: 'pointer' }}
            title="View your profile"
          >
            <h4 style={{ fontSize: 16, fontFamily: 'var(--sans)', fontWeight: 600 }}>Your application</h4>
            <div className="row" style={{ borderTop: 0, paddingTop: 0 }}>
              <span className="k">Status</span>
              <span className="v"><span className={'pill ' + status}>{status}</span></span>
            </div>
            <div className="row"><span className="k">Applied</span><span className="v">{myApp.appliedAt}</span></div>
            {myApp.proposedPrice && (
              <div className="row"><span className="k">Counter-offer</span><span className="v">₹{Number(myApp.proposedPrice).toLocaleString()}</span></div>
            )}

            {myApp.message && (
              <div className="quote">
                <span className="l">Your pitch</span>
                "{myApp.message}"
              </div>
            )}
            {myApp.proposedNote && (
              <div className="quote note">
                <span className="l">Your terms</span>
                {myApp.proposedNote}
              </div>
            )}
          </div>

          {campaign.submittedPost && (
            <div className="card">
              <h4 style={{ fontSize: 16, fontFamily: 'var(--sans)', fontWeight: 600 }}>Submitted post</h4>
              <a href={campaign.submittedPost} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'var(--accent)', fontFamily: 'var(--mono)',
                fontSize: 12, letterSpacing: '.06em',
              }}>
                View on Instagram
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </InfluencerLayout>
  );
}
