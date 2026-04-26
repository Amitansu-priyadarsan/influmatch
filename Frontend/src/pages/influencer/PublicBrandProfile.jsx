import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InfluencerLayout from '../../components/layouts/InfluencerLayout';
import PhotoGallery from '../../components/ui/PhotoGallery';
import { api } from '../../lib/api';

const CSS = `
.pp-shell{max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:24px}
.pp-back{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);cursor:pointer;display:inline-flex;gap:8px;align-items:center;width:fit-content}
.pp-back:hover{color:var(--accent)}
.pp-hero{border:1px solid var(--line);border-radius:18px;background:var(--bg-2);padding:28px;display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}
.pp-hero .pic{width:120px;height:120px;border-radius:18px;background:var(--surface-tint);border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:42px;color:var(--fg-mute);overflow:hidden;flex:none}
.pp-hero .pic.round{border-radius:50%}
.pp-hero .pic img{width:100%;height:100%;object-fit:cover}
.pp-hero .info{flex:1;min-width:240px}
.pp-hero h1{font-family:var(--serif);font-size:40px;margin:0;font-weight:400;line-height:1.05;letter-spacing:-.01em}
.pp-hero h1 em{font-style:italic;color:var(--fg-dim)}
.pp-hero .pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.pp-pill{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;padding:6px 12px;border-radius:999px;border:1px solid var(--line-2);color:var(--fg-dim);background:var(--surface-faint)}
.pp-pill.accent{color:var(--accent);border-color:var(--accent-border);background:var(--accent-soft)}
.pp-section{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:22px}
.pp-section h3{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin:0 0 12px}
.pp-section p{font-size:14.5px;line-height:1.6;color:var(--fg);margin:0;white-space:pre-wrap}
.pp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.pp-stat{padding:14px 16px;border-radius:12px;background:var(--surface-faint);border:1px solid var(--line)}
.pp-stat .k{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:6px}
.pp-stat .v{font-family:var(--serif);font-size:20px;color:var(--fg);font-weight:400}
.pp-stat .v a{color:var(--accent);font-size:14px;font-family:var(--sans)}
.pp-empty{color:var(--fg-mute);text-align:center;padding:60px;font-family:var(--mono);letter-spacing:.14em;text-transform:uppercase;font-size:12px}
.pp-gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.pp-gal img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px;border:1px solid var(--line);background:var(--surface-faint);cursor:zoom-in;transition:.15s}
.pp-gal img:hover{transform:scale(1.02);border-color:var(--accent)}

.pp-cta{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
.pp-cta .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:999px;font-size:13.5px;font-weight:500;border:1px solid transparent;cursor:pointer;transition:.15s;font-family:var(--sans)}
.pp-cta .btn-line{border-color:var(--line-2);color:var(--fg);background:var(--surface-1)}
.pp-cta .btn-line:hover{background:var(--surface-1-hover)}
.pp-cta .btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:500}
.pp-cta .btn-solid:hover{filter:brightness(1.08);transform:translateY(-1px)}

.pp-modal-back{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);display:grid;place-items:center;padding:20px}
.pp-modal{width:min(560px,100%);max-height:calc(100vh - 40px);background:var(--bg-2);color:var(--fg);border:1px solid var(--line);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;font-family:var(--sans);box-shadow:0 40px 90px -20px rgba(0,0,0,.6)}
.pp-modal h4{font-family:var(--serif);font-size:24px;margin:0;font-weight:400;letter-spacing:-.01em}
.pp-modal h4 em{font-style:italic;color:var(--fg-dim)}
.pp-modal .head{padding:22px 24px 8px}
.pp-modal .head .sub{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:8px}
.pp-modal .body{padding:14px 24px;flex:1;overflow:auto}
.pp-modal textarea{width:100%;min-height:240px;border-radius:12px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:16px 18px;font-family:var(--sans);font-size:14.5px;outline:none;line-height:1.6;resize:vertical;transition:.15s}
.pp-modal textarea:focus{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 3px rgba(212,244,52,0.08)}
.pp-modal .err{color:var(--danger);font-family:var(--mono);font-size:11px;letter-spacing:.08em;margin-top:8px}
.pp-modal .foot{padding:14px 24px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:14px;background:var(--bg)}
.pp-modal .foot .info{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute)}
.pp-modal .actions{display:inline-flex;gap:14px;align-items:center}
.pp-modal .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:999px;font-size:13.5px;font-weight:500;cursor:pointer;transition:.15s;font-family:var(--sans);white-space:nowrap;border:1px solid var(--line-2)}
.pp-modal .btn-line{color:var(--fg);background:var(--surface-1)}
.pp-modal .btn-line:hover:not(:disabled){background:var(--surface-1-hover);border-color:var(--fg-mute);color:var(--fg)}
.pp-modal .btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:600;border-color:var(--accent)}
.pp-modal .btn-solid:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px);border-color:var(--accent)}
.pp-modal .btn:disabled{opacity:.45;cursor:not-allowed;filter:none;transform:none}

@media (max-width:640px){
  .pp-modal{width:100%;border-radius:14px}
  .pp-modal .head{padding:20px 20px 6px}
  .pp-modal h4{font-size:22px}
  .pp-modal .body{padding:12px 20px}
  .pp-modal .foot{padding:12px 20px;flex-wrap:wrap}
  .pp-modal textarea{min-height:200px}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('pp-styles')) {
  const tag = document.createElement('style');
  tag.id = 'pp-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

export default function PublicBrandProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/influencer/brands';
  const returnLabel = location.state?.returnLabel || 'Back to brands';
  const [pitchOpen, setPitchOpen] = useState(false);
  const [pitchBody, setPitchBody] = useState('');
  const [pitchErr, setPitchErr] = useState('');
  const [sending, setSending] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await api.getBrand(id);
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Could not load brand');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const p = data?.profile || {};
  const initial = (p.business || 'B').charAt(0).toUpperCase();

  return (
    <InfluencerLayout title={p.business || 'Brand'}>
      <div className="pp-shell">
        <span className="pp-back" onClick={() => navigate(returnTo)}>← {returnLabel}</span>

        {loading ? (
          <div className="pp-empty">Loading…</div>
        ) : err ? (
          <div className="pp-empty">{err}</div>
        ) : (
          <>
            <div className="pp-hero">
              <div className="pic">
                {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : initial}
              </div>
              <div className="info">
                <h1>{p.business || 'Unnamed brand'}</h1>
                <div className="pills">
                  {p.category && <span className="pp-pill accent">{p.category}</span>}
                  {p.city && <span className="pp-pill">📍 {p.city}</span>}
                  {p.budget && <span className="pp-pill">💰 {p.budget}</span>}
                  {data?.rating?.score != null && (
                    <span className="pp-pill">★ {data.rating.score.toFixed(1)} ({data.rating.count})</span>
                  )}
                </div>
                <div className="pp-cta">
                  <button className="btn btn-solid" onClick={() => { setPitchErr(''); setPitchOpen(true); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
                    Send a pitch
                  </button>
                </div>
              </div>
            </div>

            {p.description && (
              <div className="pp-section">
                <h3>About the brand</h3>
                <p>{p.description}</p>
              </div>
            )}

            {(p.gallery || []).length > 0 && (
              <div className="pp-section">
                <h3>Brand photos</h3>
                <PhotoGallery photos={p.gallery} />
              </div>
            )}

            <div className="pp-section">
              <h3>Details</h3>
              <div className="pp-grid">
                {p.website && (
                  <div className="pp-stat">
                    <div className="k">Website</div>
                    <div className="v"><a href={p.website} target="_blank" rel="noreferrer">{p.website.replace(/^https?:\/\//, '')}</a></div>
                  </div>
                )}
                <div className="pp-stat">
                  <div className="k">Typical budget</div>
                  <div className="v">{p.budget || '—'}</div>
                </div>
                <div className="pp-stat">
                  <div className="k">Category</div>
                  <div className="v">{p.category || '—'}</div>
                </div>
                <div className="pp-stat">
                  <div className="k">City</div>
                  <div className="v">{p.city || '—'}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {pitchOpen && (
        <div className="pp-modal-back" onClick={() => !sending && setPitchOpen(false)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="head">
              <div className="sub">Pitch · {p.business || 'this brand'}</div>
              <h4>Send your <em>opening message.</em></h4>
            </div>
            <div className="body">
              <textarea
                placeholder="Hi! I'm a [niche] creator with [reach]. Here's why I think we'd be a great fit…"
                value={pitchBody}
                onChange={(e) => setPitchBody(e.target.value)}
                autoFocus
                disabled={sending}
              />
              {pitchErr && <div className="err">{pitchErr}</div>}
            </div>
            <div className="foot">
              <span className="info">{pitchBody.trim().length} / 4000</span>
              <div className="actions">
                <button className="btn btn-line" onClick={() => setPitchOpen(false)} disabled={sending}>Cancel</button>
                <button
                  className="btn btn-solid"
                  disabled={sending || !pitchBody.trim()}
                  onClick={async () => {
                    setSending(true); setPitchErr('');
                    try {
                      const thread = await api.startPitch({ brandId: id, body: pitchBody.trim() });
                      navigate(`/influencer/pitches/${thread.id}`);
                    } catch (e) {
                      setPitchErr(e.message || 'Could not send pitch.');
                    } finally {
                      setSending(false);
                    }
                  }}
                >
                  {sending ? 'Sending…' : 'Send pitch →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </InfluencerLayout>
  );
}
