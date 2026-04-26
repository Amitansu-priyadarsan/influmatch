import { useRef, useState } from 'react';

/**
 * AvatarUpload — circular photo picker with phone camera support.
 *
 * Reads a chosen image, downscales it to ~512px on the longest edge, and
 * returns a JPEG data URL via `onChange(dataUrl)`. Cheap-and-cheerful: the
 * resulting string lives in `avatar_url text` on the profile row, no
 * object storage needed.
 */
const AVATAR_CSS = `
.avu{display:flex;gap:18px;align-items:center}
.avu .ring{width:96px;height:96px;border-radius:50%;border:1.5px dashed var(--line-2);background:var(--surface-faint);display:grid;place-items:center;overflow:hidden;flex:none;position:relative;color:var(--fg-mute)}
.avu .ring.has{border-style:solid;border-color:var(--accent)}
.avu .ring img{width:100%;height:100%;object-fit:cover;display:block}
.avu .ring .ph{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;text-align:center;padding:0 8px;line-height:1.4}
.avu .col{display:flex;flex-direction:column;gap:6px}
.avu .row{display:flex;gap:10px;flex-wrap:wrap}
.avu .b{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;border:1px solid var(--line-2);background:var(--surface-1);font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg);cursor:pointer;transition:.15s}
.avu .b:hover{background:var(--surface-1-hover);border-color:var(--accent-border)}
.avu .b.danger:hover{color:var(--danger);border-color:var(--danger)}
.avu .hint{font-size:12px;color:var(--fg-dim);line-height:1.45}
.avu .err{color:var(--danger);font-family:var(--mono);font-size:11px;letter-spacing:.08em;margin-top:2px}
.avu input[type=file]{display:none}
`;

if (typeof document !== 'undefined' && !document.getElementById('avu-styles')) {
  const tag = document.createElement('style');
  tag.id = 'avu-styles';
  tag.textContent = AVATAR_CSS;
  document.head.appendChild(tag);
}

const MAX_EDGE = 512;
const MAX_BYTES = 8 * 1024 * 1024; // raw input cap before downscale

async function fileToScaledDataUrl(file) {
  if (file.size > MAX_BYTES) throw new Error('Image is too large. Pick something under 8 MB.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('Could not read this image.'));
      i.src = url;
    });
    const { width, height } = img;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function AvatarUpload({ value, onChange, label, hint, shape = 'circle' }) {
  const inputRef = useRef(null);
  const [err, setErr] = useState('');

  const pick = () => inputRef.current?.click();

  const onFile = async (e) => {
    setErr('');
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const dataUrl = await fileToScaledDataUrl(f);
      onChange(dataUrl);
    } catch (ex) {
      setErr(ex.message || 'Could not load this image.');
    }
  };

  const radius = shape === 'square' ? '14px' : '50%';

  return (
    <div className="avu">
      <div className={'ring' + (value ? ' has' : '')} style={{ borderRadius: radius }}>
        {value ? (
          <img src={value} alt="" />
        ) : (
          <span className="ph">{label || 'Add photo'}</span>
        )}
      </div>
      <div className="col">
        <div className="row">
          <button type="button" className="b" onClick={pick}>
            {value ? 'Change' : 'Upload photo'}
          </button>
          {value && (
            <button type="button" className="b danger" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
        {hint && <div className="hint">{hint}</div>}
        {err && <div className="err">{err}</div>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={onFile}
        />
      </div>
    </div>
  );
}
