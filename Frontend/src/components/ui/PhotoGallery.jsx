import { useEffect, useState } from 'react';

/**
 * PhotoGallery — display up to 5 images with a featured-first layout
 * and a click-to-zoom lightbox. Pure read-only viewer; pair with
 * GalleryUpload for editing.
 */
const PG_CSS = `
.pg-wrap{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.pg-wrap.count-1{grid-template-columns:repeat(5,1fr)}
.pg-wrap.count-2{grid-template-columns:repeat(2,1fr);max-width:520px}
.pg-wrap.count-3{grid-template-columns:repeat(3,1fr)}
.pg-wrap.count-4{grid-template-columns:repeat(4,1fr)}
.pg-wrap.count-5{grid-template-columns:repeat(5,1fr)}
.pg-wrap.count-1 .pg-cell{max-width:280px}
.pg-cell{position:relative;overflow:hidden;cursor:zoom-in;background:var(--surface-tint);border-radius:12px;aspect-ratio:1/1;border:1px solid var(--line)}
.pg-cell img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s ease}
.pg-cell:hover img{transform:scale(1.05)}
.pg-cell::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 65%,rgba(0,0,0,.25) 100%);opacity:0;transition:.2s;pointer-events:none}
.pg-cell:hover::after{opacity:1}
.pg-cell:hover{border-color:var(--accent)}

@media (max-width:720px){
  .pg-wrap,.pg-wrap.count-3,.pg-wrap.count-4,.pg-wrap.count-5{grid-template-columns:repeat(3,1fr)}
  .pg-wrap.count-2{grid-template-columns:repeat(2,1fr)}
  .pg-wrap.count-1 .pg-cell{max-width:none}
}

.pg-empty{padding:50px;text-align:center;border:1px dashed var(--line-2);border-radius:14px;color:var(--fg-mute);font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;background:var(--surface-faint)}

.pg-lb{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.92);backdrop-filter:blur(8px);display:grid;place-items:center;padding:24px}
.pg-lb-img{max-width:min(1100px,100%);max-height:calc(100vh - 120px);border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,.5);object-fit:contain;background:#000}
.pg-lb-close{position:fixed;top:24px;right:24px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;cursor:pointer;display:grid;place-items:center;backdrop-filter:blur(6px)}
.pg-lb-close:hover{background:rgba(255,255,255,.22)}
.pg-lb-arrow{position:fixed;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;cursor:pointer;display:grid;place-items:center;backdrop-filter:blur(6px);font-family:var(--mono);font-size:20px}
.pg-lb-arrow:hover{background:rgba(255,255,255,.22)}
.pg-lb-arrow.l{left:24px}
.pg-lb-arrow.r{right:24px}
.pg-lb-count{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.7);padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15)}

@media (max-width:640px){
  .pg-lb-arrow.l{left:8px}
  .pg-lb-arrow.r{right:8px}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('pg-styles')) {
  const tag = document.createElement('style');
  tag.id = 'pg-styles';
  tag.textContent = PG_CSS;
  document.head.appendChild(tag);
}

export default function PhotoGallery({ photos = [], emptyText = 'No photos yet.' }) {
  const list = Array.isArray(photos) ? photos.filter(Boolean).slice(0, 5) : [];
  const [openAt, setOpenAt] = useState(-1);

  useEffect(() => {
    if (openAt < 0) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenAt(-1);
      else if (e.key === 'ArrowRight') setOpenAt((i) => (i + 1) % list.length);
      else if (e.key === 'ArrowLeft') setOpenAt((i) => (i - 1 + list.length) % list.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openAt, list.length]);

  if (list.length === 0) return <div className="pg-empty">{emptyText}</div>;

  return (
    <>
      <div className={`pg-wrap count-${list.length}`}>
        {list.map((src, i) => (
          <div key={i} className="pg-cell" onClick={() => setOpenAt(i)}>
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>

      {openAt >= 0 && (
        <div className="pg-lb" onClick={() => setOpenAt(-1)}>
          <img className="pg-lb-img" src={list[openAt]} alt="" onClick={(e) => e.stopPropagation()} />
          <button className="pg-lb-close" onClick={(e) => { e.stopPropagation(); setOpenAt(-1); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          {list.length > 1 && (
            <>
              <button className="pg-lb-arrow l" onClick={(e) => { e.stopPropagation(); setOpenAt((i) => (i - 1 + list.length) % list.length); }}>‹</button>
              <button className="pg-lb-arrow r" onClick={(e) => { e.stopPropagation(); setOpenAt((i) => (i + 1) % list.length); }}>›</button>
              <div className="pg-lb-count">{openAt + 1} / {list.length}</div>
            </>
          )}
        </div>
      )}
    </>
  );
}
