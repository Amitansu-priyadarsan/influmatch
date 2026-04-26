import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfluencerLayout from '../../components/layouts/InfluencerLayout';
import { api } from '../../lib/api';

const CSS = `
.ib-brands{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.ib-brand{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:18px;cursor:pointer;transition:.18s;display:flex;flex-direction:column;gap:14px}
.ib-brand:hover{border-color:var(--accent-border);transform:translateY(-2px)}
.ib-brand .top{display:flex;gap:14px;align-items:center}
.ib-brand .logo{width:54px;height:54px;border-radius:12px;background:var(--surface-tint);border:1px solid var(--line-2);display:grid;place-items:center;color:var(--fg-mute);font-family:var(--serif);font-size:22px;flex:none;overflow:hidden}
.ib-brand .logo img{width:100%;height:100%;object-fit:cover}
.ib-brand h4{font-family:var(--serif);font-size:18px;margin:0;font-weight:500;line-height:1.2}
.ib-brand .meta{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-top:3px}
.ib-brand .desc{font-size:13.5px;color:var(--fg-dim);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ib-brand .row{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);padding-top:10px;border-top:1px solid var(--line)}
.ib-brand .row .accent{color:var(--accent)}
.ib-empty{padding:80px 20px;text-align:center;color:var(--fg-mute);font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;border:1px dashed var(--line);border-radius:14px}
.ib-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px;gap:18px;flex-wrap:wrap}
.ib-head h1{font-family:var(--serif);font-size:36px;margin:0;font-weight:400;letter-spacing:-.01em}
.ib-head h1 em{font-style:italic;color:var(--fg-dim)}
.ib-head p{color:var(--fg-dim);font-size:14px;margin:6px 0 0;max-width:520px}
`;

if (typeof document !== 'undefined' && !document.getElementById('ib-brands-styles')) {
  const tag = document.createElement('style');
  tag.id = 'ib-brands-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

export default function InfluencerBrowseBrands() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listBrands();
        if (!cancelled) setBrands(list || []);
      } catch {
        if (!cancelled) setBrands([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <InfluencerLayout title="Browse Brands">
      <div className="ib-head">
        <div>
          <h1>Discover <em>brands</em>.</h1>
          <p>Browse every business on InfluMatch — see who they are before a campaign drops, and pitch yourself to the ones you love.</p>
        </div>
        <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--fg-mute)', letterSpacing:'.14em', textTransform:'uppercase' }}>
          {brands.length} {brands.length === 1 ? 'brand' : 'brands'}
        </span>
      </div>

      {loading ? (
        <div className="ib-empty">Loading…</div>
      ) : brands.length === 0 ? (
        <div className="ib-empty">No brands have onboarded yet. Check back soon.</div>
      ) : (
        <div className="ib-brands">
          {brands.map((b) => {
            const p = b.profile || {};
            const initial = (p.business || 'B').charAt(0).toUpperCase();
            return (
              <div key={b.id} className="ib-brand" onClick={() => navigate(`/influencer/brands/${b.id}`)}>
                <div className="top">
                  <div className="logo">
                    {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : initial}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <h4>{p.business || 'Unnamed brand'}</h4>
                    <div className="meta">{p.category || 'Uncategorised'} · {p.city || '—'}</div>
                  </div>
                </div>
                {p.description && <div className="desc">{p.description}</div>}
                <div className="row">
                  <span>{p.budget ? `Budget: ${p.budget}` : 'Budget undisclosed'}</span>
                  <span className="accent">View profile →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </InfluencerLayout>
  );
}
