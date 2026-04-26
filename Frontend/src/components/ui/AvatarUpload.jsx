import { useRef, useState } from 'react';
import ImageCropper from './ImageCropper';

/**
 * AvatarUpload — circular (or square) photo picker with phone camera
 * support and an interactive cropper. Emits a JPEG / PNG data URL via
 * `onChange(dataUrl)`. Cheap path: the resulting string lives in
 * `avatar_url text` on the profile row.
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

const MAX_BYTES = 12 * 1024 * 1024;

export default function AvatarUpload({ value, onChange, label, hint, shape = 'circle' }) {
  const inputRef = useRef(null);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState(null); // { src, objectUrl } | null

  const pick = () => inputRef.current?.click();

  const onFile = (e) => {
    setErr('');
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > MAX_BYTES) { setErr('Image too large. Pick something under 12 MB.'); return; }
    const url = URL.createObjectURL(f);
    setEditing({ src: url, objectUrl: url });
  };

  const closeCropper = () => {
    if (editing?.objectUrl) URL.revokeObjectURL(editing.objectUrl);
    setEditing(null);
  };

  const onApply = (dataUrl) => {
    onChange(dataUrl);
    closeCropper();
  };

  const radius = shape === 'square' ? '14px' : '50%';
  const cropperShape = shape === 'square' ? 'square' : 'circle';

  return (
    <>
      <div className="avu">
        <div className={'ring' + (value ? ' has' : '')} style={{ borderRadius: radius }}>
          {value ? <img src={value} alt="" /> : <span className="ph">{label || 'Add photo'}</span>}
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

      {editing && (
        <ImageCropper
          src={editing.src}
          shape={cropperShape}
          outputSize={600}
          title={shape === 'square' ? 'Crop your logo' : 'Crop your photo'}
          onApply={onApply}
          onCancel={closeCropper}
        />
      )}
    </>
  );
}
