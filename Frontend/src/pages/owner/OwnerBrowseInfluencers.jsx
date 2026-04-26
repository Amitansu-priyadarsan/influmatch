import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import { api } from '../../lib/api';

const CSS = `
.obi-head{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;flex-wrap:wrap;margin-bottom:24px}
.obi-head h1{font-family:var(--serif);font-size:36px;margin:0;font-weight:400;letter-spacing:-.01em}
.obi-head h1 em{font-style:italic;color:var(--fg-dim)}
.obi-head p{color:var(--fg-dim);font-size:14px;margin:6px 0 0;max-width:520px}
.obi-count{font-family:var(--mono);font-size:11px;color:var(--fg-mute);letter-spacing:.14em;text-transform:uppercase}

.obi-toolbar{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;margin-bottom:16px;background:var(--bg-2);border:1px solid var(--line);border-radius:14px;padding:14px}
.obi-search{position:relative}
.obi-search input{width:100%;height:42px;border-radius:10px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:0 14px 0 40px;font-family:var(--sans);font-size:14px;outline:none;transition:.15s}
.obi-search input:focus{border-color:var(--accent);background:var(--accent-soft)}
.obi-search svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--fg-mute)}

.obi-clear{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);background:transparent;border:1px solid var(--line);padding:8px 14px;border-radius:999px;cursor:pointer;transition:.15s;white-space:nowrap}
.obi-clear:hover{color:var(--accent);border-color:var(--accent)}
.obi-clear:disabled{opacity:.4;cursor:not-allowed}

.obi-filters{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px}
.obi-fgroup{display:flex;flex-direction:column;gap:6px;min-width:170px}
.obi-fgroup .lbl{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute)}
.obi-fgroup select{height:38px;border-radius:8px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:0 12px;font-family:var(--sans);font-size:13px;outline:none;cursor:pointer;transition:.15s}
.obi-fgroup select:focus{border-color:var(--accent)}
.obi-chiprow{display:flex;gap:6px;flex-wrap:wrap}
.obi-chip{padding:7px 12px;border-radius:999px;border:1px solid var(--line-2);background:var(--surface-1);font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim);cursor:pointer;transition:.15s}
.obi-chip:hover{color:var(--fg)}
.obi-chip.active{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}

.obi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.obi-card{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:18px;cursor:pointer;transition:.18s;display:flex;flex-direction:column;gap:14px}
.obi-card:hover{border-color:var(--accent-border);transform:translateY(-2px)}
.obi-card .top{display:flex;gap:12px;align-items:center}
.obi-card .av{width:54px;height:54px;border-radius:50%;background:var(--surface-tint);border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:22px;color:var(--fg-mute);overflow:hidden;flex:none}
.obi-card .av img{width:100%;height:100%;object-fit:cover}
.obi-card h4{font-family:var(--serif);font-size:18px;margin:0;font-weight:500;line-height:1.2}
.obi-card .meta{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-top:3px}
.obi-card .bio{font-size:13.5px;color:var(--fg-dim);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:40px}
.obi-card .pills{display:flex;gap:6px;flex-wrap:wrap}
.obi-pill{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;border-radius:999px;border:1px solid var(--line-2);color:var(--fg-dim);background:var(--surface-faint)}
.obi-pill.accent{color:var(--accent);border-color:var(--accent-border);background:var(--accent-soft)}
.obi-card .row{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);padding-top:10px;border-top:1px solid var(--line)}
.obi-card .row .accent{color:var(--accent)}
.obi-card .stars{color:var(--accent);letter-spacing:.05em}

.obi-empty{padding:80px 20px;text-align:center;color:var(--fg-mute);font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;border:1px dashed var(--line);border-radius:14px}

.obi-pager{display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding-top:18px;border-top:1px solid var(--line);flex-wrap:wrap;gap:14px}
.obi-pager .nums{display:flex;gap:6px;flex-wrap:wrap}
.obi-pager .pbtn{min-width:36px;height:36px;padding:0 12px;border-radius:8px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg-dim);font-family:var(--mono);font-size:12px;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;justify-content:center}
.obi-pager .pbtn:hover:not(:disabled){color:var(--fg);border-color:var(--accent-border)}
.obi-pager .pbtn.active{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:600}
.obi-pager .pbtn:disabled{opacity:.4;cursor:not-allowed}
.obi-pager .info{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}

@media (max-width:760px){
  .obi-toolbar{grid-template-columns:1fr}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('obi-styles')) {
  const tag = document.createElement('style');
  tag.id = 'obi-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

const PAGE_SIZE = 12;
const PLATFORM_OPTIONS = ['instagram', 'youtube', 'tiktok', 'twitter', 'linkedin', 'substack'];

// Parse "45K", "1.2M", "3,400" → number for tier comparison.
function parseFollowerCount(s) {
  if (!s) return 0;
  const cleaned = String(s).trim().replace(/,/g, '').toUpperCase();
  const m = cleaned.match(/^([\d.]+)\s*([KMB]?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (isNaN(n)) return 0;
  const mul = m[2] === 'B' ? 1e9 : m[2] === 'M' ? 1e6 : m[2] === 'K' ? 1e3 : 1;
  return n * mul;
}

const TIERS = [
  { id: 'any',   label: 'Any size',     min: 0,        max: Infinity },
  { id: 'nano',  label: '< 10K',        min: 0,        max: 10_000 },
  { id: 'micro', label: '10K – 100K',   min: 10_000,   max: 100_000 },
  { id: 'mid',   label: '100K – 1M',    min: 100_000,  max: 1_000_000 },
  { id: 'mega',  label: '1M+',          min: 1_000_000,max: Infinity },
];

const RATING_OPTIONS = [
  { id: 'any', label: 'Any rating', min: 0 },
  { id: '3',   label: '3★ +',       min: 3 },
  { id: '4',   label: '4★ +',       min: 4 },
  { id: '5',   label: '5★ only',    min: 5 },
];

const SORT_OPTIONS = [
  { id: 'name',     label: 'Name (A → Z)' },
  { id: 'rating',   label: 'Rating (high → low)' },
  { id: 'reach',    label: 'Followers (high → low)' },
];

export default function OwnerBrowseInfluencers() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [platform, setPlatform] = useState('');
  const [tier, setTier] = useState('any');
  const [rating, setRating] = useState('any');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.listInfluencers();
        if (!cancelled) setList(data || []);
      } catch {
        if (!cancelled) setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Reset page whenever filters change
  useEffect(() => { setPage(1); }, [q, niche, city, platform, tier, rating, sort]);

  // Build dropdown options from data
  const niches = useMemo(() => {
    const s = new Set();
    for (const i of list) {
      const p = i.profile;
      if (!p) continue;
      if (p.niche) s.add(p.niche);
      (p.niches || []).forEach((n) => n && s.add(n));
    }
    return Array.from(s).sort();
  }, [list]);

  const cities = useMemo(() => {
    const s = new Set();
    for (const i of list) {
      if (i.profile?.city) s.add(i.profile.city);
    }
    return Array.from(s).sort();
  }, [list]);

  const tierMeta = TIERS.find((t) => t.id === tier) || TIERS[0];
  const ratingMin = (RATING_OPTIONS.find((r) => r.id === rating) || RATING_OPTIONS[0]).min;
  const needle = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    return list.filter((i) => {
      const p = i.profile || {};
      // Search across name, bio, niche, instagram, city
      if (needle) {
        const hay = [
          p.fullName, p.bio, p.niche, (p.niches || []).join(' '),
          p.instagram, p.city, i.email,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (niche) {
        const all = [p.niche, ...(p.niches || [])].filter(Boolean);
        if (!all.includes(niche)) return false;
      }
      if (city && p.city !== city) return false;
      if (platform) {
        const has = (p.platforms && p.platforms[platform]) || (platform === 'instagram' && p.instagram);
        if (!has) return false;
      }
      if (tier !== 'any') {
        const reach = parseFollowerCount(p.followers);
        if (reach < tierMeta.min || reach >= tierMeta.max) return false;
      }
      if (ratingMin > 0) {
        const score = i.rating?.score;
        if (score == null || score < ratingMin) return false;
      }
      return true;
    });
  }, [list, needle, niche, city, platform, tier, tierMeta.min, tierMeta.max, ratingMin]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const ap = a.profile || {};
      const bp = b.profile || {};
      if (sort === 'name') return (ap.fullName || '').localeCompare(bp.fullName || '');
      if (sort === 'rating') {
        const as = a.rating?.score ?? -1;
        const bs = b.rating?.score ?? -1;
        if (bs !== as) return bs - as;
        return (a.rating?.count || 0) > (b.rating?.count || 0) ? -1 : 1;
      }
      if (sort === 'reach') {
        return parseFollowerCount(bp.followers) - parseFollowerCount(ap.followers);
      }
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const filtersActive = !!(q || niche || city || platform || tier !== 'any' || rating !== 'any');
  const reset = () => {
    setQ(''); setNiche(''); setCity(''); setPlatform('');
    setTier('any'); setRating('any');
  };

  const pagerNumbers = useMemo(() => {
    const window = 2;
    const nums = new Set([1, totalPages, safePage]);
    for (let d = -window; d <= window; d++) {
      const n = safePage + d;
      if (n >= 1 && n <= totalPages) nums.add(n);
    }
    return Array.from(nums).sort((a, b) => a - b);
  }, [safePage, totalPages]);

  return (
    <OwnerLayout title="Browse Creators">
      <div className="obi-head">
        <div>
          <h1>Browse <em>creators.</em></h1>
          <p>Search every onboarded creator on InfluMatch — filter by niche, location, platform, reach, and rating to scout the right fit before you launch a brief.</p>
        </div>
        <span className="obi-count">
          {loading ? 'Loading…' : `${sorted.length} match${sorted.length === 1 ? '' : 'es'}`}
        </span>
      </div>

      <div className="obi-toolbar">
        <div className="obi-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, niche, handle, city…"
          />
        </div>
        <button className="obi-clear" onClick={reset} disabled={!filtersActive}>
          Clear filters
        </button>
      </div>

      <div className="obi-filters">
        <div className="obi-fgroup">
          <span className="lbl">Niche</span>
          <select value={niche} onChange={(e) => setNiche(e.target.value)}>
            <option value="">All niches</option>
            {niches.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="obi-fgroup">
          <span className="lbl">City</span>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Anywhere</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="obi-fgroup">
          <span className="lbl">Platform</span>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">Any platform</option>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="obi-fgroup">
          <span className="lbl">Followers</span>
          <div className="obi-chiprow">
            {TIERS.map((t) => (
              <button key={t.id} className={'obi-chip' + (tier === t.id ? ' active' : '')} onClick={() => setTier(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="obi-fgroup">
          <span className="lbl">Rating</span>
          <div className="obi-chiprow">
            {RATING_OPTIONS.map((r) => (
              <button key={r.id} className={'obi-chip' + (rating === r.id ? ' active' : '')} onClick={() => setRating(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="obi-fgroup">
          <span className="lbl">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="obi-empty">Loading creators…</div>
      ) : sorted.length === 0 ? (
        <div className="obi-empty">No creators match your filters.</div>
      ) : (
        <>
          <div className="obi-grid">
            {slice.map((i) => {
              const p = i.profile || {};
              const initial = (p.fullName || 'C').charAt(0).toUpperCase();
              const score = i.rating?.score;
              return (
                <div key={i.id} className="obi-card" onClick={() => navigate(`/owner/influencers/${i.id}`)}>
                  <div className="top">
                    <div className="av">
                      {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : initial}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4>{p.fullName || 'Unnamed creator'}</h4>
                      <div className="meta">
                        {p.instagram ? `@${p.instagram.replace(/^@/, '')}` : (p.niche || 'Creator')}
                        {p.city ? ` · ${p.city}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="pills">
                    {p.niche && <span className="obi-pill accent">{p.niche}</span>}
                    {(p.niches || []).filter((n) => n !== p.niche).slice(0, 2).map((n) => (
                      <span key={n} className="obi-pill">{n}</span>
                    ))}
                    {p.followers && <span className="obi-pill">{p.followers}</span>}
                  </div>
                  {p.bio && <div className="bio">{p.bio}</div>}
                  <div className="row">
                    <span className="stars">
                      {score != null ? `★ ${score.toFixed(1)} (${i.rating.count})` : 'No ratings yet'}
                    </span>
                    <span className="accent">View profile →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="obi-pager">
              <span className="info">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length}
              </span>
              <div className="nums">
                <button className="pbtn" onClick={() => setPage(safePage - 1)} disabled={safePage === 1}>‹ Prev</button>
                {pagerNumbers.map((n, idx) => {
                  const prev = pagerNumbers[idx - 1];
                  const gap = prev != null && n - prev > 1;
                  return (
                    <span key={n} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      {gap && <span style={{ color: 'var(--fg-mute)', padding: '0 4px' }}>…</span>}
                      <button
                        className={'pbtn' + (n === safePage ? ' active' : '')}
                        onClick={() => setPage(n)}
                      >{n}</button>
                    </span>
                  );
                })}
                <button className="pbtn" onClick={() => setPage(safePage + 1)} disabled={safePage === totalPages}>Next ›</button>
              </div>
            </div>
          )}
        </>
      )}
    </OwnerLayout>
  );
}
