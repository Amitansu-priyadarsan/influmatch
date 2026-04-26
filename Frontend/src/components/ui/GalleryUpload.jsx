import { useRef, useState } from 'react';
import ImageCropper from './ImageCropper';

/**
 * GalleryUpload — up to 5 photo slots for portfolio / product shots.
 * Each picked image goes through the ImageCropper before being committed.
 */
const GU_CSS = `
.gu{display:flex;flex-direction:column;gap:10px}
.gu .row{display:flex;gap:10px;flex-wrap:wrap}
.gu .slot{position:relative;width:110px;height:110px;border-radius:12px;border:1.5px dashed var(--line-2);background:var(--surface-faint);overflow:hidden;cursor:pointer;transition:.15s;display:grid;place-items:center;color:var(--fg-mute);flex:none}
.gu .slot:hover{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
.gu .slot.has{border-style:solid;border-color:var(--line);cursor:default}
.gu .slot img{width:100%;height:100%;object-fit:cover;display:block}
.gu .slot .plus{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;text-align:center;line-height:1.4;padding:0 8px}
.gu .slot .x{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;display:grid;place-items:center;border:0;cursor:pointer;opacity:0;transition:.15s}
.gu .slot.has:hover .x{opacity:1}
.gu .slot .x svg{width:12px;height:12px}
.gu .meta{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);display:flex;justify-content:space-between;align-items:center}
.gu .meta b{color:var(--accent)}
.gu .hint{font-size:12.5px;color:var(--fg-dim);line-height:1.45}
.gu .err{color:var(--danger);font-family:var(--mono);font-size:11px;letter-spacing:.08em}
.gu input[type=file]{display:none}
`;

if (typeof document !== 'undefined' && !document.getElementById('gu-styles')) {
  const tag = document.createElement('style');
  tag.id = 'gu-styles';
  tag.textContent = GU_CSS;
  document.head.appendChild(tag);
}

const MAX = 5;
const MAX_BYTES = 14 * 1024 * 1024;

export default function GalleryUpload({ value = [], onChange, hint }) {
  const inputRef = useRef(null);
  const [err, setErr] = useState('');
  const [queue, setQueue] = useState([]);     // remaining object URLs awaiting crop
  const [current, setCurrent] = useState(null); // active object URL in cropper

  const items = Array.isArray(value) ? value : [];
  const canAdd = items.length < MAX;

  const onPick = () => inputRef.current?.click();

  const startQueue = (urls) => {
    if (!urls.length) return;
    const [first, ...rest] = urls;
    setQueue(rest);
    setCurrent(first);
  };

  const onFiles = (e) => {
    setErr('');
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const room = MAX - items.length;
    const slice = files.slice(0, room);
    for (const f of slice) {
      if (f.size > MAX_BYTES) { setErr('One of those images is too large (limit 14 MB).'); return; }
    }
    startQueue(slice.map((f) => URL.createObjectURL(f)));
  };

  const cleanupCurrent = () => {
    if (current) URL.revokeObjectURL(current);
    setCurrent(null);
  };

  const advance = (committed) => {
    cleanupCurrent();
    const next = queue;
    if (committed != null) {
      onChange([...items, committed].slice(0, MAX));
    }
    if (next.length) {
      const [head, ...tail] = next;
      setQueue(tail);
      setCurrent(head);
    } else {
      setQueue([]);
    }
  };

  const skipAll = () => {
    queue.forEach((u) => URL.revokeObjectURL(u));
    setQueue([]);
    cleanupCurrent();
  };

  const removeAt = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <>
      <div className="gu">
        <div className="row">
          {items.map((src, i) => (
            <div key={i} className="slot has">
              <img src={src} alt="" />
              <button type="button" className="x" onClick={() => removeAt(i)} aria-label="Remove photo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
          ))}
          {canAdd && (
            <div className="slot" onClick={onPick}>
              <span className="plus">＋<br/>Add photo</span>
            </div>
          )}
        </div>
        <div className="meta">
          <span><b>{items.length}</b> / {MAX} photos</span>
          {err && <span className="err">{err}</span>}
        </div>
        {hint && <div className="hint">{hint}</div>}
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFiles} />
      </div>

      {current && (
        <ImageCropper
          src={current}
          shape="square"
          outputSize={1000}
          title={`Crop photo${queue.length ? ` · ${queue.length + 1} in queue` : ''}`}
          onApply={(dataUrl) => advance(dataUrl)}
          onCancel={() => { skipAll(); }}
        />
      )}
    </>
  );
}
