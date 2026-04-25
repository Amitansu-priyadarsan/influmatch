import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/layouts/OwnerLayout';

const CAMP_CSS = `
.ob-camp .head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:26px;flex-wrap:wrap}
.ob-camp .head h1{font-weight:600;font-size:clamp(28px,3vw,38px);line-height:1.1;letter-spacing:-.02em;margin:0;color:var(--fg)}
.ob-camp .head .sub{color:var(--fg-dim);font-size:14px;margin-top:6px}

.ob-camp .filters{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.ob-camp .filter{padding:7px 14px;border-radius:8px;border:1px solid var(--line-2);background:var(--surface-1);font-size:12.5px;color:var(--fg-dim);cursor:pointer;transition:.15s;font-weight:500}
.ob-camp .filter:hover{color:var(--fg)}
.ob-camp .filter.active{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.ob-camp .filter b{margin-left:6px;font-weight:600}

.ob-camp .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}

.ob-camp .card{border:1px solid var(--line);border-radius:12px;background:var(--bg-2);padding:20px;transition:.15s;display:flex;flex-direction:column}
.ob-camp .card:hover{border-color:var(--line-2)}
.ob-camp .card .row1{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;gap:12px}
.ob-camp .card .logo{width:40px;height:40px;border-radius:9px;background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent-border);display:grid;place-items:center;font-weight:600;font-size:15px;flex:none}
.ob-camp .card .pill{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;padding:5px 10px;border:1px solid var(--line-2);border-radius:999px;color:var(--fg-dim)}
.ob-camp .card .pill.open{color:var(--accent);border-color:var(--accent-border);background:var(--accent-soft)}
.ob-camp .card .pill.active{color:var(--accent);border-color:var(--accent);background:var(--accent-soft)}
.ob-camp .card .pill.submitted{color:#7ee8a3;border-color:rgba(126,232,163,.45);background:rgba(126,232,163,.08)}
.ob-camp .card h3{font-weight:600;font-size:18px;letter-spacing:-.01em;margin:0 0 4px;color:var(--fg)}
.ob-camp .card .brand{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:12px}
.ob-camp .card .offer{color:var(--fg-dim);font-size:13.5px;line-height:1.55;margin:0 0 14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ob-camp .card .meta{display:flex;flex-wrap:wrap;gap:14px;font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;color:var(--fg-dim);padding:12px 0;border-top:1px solid var(--line);margin-bottom:14px}
.ob-camp .card .meta .k{color:var(--fg-mute);text-transform:uppercase;margin-right:6px}
.ob-camp .card .meta .code{color:var(--accent)}
.ob-camp .card .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.ob-camp .card .stats .s{padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--surface-faint)}
.ob-camp .card .stats .s .l{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:4px}
.ob-camp .card .stats .s .v{font-weight:600;font-size:16px;color:var(--fg)}
.ob-camp .card .stats .s .v.pending{color:#ffb86b}
.ob-camp .card .stats .s .v.acc{color:var(--accent)}
.ob-camp .card .assigned{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--surface-faint);margin-bottom:14px}
.ob-camp .card .assigned .av{width:28px;height:28px;border-radius:8px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;font-weight:600;font-size:12px}
.ob-camp .card .assigned .who{flex:1;min-width:0}
.ob-camp .card .assigned .who b{display:block;font-size:13px;font-weight:600;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ob-camp .card .assigned .who span{display:block;font-size:11px;color:var(--fg-mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ob-camp .card .actions{margin-top:auto;display:flex;gap:8px}
.ob-camp .card .actions .btn{flex:1;justify-content:center}

.ob-camp .empty{padding:80px 24px;border:1px dashed var(--line-2);border-radius:12px;text-align:center;background:var(--surface-faint)}
.ob-camp .empty p{color:var(--fg-dim);margin:0 0 16px;font-size:14px}

@media (max-width:900px){
  .ob-camp .grid{grid-template-columns:1fr}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('ob-camp-styles')) {
  const tag = document.createElement('style');
  tag.id = 'ob-camp-styles';
  tag.textContent = CAMP_CSS;
  document.head.appendChild(tag);
}

function formatCompensation(c) {
  if (!c) return '—';
  if (c.compensationType === 'cash') {
    if (c.priceMin && c.priceMax) return `₹${c.priceMin.toLocaleString()} – ₹${c.priceMax.toLocaleString()}`;
    return c.priceMax ? `Up to ₹${c.priceMax.toLocaleString()}` : 'Cash';
  }
  if (c.compensationType === 'barter') {
    return c.barterValue ? `Barter · worth ₹${c.barterValue.toLocaleString()}` : 'Barter';
  }
  // mixed
  const cash = c.priceMin && c.priceMax
    ? `₹${c.priceMin.toLocaleString()}–₹${c.priceMax.toLocaleString()}`
    : (c.priceMax ? `up to ₹${c.priceMax.toLocaleString()}` : 'cash');
  return `${cash} + perks`;
}

export default function OwnerCampaigns() {
  const { user, campaigns, influencers, createCampaign, assignInfluencer } = useAuth();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(null);
  const [form, setForm] = useState({
    title: '', offer: '', promoCode: '', startDate: '', endDate: '',
    compensationType: 'cash', priceMin: '', priceMax: '',
    barterDescription: '', barterValue: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  const myCampaigns = campaigns.filter((c) => c.ownerId === user.id);
  const onboardedInfluencers = influencers.filter((i) => i.onboarded);

  const counts = {
    all: myCampaigns.length,
    open: myCampaigns.filter((c) => c.status === 'open').length,
    active: myCampaigns.filter((c) => c.status === 'active').length,
    submitted: myCampaigns.filter((c) => c.submittedPost).length,
  };

  const filtered = myCampaigns.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'submitted') return !!c.submittedPost;
    return c.status === filter;
  });

  const validate = () => {
    const e = {};
    if (!form.title) e.title = 'Title is required';
    if (!form.offer) e.offer = 'Offer description is required';
    if (!form.promoCode) e.promoCode = 'Promo code is required';
    if (!form.startDate) e.startDate = 'Required';
    if (!form.endDate) e.endDate = 'Required';
    if (form.compensationType !== 'barter') {
      const min = parseInt(form.priceMin || '0', 10);
      const max = parseInt(form.priceMax || '0', 10);
      if (!min) e.priceMin = 'Min price required';
      if (!max) e.priceMax = 'Max price required';
      if (min && max && min > max) e.priceMax = 'Max must be ≥ min';
    }
    if (form.compensationType !== 'cash' && !form.barterDescription.trim()) {
      e.barterDescription = 'Describe what the creator gets';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      title: form.title,
      offer: form.offer,
      promoCode: form.promoCode,
      startDate: form.startDate,
      endDate: form.endDate,
      compensationType: form.compensationType,
      priceMin: form.compensationType === 'barter' ? null : (parseInt(form.priceMin, 10) || null),
      priceMax: form.compensationType === 'barter' ? null : (parseInt(form.priceMax, 10) || null),
      barterDescription: form.compensationType === 'cash' ? '' : form.barterDescription.trim(),
      barterValue: form.compensationType === 'cash' || !form.barterValue
        ? null : (parseInt(form.barterValue, 10) || null),
    };
    try {
      await createCampaign(payload);
      setSuccess('Campaign created');
      setTimeout(() => {
        setCreateOpen(false);
        setForm({
          title: '', offer: '', promoCode: '', startDate: '', endDate: '',
          compensationType: 'cash', priceMin: '', priceMax: '',
          barterDescription: '', barterValue: '',
        });
        setSuccess('');
      }, 1100);
    } catch (err) {
      setErrors({ submit: err.message || 'Could not create campaign' });
    }
  };

  const handleAssign = async (campaignId, influencerId) => {
    try {
      await assignInfluencer(campaignId, influencerId);
    } finally {
      setAssignOpen(null);
    }
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setErrors({});
    setSuccess('');
  };

  return (
    <OwnerLayout title="My Campaigns">
      <div className="ob-camp">
        <div className="head">
          <div>
            <h1>My campaigns</h1>
            <div className="sub">{myCampaigns.length} campaign{myCampaigns.length !== 1 ? 's' : ''} for {user.business}</div>
          </div>
          <button className="btn-solid" onClick={() => setCreateOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            New campaign
          </button>
        </div>

        {myCampaigns.length > 0 && (
          <div className="filters">
            {['all', 'open', 'active', 'submitted'].map((k) => (
              <button key={k} className={'filter' + (filter === k ? ' active' : '')} onClick={() => setFilter(k)}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
                <b>{counts[k]}</b>
              </button>
            ))}
          </div>
        )}

        {myCampaigns.length === 0 ? (
          <div className="empty">
            <p>No campaigns yet. Create one and start receiving applications from creators.</p>
            <button className="btn-solid" onClick={() => setCreateOpen(true)}>Create your first campaign</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <p>No campaigns match this filter.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((c) => {
              const accApp = (c.applications || []).find((a) => a.influencerId === c.assignedInfluencer);
              const inf = (accApp && accApp.creator)
                || influencers.find((i) => i.id === c.assignedInfluencer);
              const apps = c.applications || [];
              const pendingCount = apps.filter((a) => a.status === 'pending').length;
              const acceptedCount = apps.filter((a) => a.status === 'accepted').length;
              const statusClass = c.submittedPost ? 'submitted' : c.status === 'active' ? 'active' : 'open';
              const statusLabel = c.submittedPost ? 'Submitted' : c.status;

              return (
                <div key={c.id} className="card">
                  <div className="row1">
                    <div className="logo">{(c.brand || 'B').charAt(0)}</div>
                    <span className={'pill ' + statusClass}>{statusLabel}</span>
                  </div>
                  <h3>{c.title}</h3>
                  <div className="brand">{c.brand}</div>
                  <p className="offer">{c.offer}</p>
                  <div className="meta">
                    <span><span className="k">Code</span><span className="code">{c.promoCode}</span></span>
                    <span><span className="k">Pay</span><span className="code">{formatCompensation(c)}</span></span>
                    <span><span className="k">Window</span>{c.startDate} → {c.endDate}</span>
                  </div>

                  <div className="stats">
                    <div className="s"><div className="l">Applicants</div><div className="v">{apps.length}</div></div>
                    <div className="s"><div className="l">Pending</div><div className="v pending">{pendingCount}</div></div>
                    <div className="s"><div className="l">Accepted</div><div className="v acc">{acceptedCount}</div></div>
                  </div>

                  {inf ? (
                    <div className="assigned">
                      <div className="av">{(inf.profile?.fullName || 'I').charAt(0)}</div>
                      <div className="who">
                        <b>{inf.profile?.fullName || inf.email}</b>
                        <span>@{inf.profile?.instagram} · {inf.profile?.followers}</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="actions">
                    <button className="btn-line" onClick={() => navigate(`/owner/applicants/${c.id}`)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                      Applicants ({apps.length})
                    </button>
                    {(c.status === 'submitted' || c.status === 'closed') ? (
                      <button className="btn-solid" onClick={() => navigate(`/owner/applicants/${c.id}`)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"/></svg>
                        Rate creator
                      </button>
                    ) : c.assignedInfluencer ? (
                      <button className="btn-line" onClick={() => navigate(`/owner/applicants/${c.id}`)} title="Manage / unassign on the applicants page">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                        Assigned
                      </button>
                    ) : (
                      <button className="btn-line" onClick={() => setAssignOpen(c.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M19 8v6M16 11h6"/></svg>
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {createOpen && (
        <div className="ob-modal-back" onClick={closeCreate}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={closeCreate} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>

            {success ? (
              <div className="ok-state">
                <div className="tick">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                </div>
                <h4>{success}</h4>
                <p>Your campaign is live and creators can start applying.</p>
              </div>
            ) : (
              <>
                <div className="m-kick">New campaign</div>
                <h3>Create a campaign</h3>
                <p className="m-sub">Define your offer and deliverables. Creators will see this and apply.</p>

                <form onSubmit={handleCreate}>
                  <div className="fld">
                    <label>Campaign title</label>
                    <input type="text" placeholder="e.g. Summer Brew Special"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    {errors.title && <div className="err">{errors.title}</div>}
                  </div>

                  <div className="fld">
                    <label>Offer description</label>
                    <textarea placeholder="e.g. 1 free coffee + 20% off for all followers"
                      value={form.offer}
                      onChange={(e) => setForm({ ...form, offer: e.target.value })} />
                    {errors.offer && <div className="err">{errors.offer}</div>}
                  </div>

                  <div className="fld">
                    <label>Promo code</label>
                    <input type="text" placeholder="e.g. BREW20"
                      value={form.promoCode}
                      onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })} />
                    {errors.promoCode && <div className="err">{errors.promoCode}</div>}
                  </div>

                  <div className="row2">
                    <div className="fld">
                      <label>Start date</label>
                      <input type="date" value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                      {errors.startDate && <div className="err">{errors.startDate}</div>}
                    </div>
                    <div className="fld">
                      <label>End date</label>
                      <input type="date" value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                      {errors.endDate && <div className="err">{errors.endDate}</div>}
                    </div>
                  </div>

                  {/* ---------- Compensation ---------- */}
                  <div className="fld">
                    <label>Compensation</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['cash', 'barter', 'mixed'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setForm({ ...form, compensationType: k })}
                          style={{
                            flex: 1, padding: '10px 12px', borderRadius: 8,
                            border: '1px solid ' + (form.compensationType === k ? 'var(--accent)' : 'var(--line-2)'),
                            background: form.compensationType === k ? 'var(--accent-soft)' : 'var(--surface-1)',
                            color: form.compensationType === k ? 'var(--accent)' : 'var(--fg-dim)',
                            fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer',
                          }}
                        >
                          {k === 'mixed' ? 'Cash + perks' : k}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.compensationType !== 'barter' && (
                    <div className="row2">
                      <div className="fld">
                        <label>Price min (₹)</label>
                        <input type="number" min="0" step="100" placeholder="5000"
                          value={form.priceMin}
                          onChange={(e) => setForm({ ...form, priceMin: e.target.value })} />
                        {errors.priceMin && <div className="err">{errors.priceMin}</div>}
                      </div>
                      <div className="fld">
                        <label>Price max (₹)</label>
                        <input type="number" min="0" step="100" placeholder="10000"
                          value={form.priceMax}
                          onChange={(e) => setForm({ ...form, priceMax: e.target.value })} />
                        {errors.priceMax && <div className="err">{errors.priceMax}</div>}
                      </div>
                    </div>
                  )}

                  {form.compensationType !== 'cash' && (
                    <>
                      <div className="fld">
                        <label>What the creator gets (perks / barter)</label>
                        <textarea placeholder="e.g. Free product hamper + 6-month subscription"
                          value={form.barterDescription}
                          onChange={(e) => setForm({ ...form, barterDescription: e.target.value })} />
                        {errors.barterDescription && <div className="err">{errors.barterDescription}</div>}
                      </div>
                      <div className="fld">
                        <label>Approx perk value (₹) <span style={{ color: 'var(--fg-mute)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· optional</span></label>
                        <input type="number" min="0" step="100" placeholder="2000"
                          value={form.barterValue}
                          onChange={(e) => setForm({ ...form, barterValue: e.target.value })} />
                      </div>
                    </>
                  )}

                  {errors.submit && <div className="err" style={{ marginTop: 6 }}>{errors.submit}</div>}

                  <div className="m-actions">
                    <button type="button" className="btn-line" onClick={closeCreate}>Cancel</button>
                    <button type="submit" className="btn-solid">Create campaign →</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Assign Influencer Modal */}
      {assignOpen && (
        <div className="ob-modal-back" onClick={() => setAssignOpen(null)}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <button className="x" onClick={() => setAssignOpen(null)} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
            <div className="m-kick">Assign creator</div>
            <h3>Pick an influencer</h3>
            <p className="m-sub">Skip the application queue and assign someone directly.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 380, overflow: 'auto', margin: '0 -6px' }}>
              {onboardedInfluencers.length === 0 ? (
                <p style={{ color: 'var(--fg-mute)', fontSize: 13, textAlign: 'center', padding: 24 }}>
                  No onboarded creators yet.
                </p>
              ) : (
                onboardedInfluencers.map((i) => (
                  <button key={i.id}
                    onClick={() => handleAssign(assignOpen, i.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line)',
                      background: 'var(--surface-faint)', textAlign: 'left', cursor: 'pointer',
                      transition: '.15s', color: 'var(--fg)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--accent-soft)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--surface-faint)'; }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, background: 'var(--accent)',
                      color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', fontWeight: 600
                    }}>{i.profile?.fullName?.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{i.profile?.fullName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-mute)', marginTop: 2 }}>
                        @{i.profile?.instagram} · {i.profile?.followers}
                      </div>
                    </div>
                    <span style={{ color: 'var(--accent)' }}>→</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
