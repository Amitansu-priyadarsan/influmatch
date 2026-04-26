import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ImageCropper — modal cropper with zoom + pan, no external deps.
 *
 * Pass `src` (object URL or data URL of the source image) and an
 * `onApply(dataUrl)` callback. The output is a JPEG data URL, scaled to
 * `outputSize` on the longest edge, with the visible crop window as
 * the captured region.
 *
 *   shape:        'circle' | 'square' | 'rect'
 *   aspectRatio:  width / height (used when shape === 'rect')
 *   outputSize:   pixel size of the longest edge in the output image
 */
const CROPPER_CSS = `
.icr-back{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);display:grid;place-items:center;padding:20px}
.icr-modal{width:min(720px,100%);max-height:calc(100vh - 40px);background:var(--bg-2);color:var(--fg);border:1px solid var(--line);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;font-family:var(--sans);box-shadow:0 40px 90px -20px rgba(0,0,0,.6)}
.icr-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--line)}
.icr-head .t{font-family:var(--serif);font-size:20px;letter-spacing:-.01em;font-weight:400}
.icr-head .t em{font-style:italic;color:var(--fg-dim)}
.icr-x{width:34px;height:34px;border-radius:50%;background:var(--surface-faint);border:1px solid var(--line);display:grid;place-items:center;cursor:pointer;color:var(--fg)}
.icr-x:hover{background:var(--surface-1-hover);color:var(--danger)}

.icr-stage{position:relative;background:#000;height:min(60vh,440px);overflow:hidden;touch-action:none;user-select:none;cursor:grab}
.icr-stage:active{cursor:grabbing}
.icr-img{position:absolute;left:50%;top:50%;will-change:transform;pointer-events:none;-webkit-user-drag:none}
.icr-mask{position:absolute;inset:0;pointer-events:none;display:grid;place-items:center}
.icr-mask *{pointer-events:none}
.icr-frame{box-shadow:0 0 0 9999px rgba(0,0,0,.55);outline:1.5px solid rgba(255,255,255,.85);position:relative}
.icr-frame.circle{border-radius:50%}
.icr-frame .grid-v,.icr-frame .grid-h{position:absolute;background:rgba(255,255,255,.35)}
.icr-frame .grid-v{top:0;bottom:0;width:1px}
.icr-frame .grid-h{left:0;right:0;height:1px}
.icr-frame .grid-v.a{left:33.33%}
.icr-frame .grid-v.b{left:66.66%}
.icr-frame .grid-h.a{top:33.33%}
.icr-frame .grid-h.b{top:66.66%}

.icr-controls{padding:18px 22px;border-top:1px solid var(--line);background:var(--bg-2);display:flex;flex-direction:column;gap:14px}
.icr-row{display:flex;align-items:center;gap:14px}
.icr-row .lbl{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute);min-width:48px}
.icr-row input[type=range]{flex:1;-webkit-appearance:none;appearance:none;height:4px;background:var(--line);border-radius:999px;outline:none}
.icr-row input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);cursor:pointer;border:2px solid var(--bg-2);box-shadow:0 0 0 1px var(--accent)}
.icr-row input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--accent);cursor:pointer;border:2px solid var(--bg-2);box-shadow:0 0 0 1px var(--accent)}
.icr-row .val{font-family:var(--mono);font-size:11px;color:var(--fg-dim);letter-spacing:.1em;min-width:48px;text-align:right}
.icr-rotbtns{display:flex;gap:8px}
.icr-rotbtns button{width:38px;height:38px;border-radius:10px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);cursor:pointer;display:grid;place-items:center;transition:.15s}
.icr-rotbtns button:hover{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}

.icr-foot{padding:14px 22px;border-top:1px solid var(--line);background:var(--bg);display:flex;justify-content:space-between;align-items:center;gap:12px}
.icr-foot .hint{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute)}
.icr-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;font-size:13.5px;font-weight:500;border:1px solid transparent;cursor:pointer;transition:.15s;font-family:var(--sans)}
.icr-btn-line{border-color:var(--line-2);color:var(--fg);background:var(--surface-1)}
.icr-btn-line:hover{background:var(--surface-1-hover)}
.icr-btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:500}
.icr-btn-solid:hover{filter:brightness(1.08)}
.icr-actions{display:flex;gap:10px}

@media (max-width:640px){
  .icr-stage{height:50vh}
  .icr-head .t{font-size:17px}
  .icr-foot{flex-direction:column;align-items:stretch}
  .icr-actions{justify-content:flex-end}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('icr-styles')) {
  const tag = document.createElement('style');
  tag.id = 'icr-styles';
  tag.textContent = CROPPER_CSS;
  document.head.appendChild(tag);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export default function ImageCropper({
  src,
  onApply,
  onCancel,
  shape = 'square',          // 'circle' | 'square' | 'rect'
  aspectRatio = 1,           // used when shape === 'rect'
  outputSize = 800,
  title = 'Crop your photo',
}) {
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [zoom, setZoom] = useState(1);     // multiplier on top of base scale
  const [rotation, setRotation] = useState(0); // degrees, 0/90/180/270
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom] = useState(4);

  const ratio = shape === 'rect' ? aspectRatio : 1;

  // Crop frame: square that fits the stage with some padding, respecting ratio
  const framePad = 28;
  const frame = (() => {
    if (!stage.w || !stage.h) return { w: 0, h: 0 };
    const availW = stage.w - framePad * 2;
    const availH = stage.h - framePad * 2;
    let fw = availW;
    let fh = fw / ratio;
    if (fh > availH) { fh = availH; fw = fh * ratio; }
    return { w: Math.floor(fw), h: Math.floor(fh) };
  })();

  // Whenever image loads or stage size changes, fit the image so the crop
  // frame is fully covered by the image at zoom=1.
  useEffect(() => {
    if (!imgLoaded || !natural.w || !frame.w) return;
    const rotated = rotation % 180 !== 0;
    const iw = rotated ? natural.h : natural.w;
    const ih = rotated ? natural.w : natural.h;
    const baseScale = Math.max(frame.w / iw, frame.h / ih);
    setMinZoom(1);
    setZoom(1);
    setTx(0);
    setTy(0);
    // Stash baseScale via a ref-less closure: derived in render
    setBaseScale(baseScale);
  }, [imgLoaded, natural.w, natural.h, frame.w, frame.h, rotation]);

  const [baseScale, setBaseScale] = useState(1);
  const scale = baseScale * zoom;
  const rotated = rotation % 180 !== 0;
  const iw = rotated ? natural.h : natural.w;
  const ih = rotated ? natural.w : natural.h;
  const drawnW = iw * scale;
  const drawnH = ih * scale;

  // Clamp pan so the crop frame stays inside the image bounds.
  const clampPan = useCallback((x, y) => {
    const maxTx = Math.max(0, (drawnW - frame.w) / 2);
    const maxTy = Math.max(0, (drawnH - frame.h) / 2);
    return { x: clamp(x, -maxTx, maxTx), y: clamp(y, -maxTy, maxTy) };
  }, [drawnW, drawnH, frame.w, frame.h]);

  useEffect(() => {
    const c = clampPan(tx, ty);
    if (c.x !== tx || c.y !== ty) { setTx(c.x); setTy(c.y); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, rotation, drawnW, drawnH]);

  // Stage size observer
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Live pan refs — listeners read/write these so the effect can bind once
  // for the modal's lifetime without tearing down mid-drag.
  const panRef = useRef({ tx: 0, ty: 0 });
  useEffect(() => { panRef.current = { tx, ty }; }, [tx, ty]);
  const clampRef = useRef(clampPan);
  useEffect(() => { clampRef.current = clampPan; }, [clampPan]);
  const zoomLimitsRef = useRef({ min: minZoom, max: maxZoom });
  useEffect(() => { zoomLimitsRef.current = { min: minZoom, max: maxZoom }; }, [minZoom, maxZoom]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const drag = { active: false, sx: 0, sy: 0, stx: 0, sty: 0 };

    const onDown = (e) => {
      const p = e.touches ? e.touches[0] : e;
      drag.active = true;
      drag.sx = p.clientX; drag.sy = p.clientY;
      drag.stx = panRef.current.tx; drag.sty = panRef.current.ty;
      if (e.cancelable && !e.touches) e.preventDefault();
    };
    const onMove = (e) => {
      if (!drag.active) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - drag.sx;
      const dy = p.clientY - drag.sy;
      const c = clampRef.current(drag.stx + dx, drag.sty + dy);
      setTx(c.x); setTy(c.y);
      if (e.cancelable) e.preventDefault();
    };
    const onUp = () => { drag.active = false; };
    const onWheel = (e) => {
      e.preventDefault();
      const { min, max } = zoomLimitsRef.current;
      const delta = -e.deltaY * 0.0015;
      setZoom((z) => clamp(z + delta * z, min, max));
    };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Build cropped output
  const apply = async () => {
    const img = imgRef.current;
    if (!img || !natural.w) return;

    // Draw original image, rotated, into a working canvas. Then sample
    // from that canvas the rectangle that matches the crop frame.
    const angle = (rotation % 360) * Math.PI / 180;
    const sin = Math.abs(Math.sin(angle));
    const cos = Math.abs(Math.cos(angle));
    const rotW = natural.w * cos + natural.h * sin;
    const rotH = natural.w * sin + natural.h * cos;

    const work = document.createElement('canvas');
    work.width = Math.round(rotW);
    work.height = Math.round(rotH);
    const wctx = work.getContext('2d');
    wctx.translate(work.width / 2, work.height / 2);
    wctx.rotate(angle);
    wctx.drawImage(img, -natural.w / 2, -natural.h / 2);

    // In the rotated canvas, the visible center is shifted by tx/scale,
    // ty/scale (the pan offset, in source pixels).
    const cx = work.width / 2 - tx / scale;
    const cy = work.height / 2 - ty / scale;
    const srcW = frame.w / scale;
    const srcH = frame.h / scale;
    const srcX = cx - srcW / 2;
    const srcY = cy - srcH / 2;

    // Output canvas: keep the crop's aspect, longest edge = outputSize.
    const longest = Math.max(frame.w, frame.h);
    const outW = Math.round(outputSize * (frame.w / longest));
    const outH = Math.round(outputSize * (frame.h / longest));
    const out = document.createElement('canvas');
    out.width = outW;
    out.height = outH;
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = 'high';

    if (shape === 'circle') {
      octx.save();
      octx.beginPath();
      octx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2);
      octx.closePath();
      octx.clip();
      octx.drawImage(work, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
      octx.restore();
      onApply(out.toDataURL('image/png'));   // png to keep transparency
    } else {
      octx.drawImage(work, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
      onApply(out.toDataURL('image/jpeg', 0.85));
    }
  };

  return (
    <div className="icr-back" onClick={onCancel}>
      <div className="icr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="icr-head">
          <div className="t">{title}</div>
          <button className="icr-x" onClick={onCancel} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="icr-stage" ref={stageRef}>
          <img
            ref={imgRef}
            src={src}
            alt=""
            className="icr-img"
            onLoad={(e) => {
              setNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight });
              setImgLoaded(true);
            }}
            style={{
              transform: `translate(-50%,-50%) translate(${tx}px,${ty}px) rotate(${rotation}deg) scale(${scale})`,
              transformOrigin: 'center',
              maxWidth: 'none',
              maxHeight: 'none',
            }}
            draggable={false}
          />
          {frame.w > 0 && (
            <div className="icr-mask">
              <div
                className={'icr-frame' + (shape === 'circle' ? ' circle' : '')}
                style={{ width: frame.w, height: frame.h }}
              >
                {shape !== 'circle' && (
                  <>
                    <span className="grid-v a" /><span className="grid-v b" />
                    <span className="grid-h a" /><span className="grid-h b" />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="icr-controls">
          <div className="icr-row">
            <span className="lbl">Zoom</span>
            <input
              type="range" min={minZoom} max={maxZoom} step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
            <span className="val">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="icr-row">
            <span className="lbl">Rotate</span>
            <div className="icr-rotbtns">
              <button onClick={() => setRotation((r) => (r - 90 + 360) % 360)} aria-label="Rotate left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 109-9"/><path d="M3 4v6h6"/></svg>
              </button>
              <button onClick={() => setRotation((r) => (r + 90) % 360)} aria-label="Rotate right">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-9-9"/><path d="M21 4v6h-6"/></svg>
              </button>
            </div>
            <span className="val">{rotation}°</span>
          </div>
        </div>

        <div className="icr-foot">
          <span className="hint">Drag to reposition · Scroll or slide to zoom</span>
          <div className="icr-actions">
            <button className="icr-btn icr-btn-line" onClick={onCancel}>Cancel</button>
            <button className="icr-btn icr-btn-solid" onClick={apply} disabled={!imgLoaded}>Apply →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
