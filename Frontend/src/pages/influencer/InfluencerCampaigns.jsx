import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InfluencerLayout from '../../components/layouts/InfluencerLayout';

const MINE_CSS = `
.im-mine .head{margin-bottom:32px}
.im-mine .kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:12px}
.im-mine .kicker .n{color:var(--accent)}
.im-mine h1{font-family:var(--serif);font-weight:400;font-size:clamp(40px,4.4vw,56px);line-height:1;letter-spacing:-.02em;margin:0}
.im-mine h1 em{font-style:italic;color:var(--fg-dim)}
.im-mine .count{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim);margin-top:12px}
.im-mine .count b{color:var(--accent);font-weight:500}

.im-mine .filters{display:flex;gap:8px;margin-bottom:22px;flex-wrap:wrap}
.im-mine .filter{padding:8px 16px;border-radius:999px;border:1px solid var(--line-2);background:var(--surface-1);font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-dim);cursor:pointer;transition:.15s}
.im-mine .filter:hover{color:var(--fg)}
.im-mine .filter.active{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.im-mine .filter b{font-weight:500;margin-left:6px;color:currentColor;opacity:.8}

.im-mine .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}

.im-mine .camp{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:22px;transition:.2s;display:flex;flex-direction:column;min-height:260px}
.im-mine .camp:hover{border-color:var(--line-2);background:var(--surface-hover)}
.im-mine .camp .row1{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.im-mine .camp .logo{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--logo-from),var(--logo-to));border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);color:var(--fg-dim);font-size:17px}
.im-mine .camp .status{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;display:flex;gap:6px;align-items:center;color:var(--fg-dim)}
.im-mine .camp .status .d{width:5px;height:5px;border-radius:50%;background:var(--fg-mute)}
.im-mine .camp .status.active{color:var(--accent)}
.im-mine .camp .status.active .d{background:var(--accent)}
.im-mine .camp .status.submitted{color:var(--accent)}
.im-mine .camp .status.submitted .d{background:var(--accent)}
.im-mine .camp h4{font-family:var(--serif);font-weight:400;font-size:24px;line-height:1.1;letter-spacing:-.01em;margin:0 0 6px}
.im-mine .camp .brand-name{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:14px}
.im-mine .camp .offer{color:var(--fg-dim);font-size:13.5px;line-height:1.5;margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.im-mine .camp .meta{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:16px;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:var(--fg-dim)}
.im-mine .camp .meta .k{color:var(--fg-mute);text-transform:uppercase;margin-right:6px}
.im-mine .camp .meta .code{color:var(--accent)}
.im-mine .camp .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:14px;border-top:1px solid var(--line)}
.im-mine .camp .view-post{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);display:inline-flex;align-items:center;gap:6px}
.im-mine .camp .view-post:hover{text-decoration:underline}
.im-mine .camp .btn{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;font-size:12px;font-weight:500;border:1px solid transparent;cursor:pointer;transition:.15s}
.im-mine .camp .btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:500}
.im-mine .camp .btn-solid:hover{filter:brightness(1.08)}
.im-mine .camp .waiting{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute)}

.im-mine .empty{padding:80px 24px;border:1px dashed var(--line-2);border-radius:14px;text-align:center;background:var(--surface-faint)}
.im-mine .empty .g{font-family:var(--serif);font-style:italic;font-size:44px;color:var(--fg-mute);margin-bottom:12px;line-height:1}
.im-mine .empty p{color:var(--fg-dim);margin:0;font-size:14px}
.im-mine .empty .sub{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);margin-top:10px}

@media (max-width:900px){
  .im-mine .grid{grid-template-columns:1fr}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('im-mine-styles')) {
  const tag = document.createElement('style');
  tag.id = 'im-mine-styles';
  tag.textContent = MINE_CSS;
  document.head.appendChild(tag);
}

export default function InfluencerCampaigns() {
  const { user, campaigns, submitPost, submitRating } = useAuth();
  const [submitFor, setSubmitFor] = useState(null);
  const [postLink, setPostLink] = useState('');
  const [error, setError] = useState('');
  const [okId, setOkId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [rateFor, setRateFor] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const navigate = useNavigate();

  const handleSubmitRating = async () => {
    setRatingSubmitting(true);
    setRatingError('');
    try {
      await submitRating({ campaignId: rateFor, score: ratingScore, comment: ratingComment });
      setRateFor(null);
      setRatingScore(5);
      setRatingComment('');
    } catch (err) {
      setRatingError(err.message || 'Could not submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const mine = campaigns.filter((c) => c.assignedInfluencer === user.id);

  const activeCount = mine.filter((c) => !c.submittedPost).length;
  const submittedCount = mine.filter((c) => c.submittedPost).length;

  const filtered = mine.filter((c) => {
    if (filter === 'active') return !c.submittedPost;
    if (filter === 'submitted') return !!c.submittedPost;
    return true;
  });

  const handleSubmit = async () => {
    if (!postLink.trim()) { setError('Please enter your Instagram post link'); return; }
    if (!postLink.startsWith('http')) { setError('Enter a valid URL starting with http'); return; }
    try {
      await submitPost(submitFor, postLink);
      setOkId(submitFor);
      setTimeout(() => {
        setSubmitFor(null);
        setPostLink('');
        setError('');
        setOkId(null);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Could not submit. Try again.');
    }
  };

  const closeModal = () => {
    setSubmitFor(null);
    setPostLink('');
    setError('');
    setOkId(null);
  };

  return (
    <InfluencerLayout title="My Campaigns">
      <div className="im-mine">
        <div className="head">
          <h1>My <em>campaigns.</em></h1>
          <div className="count"><b>{mine.length}</b> campaign{mine.length !== 1 ? 's' : ''} assigned</div>
        </div>

        {mine.length > 0 && (
          <div className="filters">
            <button className={'filter' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>
              All <b>{mine.length}</b>
            </button>
            <button className={'filter' + (filter === 'active' ? ' active' : '')} onClick={() => setFilter('active')}>
              Action needed <b>{activeCount}</b>
            </button>
            <button className={'filter' + (filter === 'submitted' ? ' active' : '')} onClick={() => setFilter('submitted')}>
              Submitted <b>{submittedCount}</b>
            </button>
          </div>
        )}

        {mine.length === 0 ? (
          <div className="empty">
            <div className="g">nothing assigned.</div>
            <p>No campaigns assigned to you yet.</p>
            <div className="sub">Apply to open campaigns — brands review within 48h.</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="g">all caught up.</div>
            <p>No campaigns in this view.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((c) => {
              const done = !!c.submittedPost;
              return (
                <div key={c.id} className="camp">
                  <div className="row1">
                    <div className="logo">{(c.brand || 'B').charAt(0)}</div>
                    <div className={'status ' + (done ? 'submitted' : 'active')}>
                      <span className="d" /> {done ? 'Submitted' : 'Active'}
                    </div>
                  </div>
                  <h4>{c.title}</h4>
                  <div className="brand-name">{c.brand}</div>
                  <p className="offer">{c.offer}</p>
                  <div className="meta">
                    <span><span className="k">Code</span><span className="code">{c.promoCode}</span></span>
                    <span><span className="k">Window</span>{c.startDate} → {c.endDate}</span>
                  </div>
                  {(() => {
                    const myApp = (c.applications || []).find((a) => a.influencerId === user.id);
                    const msgs = (myApp?.comments || []).length;
                    return (
                      <button
                        type="button"
                        onClick={() => navigate(`/influencer/conversation/${c.id}`)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', marginBottom: 12,
                          border: '1px solid var(--accent-border)',
                          background: 'var(--accent-soft)',
                          borderRadius: 8, color: 'var(--accent)',
                          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em',
                          textTransform: 'uppercase', cursor: 'pointer',
                          alignSelf: 'flex-start',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                        Messages {msgs > 0 ? `· ${msgs}` : ''} →
                      </button>
                    );
                  })()}
                  <div className="foot">
                    {done ? (
                      <>
                        <a className="view-post" href={c.submittedPost} target="_blank" rel="noreferrer">
                          View post
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                        </a>
                        <button className="btn btn-solid" onClick={() => { setRateFor(c.id); setRatingScore(5); setRatingComment(''); setRatingError(''); }}>
                          Rate brand ★
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="waiting">Deliver your post</span>
                        <button className="btn btn-solid" onClick={() => { setSubmitFor(c.id); setPostLink(''); setError(''); }}>
                          Submit link →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {submitFor && (
        <div className="im-modal-back" onClick={closeModal}>
          <div className="im-modal" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={closeModal} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>

            {okId ? (
              <div className="ok-state">
                <div className="tick">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                </div>
                <h4>Post submitted.</h4>
                <p>The brand can now review your post and release funds.</p>
              </div>
            ) : (
              <>
                <div className="m-kick">Deliverable · Instagram post</div>
                <h3>Submit your <em>post.</em></h3>
                <div className="m-brand" style={{ marginBottom: 18 }}>Paste the direct link to your live Instagram post.</div>

                <div className="fld">
                  <label>Instagram post URL</label>
                  <input type="url" placeholder="https://www.instagram.com/p/..."
                    value={postLink}
                    onChange={(e) => { setPostLink(e.target.value); setError(''); }} />
                  {error && <div className="err">{error}</div>}
                </div>

                <div className="m-actions">
                  <button className="btn btn-line" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-solid" onClick={handleSubmit}>Submit post →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {rateFor && (
        <div className="im-modal-back" onClick={() => setRateFor(null)}>
          <div className="im-modal" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setRateFor(null)} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>

            <div className="m-kick">After-deal feedback</div>
            <h3>Rate this <em>brand.</em></h3>
            <div className="m-brand" style={{ marginBottom: 18 }}>
              How was working with them? Your feedback helps other creators.
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatingScore(n)}
                  style={{
                    width: 48, height: 48, borderRadius: 12,
                    border: '1px solid ' + (ratingScore >= n ? 'var(--accent)' : 'var(--line-2)'),
                    background: ratingScore >= n ? 'var(--accent-soft)' : 'var(--surface-1)',
                    color: ratingScore >= n ? 'var(--accent)' : 'var(--fg-mute)',
                    fontSize: 24, lineHeight: 1, cursor: 'pointer',
                  }}
                >★</button>
              ))}
            </div>

            <div className="fld">
              <label>Comment <span className="opt">— optional</span></label>
              <textarea placeholder="Brief paid promptly, clear with deliverables, would work with again."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)} />
              {ratingError && <div className="err">{ratingError}</div>}
            </div>

            <div className="m-actions">
              <button className="btn btn-line" onClick={() => setRateFor(null)}>Cancel</button>
              <button className="btn btn-solid" onClick={handleSubmitRating} disabled={ratingSubmitting}>
                {ratingSubmitting ? 'Saving…' : 'Submit rating →'}
              </button>
            </div>
          </div>
        </div>
      )}

    </InfluencerLayout>
  );
}
