import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
        <span className="pp-back" onClick={() => navigate('/influencer/brands')}>← Back to brands</span>

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
    </InfluencerLayout>
  );
}
