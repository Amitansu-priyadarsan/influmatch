import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import InfluencerLayout from '../../components/layouts/InfluencerLayout';

const BROWSE_CSS = `
.im-browse .head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:32px;flex-wrap:wrap}
.im-browse .kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:12px}
.im-browse .kicker .n{color:var(--accent)}
.im-browse h1{font-family:var(--serif);font-weight:400;font-size:clamp(40px,4.4vw,56px);line-height:1;letter-spacing:-.02em;margin:0}
.im-browse h1 em{font-style:italic;color:var(--fg-dim)}
.im-browse .count{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim);margin-top:12px}
.im-browse .count b{color:var(--accent);font-weight:500}

.im-browse .search{position:relative;margin-bottom:24px;max-width:640px}
.im-browse .search svg{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--fg-mute)}
.im-browse .search input{width:100%;height:48px;border-radius:999px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:0 18px 0 46px;font-family:var(--sans);font-size:14px;outline:none;transition:.15s}
.im-browse .search input::placeholder{color:var(--fg-mute)}
.im-browse .search input:focus{border-color:var(--accent);background:var(--accent-soft)}

.im-browse .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}

.im-browse .camp{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:22px;position:relative;transition:.2s;display:flex;flex-direction:column;min-height:260px;cursor:pointer;text-align:left}
.im-browse .camp:hover{border-color:var(--line-2);background:var(--surface-hover);transform:translateY(-2px);box-shadow:0 20px 40px -24px rgba(0,0,0,.4)}
.im-browse .camp .row1{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.im-browse .camp .logo{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--logo-from),var(--logo-to));border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);color:var(--fg-dim);font-size:17px}
.im-browse .camp .status{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;display:flex;gap:6px;align-items:center;color:var(--accent)}
.im-browse .camp .status .d{width:5px;height:5px;border-radius:50%;background:var(--accent)}
.im-browse .camp h4{font-family:var(--serif);font-weight:400;font-size:24px;line-height:1.1;letter-spacing:-.01em;margin:0 0 6px}
.im-browse .camp .brand-name{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:14px}
.im-browse .camp .offer{color:var(--fg-dim);font-size:13.5px;line-height:1.5;margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.im-browse .camp .tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
.im-browse .camp .tags span{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-dim);padding:3px 9px;border:1px solid var(--line);border-radius:999px}
.im-browse .camp .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;padding-top:14px;border-top:1px solid var(--line)}
.im-browse .camp .foot .lbl{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}
.im-browse .camp .foot .val{font-family:var(--mono);font-size:11px;color:var(--fg);margin-top:4px}
.im-browse .camp .pill{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;border:1px solid var(--line-2);border-radius:999px;color:var(--fg-dim)}
.im-browse .camp .pill.applied{color:var(--accent);border-color:var(--accent)}
.im-browse .camp .pill.accepted{color:var(--accent);border-color:var(--accent);background:var(--accent-soft)}
.im-browse .camp .pill.rejected{color:var(--danger);border-color:var(--danger-border)}

.im-browse .empty{padding:80px 24px;border:1px dashed var(--line-2);border-radius:14px;text-align:center;background:var(--surface-faint)}
.im-browse .empty .g{font-family:var(--serif);font-style:italic;font-size:44px;color:var(--fg-mute);margin-bottom:12px;line-height:1}
.im-browse .empty p{color:var(--fg-dim);margin:0;font-size:14px}

/* Modal */
.im-modal-back{position:fixed;inset:0;z-index:70;background:var(--scrim);backdrop-filter:blur(10px);display:grid;place-items:center;padding:24px;animation:im-fade .18s ease}
@keyframes im-fade{from{opacity:0}to{opacity:1}}
.im-modal{width:100%;max-width:560px;max-height:90vh;overflow:auto;background:var(--bg-2);border:1px solid var(--line-2);border-radius:16px;padding:28px;position:relative;animation:im-rise .22s cubic-bezier(.2,.7,.2,1)}
@keyframes im-rise{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
.im-modal .x{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:8px;border:1px solid var(--line);display:grid;place-items:center;color:var(--fg-mute);cursor:pointer;transition:.15s}
.im-modal .x:hover{color:var(--fg);border-color:var(--line-2)}
.im-modal .m-kick{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:10px}
.im-modal h3{font-family:var(--serif);font-weight:400;font-size:34px;line-height:1.05;letter-spacing:-.015em;margin:0 0 6px}
.im-modal h3 em{font-style:italic;color:var(--fg-dim)}
.im-modal .m-brand{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim);margin-bottom:22px}
.im-modal .m-offer{color:var(--fg);font-size:15px;line-height:1.55;margin:0 0 22px}
.im-modal .m-meta{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:22px;padding:16px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.im-modal .m-meta .cell .l{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}
.im-modal .m-meta .cell .v{font-family:var(--mono);font-size:12px;color:var(--fg);margin-top:5px}
.im-modal .m-meta .cell .v.code{color:var(--accent)}
.im-modal .profile{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--line);border-radius:12px;background:var(--surface-faint);margin-bottom:18px}
.im-modal .profile .av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--avatar-from),var(--avatar-to));border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:16px;color:var(--fg-dim)}
.im-modal .profile .who b{font-size:13px;color:var(--fg);display:block;font-weight:500}
.im-modal .profile .who span{font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--fg-mute);display:block;margin-top:2px}
.im-modal .fld{display:flex;flex-direction:column;gap:8px;margin-bottom:18px}
.im-modal .fld label{font-size:13px;color:var(--fg);font-weight:500}
.im-modal .fld label .opt{color:var(--fg-mute);font-weight:400}
.im-modal .fld textarea,.im-modal .fld input{width:100%;border-radius:10px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:12px 14px;font-family:var(--sans);font-size:14px;outline:none;transition:.15s;line-height:1.5}
.im-modal .fld textarea{min-height:100px;resize:vertical}
.im-modal .fld textarea:focus,.im-modal .fld input:focus{border-color:var(--accent);background:var(--accent-soft)}
.im-modal .fld .err{color:var(--danger);font-family:var(--mono);font-size:11px;letter-spacing:.08em}
.im-modal .m-actions{display:flex;gap:10px;justify-content:flex-end}
.im-modal .m-status{padding:14px 18px;border-radius:10px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:8px}
.im-modal .m-status.applied{color:var(--accent);border:1px solid var(--accent);background:var(--accent-soft)}
.im-modal .m-status.rejected{color:var(--danger);border:1px solid var(--danger-border);background:var(--danger-soft)}
.im-modal .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;font-size:13px;font-weight:500;border:1px solid transparent;cursor:pointer;transition:.15s}
.im-modal .btn-line{border-color:var(--line-2);color:var(--fg);background:var(--surface-1)}
.im-modal .btn-line:hover{background:var(--surface-1-hover)}
.im-modal .btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:500}
.im-modal .btn-solid:hover{filter:brightness(1.08)}
.im-modal .ok-state{text-align:center;padding:24px 8px}
.im-modal .ok-state .tick{width:48px;height:48px;border-radius:50%;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;margin:0 auto 14px}
.im-modal .ok-state h4{font-family:var(--serif);font-size:26px;margin:0 0 6px;font-weight:400}
.im-modal .ok-state p{color:var(--fg-dim);font-size:13.5px;margin:0}

@media (max-width:900px){
  .im-browse .grid{grid-template-columns:1fr}
  .im-modal .m-meta{grid-template-columns:1fr}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('im-browse-styles')) {
  const tag = document.createElement('style');
  tag.id = 'im-browse-styles';
  tag.textContent = BROWSE_CSS;
  document.head.appendChild(tag);
}

const daysLeft = (endDate) => {
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

export default function InfluencerBrowseCampaigns() {
  const { user, campaigns, owners, applyToCampaign } = useAuth();
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [applyMode, setApplyMode] = useState(false);
  const [message, setMessage] = useState('');
  const [applied, setApplied] = useState(false);

  const openCampaigns = campaigns.filter((c) => c.status === 'open');
  const filtered = openCampaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase()) ||
    c.offer.toLowerCase().includes(search.toLowerCase())
  );

  const getAppStatus = (campaign) =>
    (campaign.applications || []).find((a) => a.influencerId === user.id)?.status || null;

  const openDetail = (c) => {
    setDetail(c);
    setApplyMode(false);
    setApplied(false);
    setMessage('');
  };

  const closeModal = () => {
    setDetail(null);
    setApplyMode(false);
    setApplied(false);
    setMessage('');
  };

  const handleApply = async () => {
    try {
      await applyToCampaign(detail.id, message);
      setApplied(true);
      setTimeout(closeModal, 1600);
    } catch {
      // noop — UI stays on the apply form so user can retry
    }
  };

  return (
    <InfluencerLayout title="Browse Campaigns">
      <div className="im-browse">
        <div className="head">
          <div>
            <h1>Open <em>campaigns.</em></h1>
            <div className="count"><b>{openCampaigns.length}</b> campaign{openCampaigns.length !== 1 ? 's' : ''} looking for creators</div>
          </div>
        </div>

        <div className="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" placeholder="Search by title, brand, or offer..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="g">nothing open.</div>
            <p>{search ? 'No campaigns match your search.' : 'No open campaigns right now — check back soon.'}</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((c) => {
              const status = getAppStatus(c);
              const remaining = daysLeft(c.endDate);
              return (
                <button key={c.id} className="camp" onClick={() => openDetail(c)}>
                  <div className="row1">
                    <div className="logo">{(c.brand || 'B').charAt(0)}</div>
                    <div className="status"><span className="d" /> Open · {remaining}d left</div>
                  </div>
                  <h4>{c.title}</h4>
                  <div className="brand-name">{c.brand}</div>
                  <p className="offer">{c.offer}</p>
                  <div className="tags">
                    <span>Code · {c.promoCode}</span>
                    <span>{(c.applications || []).length} applied</span>
                  </div>
                  <div className="foot">
                    <div>
                      <div className="lbl">Window</div>
                      <div className="val">{c.startDate} → {c.endDate}</div>
                    </div>
                    {status === 'pending' && <span className="pill applied">Applied</span>}
                    {status === 'accepted' && <span className="pill accepted">Accepted</span>}
                    {status === 'rejected' && <span className="pill rejected">Not selected</span>}
                    {!status && <span className="pill">View details →</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {detail && <Modal detail={detail} owner={owners.find((o) => o.id === detail.ownerId)} status={getAppStatus(detail)} applyMode={applyMode} setApplyMode={setApplyMode} message={message} setMessage={setMessage} applied={applied} onApply={handleApply} onClose={closeModal} user={user} />}
    </InfluencerLayout>
  );
}

function Modal({ detail, owner, status, applyMode, setApplyMode, message, setMessage, applied, onApply, onClose, user }) {
  const initial = (user.profile?.fullName?.charAt(0) || 'C').toUpperCase();
  const remaining = daysLeft(detail.endDate);

  if (applied) {
    return (
      <div className="im-modal-back" onClick={onClose}>
        <div className="im-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ok-state">
            <div className="tick">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
            </div>
            <h4>Application sent.</h4>
            <p>The brand will review your profile shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="im-modal-back" onClick={onClose}>
      <div className="im-modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        {!applyMode && (
          <>
            <div className="m-kick">Campaign · {detail.brand}</div>
            <h3>{detail.title}</h3>
            <div className="m-brand">{owner ? `${detail.brand} · ${owner.city || ''}` : detail.brand}</div>

            <p className="m-offer">{detail.offer}</p>

            <div className="m-meta">
              <div className="cell">
                <div className="l">Promo code</div>
                <div className="v code">{detail.promoCode}</div>
              </div>
              <div className="cell">
                <div className="l">Window</div>
                <div className="v">{detail.startDate} → {detail.endDate}</div>
              </div>
              <div className="cell">
                <div className="l">Time left</div>
                <div className="v">{remaining} days</div>
              </div>
              <div className="cell">
                <div className="l">Applications</div>
                <div className="v">{(detail.applications || []).length}</div>
              </div>
            </div>

            {status === 'pending' && <div className="m-status applied">✓ Applied — waiting for review</div>}
            {status === 'accepted' && <div className="m-status applied">✓ Accepted — check My Campaigns</div>}
            {status === 'rejected' && <div className="m-status rejected">Not selected this time</div>}

            <div className="m-actions">
              <button className="btn btn-line" onClick={onClose}>Close</button>
              {!status && (
                <button className="btn btn-solid" onClick={() => setApplyMode(true)}>Apply to campaign →</button>
              )}
            </div>
          </>
        )}

        {applyMode && (
          <>
            <div className="m-kick">Apply · {detail.brand}</div>
            <h3>Pitch your <em>angle.</em></h3>
            <div className="m-brand" style={{ marginBottom: 18 }}>{detail.title}</div>

            <div className="profile">
              <div className="av">{initial}</div>
              <div className="who">
                <b>{user.profile?.fullName || user.email}</b>
                <span>{user.profile?.instagram} · {user.profile?.followers || '—'} · {user.profile?.niche || 'niche'}</span>
              </div>
            </div>

            <div className="fld">
              <label>Your message <span className="opt">— optional</span></label>
              <textarea placeholder="I have 45K engaged followers in the food niche and would love to create content for this campaign..."
                value={message}
                onChange={(e) => setMessage(e.target.value)} />
            </div>

            <div className="m-actions">
              <button className="btn btn-line" onClick={() => setApplyMode(false)}>← Back</button>
              <button className="btn btn-solid" onClick={onApply}>Submit application →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
