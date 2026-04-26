import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import PhotoGallery from '../../components/ui/PhotoGallery';
import { api } from '../../lib/api';

// Reuses pp-* styles defined by PublicBrandProfile if loaded; we redefine
// here too so this page renders standalone.
const CSS = `
.opp-shell{max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:24px}
.opp-back{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);cursor:pointer;display:inline-flex;gap:8px;align-items:center;width:fit-content}
.opp-back:hover{color:var(--accent)}
.opp-hero{border:1px solid var(--line);border-radius:18px;background:var(--bg-2);padding:28px;display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}
.opp-hero .pic{width:120px;height:120px;border-radius:50%;background:var(--surface-tint);border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:42px;color:var(--fg-mute);overflow:hidden;flex:none}
.opp-hero .pic img{width:100%;height:100%;object-fit:cover}
.opp-hero .info{flex:1;min-width:240px}
.opp-hero h1{font-family:var(--serif);font-size:40px;margin:0;font-weight:400;line-height:1.05;letter-spacing:-.01em}
.opp-hero h1 em{font-style:italic;color:var(--fg-dim)}
.opp-hero .pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.opp-pill{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;padding:6px 12px;border-radius:999px;border:1px solid var(--line-2);color:var(--fg-dim);background:var(--surface-faint)}
.opp-pill.accent{color:var(--accent);border-color:var(--accent-border);background:var(--accent-soft)}
.opp-section{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:22px}
.opp-section h3{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin:0 0 12px}
.opp-section p{font-size:14.5px;line-height:1.6;color:var(--fg);margin:0;white-space:pre-wrap}
.opp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.opp-stat{padding:14px 16px;border-radius:12px;background:var(--surface-faint);border:1px solid var(--line)}
.opp-stat .k{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:6px}
.opp-stat .v{font-family:var(--serif);font-size:18px;color:var(--fg);font-weight:400;word-break:break-word}
.opp-empty{color:var(--fg-mute);text-align:center;padding:60px;font-family:var(--mono);letter-spacing:.14em;text-transform:uppercase;font-size:12px}
.opp-gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.opp-gal img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px;border:1px solid var(--line);background:var(--surface-faint);cursor:zoom-in;transition:.15s}
.opp-gal img:hover{transform:scale(1.02);border-color:var(--accent)}
`;

if (typeof document !== 'undefined' && !document.getElementById('opp-styles')) {
  const tag = document.createElement('style');
  tag.id = 'opp-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

export default function PublicInfluencerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await api.getInfluencer(id);
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Could not load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const p = data?.profile || {};
  const initial = (p.fullName || 'C').charAt(0).toUpperCase();
  const platforms = p.platforms || {};
  const platformEntries = Object.entries(platforms);

  return (
    <OwnerLayout title={p.fullName || 'Creator'}>
      <div className="opp-shell">
        <span className="opp-back" onClick={() => navigate(-1)}>← Back</span>

        {loading ? (
          <div className="opp-empty">Loading…</div>
        ) : err ? (
          <div className="opp-empty">{err}</div>
        ) : (
          <>
            <div className="opp-hero">
              <div className="pic">
                {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : initial}
              </div>
              <div className="info">
                <h1>{p.fullName || 'Unnamed creator'}</h1>
                <div className="pills">
                  {p.niche && <span className="opp-pill accent">{p.niche}</span>}
                  {(p.niches || []).filter((n) => n !== p.niche).map((n) => (
                    <span key={n} className="opp-pill">{n}</span>
                  ))}
                  {p.city && <span className="opp-pill">📍 {p.city}</span>}
                  {p.followers && <span className="opp-pill">{p.followers} followers</span>}
                  {data?.rating?.score != null && (
                    <span className="opp-pill">★ {data.rating.score.toFixed(1)} ({data.rating.count})</span>
                  )}
                </div>
              </div>
            </div>

            {p.bio && (
              <div className="opp-section">
                <h3>Bio</h3>
                <p>{p.bio}</p>
              </div>
            )}

            {(p.gallery || []).length > 0 && (
              <div className="opp-section">
                <h3>Portfolio</h3>
                <PhotoGallery photos={p.gallery} />
              </div>
            )}

            {platformEntries.length > 0 && (
              <div className="opp-section">
                <h3>Platforms</h3>
                <div className="opp-grid">
                  {platformEntries.map(([name, info]) => (
                    <div key={name} className="opp-stat">
                      <div className="k">{name}</div>
                      <div className="v">
                        {info?.handle || '—'}
                        {info?.followers && (
                          <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--fg-mute)', letterSpacing:'.14em', marginTop:4 }}>
                            {info.followers} followers
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </OwnerLayout>
  );
}
