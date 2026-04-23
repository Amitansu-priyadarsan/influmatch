import { useEffect } from 'react';

const LANDING_CSS = `
:root{
  --bg: #0b0b0c;
  --bg-2:#111113;
  --bg-3:#17171a;
  --line: rgba(255,255,255,0.08);
  --line-2: rgba(255,255,255,0.14);
  --fg: #ededec;
  --fg-dim: #a6a6a3;
  --fg-mute: #6b6b68;
  --accent: oklch(0.86 0.14 104);
  --accent-ink:#0b0b0c;
  --serif: 'Instrument Serif', 'Times New Roman', serif;
  --sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --mono: 'Geist Mono', ui-monospace, monospace;
}
.influmatch-root *{box-sizing:border-box}
.influmatch-root{margin:0;padding:0;background:var(--bg);color:var(--fg);font-family:var(--sans);-webkit-font-smoothing:antialiased;font-weight:400;overflow-x:hidden;min-height:100vh}
.influmatch-root a{color:inherit;text-decoration:none}
.influmatch-root button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.influmatch-root .wrap{max-width:1280px;margin:0 auto;padding:0 28px}

.influmatch-root nav.top{position:sticky;top:0;z-index:50;backdrop-filter:blur(14px);background:rgba(11,11,12,.72);border-bottom:1px solid var(--line)}
.influmatch-root nav.top .row{display:flex;align-items:center;justify-content:space-between;height:64px}
.influmatch-root .brand{display:flex;align-items:center;gap:10px;font-family:var(--serif);font-size:22px;letter-spacing:-.01em}
.influmatch-root .brand .mark{width:14px;height:14px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(255,255,255,.04)}
.influmatch-root .brand em{font-style:italic;color:var(--fg-dim)}
.influmatch-root .nav-links{display:flex;gap:32px;font-size:13.5px;color:var(--fg-dim)}
.influmatch-root .nav-links a:hover{color:var(--fg)}
.influmatch-root .nav-cta{display:flex;gap:10px;align-items:center}

.influmatch-root .btn{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;font-size:13.5px;font-weight:500;transition:.15s ease;border:1px solid transparent;white-space:nowrap}
.influmatch-root .btn-ghost{color:var(--fg-dim)}
.influmatch-root .btn-ghost:hover{color:var(--fg)}
.influmatch-root .btn-line{border-color:var(--line-2);color:var(--fg)}
.influmatch-root .btn-line:hover{background:rgba(255,255,255,.04)}
.influmatch-root .btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:500}
.influmatch-root .btn-solid:hover{filter:brightness(1.08)}
.influmatch-root .btn-arrow{width:16px;height:16px;display:inline-block}

.influmatch-root .hero{padding:72px 0 40px;position:relative;overflow:hidden}
.influmatch-root .hero-grid{display:grid;grid-template-columns: 1.05fr .95fr;gap:64px;align-items:center}
.influmatch-root .eyebrow{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-dim);padding:6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--bg-2)}
.influmatch-root .eyebrow .dot{width:6px;height:6px;background:var(--accent);border-radius:50%;box-shadow:0 0 0 3px rgba(212,244,52,.14)}
.influmatch-root h1.display{font-family:var(--serif);font-weight:400;font-size:clamp(56px,7.4vw,104px);line-height:.98;letter-spacing:-.025em;margin:22px 0 22px}
.influmatch-root h1.display em{font-style:italic;color:var(--fg-dim)}
.influmatch-root h1.display .accent{color:var(--accent)}
.influmatch-root .lede{color:var(--fg-dim);font-size:17.5px;line-height:1.55;max-width:520px;margin-bottom:32px}
.influmatch-root .hero-cta{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.influmatch-root .hero-meta{margin-top:36px;display:flex;gap:28px;font-family:var(--mono);font-size:11px;color:var(--fg-mute);letter-spacing:.08em;text-transform:uppercase}
.influmatch-root .hero-meta b{color:var(--fg);font-weight:500}

.influmatch-root .demo{position:relative;aspect-ratio: 1/1.05;border:1px solid var(--line);border-radius:18px;background:
  radial-gradient(120% 80% at 80% 10%, rgba(255,255,255,.03), transparent 60%),
  linear-gradient(180deg,#131316,#0d0d0f);
  padding:22px;overflow:hidden}
.influmatch-root .demo-head{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}
.influmatch-root .demo-head .live{display:flex;align-items:center;gap:8px;color:var(--fg-dim)}
.influmatch-root .demo-head .live .pulse{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:im-pulse 1.6s infinite}
@keyframes im-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}

.influmatch-root .demo-stage{position:relative;height:calc(100% - 28px);margin-top:18px}
.influmatch-root .col-label{position:absolute;top:0;font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute)}
.influmatch-root .col-label.left{left:0}
.influmatch-root .col-label.right{right:0}

.influmatch-root .card{position:absolute;border:1px solid var(--line-2);border-radius:12px;background:#141417;padding:12px 13px;display:flex;gap:10px;align-items:center;width:196px;transition:transform .6s cubic-bezier(.2,.7,.2,1), opacity .6s, border-color .4s, background .4s}
.influmatch-root .card .av{width:34px;height:34px;border-radius:50%;flex:none;background:linear-gradient(135deg,#2b2b30,#1a1a1d);border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:15px;color:var(--fg-dim)}
.influmatch-root .card .who{font-size:12.5px;line-height:1.2;font-weight:500;letter-spacing:-.005em}
.influmatch-root .card .meta{font-family:var(--mono);font-size:9.5px;color:var(--fg-mute);letter-spacing:.08em;text-transform:uppercase;margin-top:3px}
.influmatch-root .card .tag{margin-left:auto;font-family:var(--mono);font-size:9.5px;color:var(--fg-dim);border:1px solid var(--line);padding:2px 6px;border-radius:4px}
.influmatch-root .card.brand-card{left:0}
.influmatch-root .card.inf{right:0}
.influmatch-root .card.matched{border-color:var(--accent);background:#181913;box-shadow:0 0 0 1px var(--accent) inset, 0 18px 40px -16px rgba(212,244,52,.18)}
.influmatch-root .card.matched .tag{color:var(--accent);border-color:var(--accent)}

.influmatch-root .thread{position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none}
.influmatch-root .thread svg{width:100%;height:100%}
.influmatch-root .thread path{fill:none;stroke:var(--line-2);stroke-width:1;stroke-dasharray:3 4;opacity:.55}
.influmatch-root .thread path.hot{stroke:var(--accent);stroke-width:1.25;stroke-dasharray:none;opacity:1;filter:drop-shadow(0 0 8px rgba(212,244,52,.35))}

.influmatch-root .demo-foot{position:absolute;left:22px;right:22px;bottom:22px;display:flex;justify-content:space-between;align-items:flex-end;gap:18px}
.influmatch-root .match-panel{border:1px solid var(--accent);background:rgba(212,244,52,.06);border-radius:10px;padding:10px 12px;display:flex;gap:14px;align-items:center;min-width:280px}
.influmatch-root .match-panel .pct{font-family:var(--serif);font-style:italic;font-size:32px;color:var(--accent);line-height:1}
.influmatch-root .match-panel .lbl{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-dim)}
.influmatch-root .match-panel .val{font-size:13px;color:var(--fg);margin-top:2px}
.influmatch-root .ticker{font-family:var(--mono);font-size:10.5px;color:var(--fg-mute);letter-spacing:.1em;text-align:right}

.influmatch-root section{padding:96px 0;border-top:1px solid var(--line)}
.influmatch-root .sec-head{display:flex;justify-content:space-between;align-items:flex-end;gap:40px;margin-bottom:56px}
.influmatch-root .sec-kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute)}
.influmatch-root .sec-title{font-family:var(--serif);font-size:clamp(40px,5vw,64px);line-height:1;letter-spacing:-.02em;margin:14px 0 0;max-width:820px}
.influmatch-root .sec-title em{font-style:italic;color:var(--fg-dim)}
.influmatch-root .sec-sub{color:var(--fg-dim);font-size:15px;max-width:360px;line-height:1.55}

.influmatch-root .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.influmatch-root .step{padding:32px 24px 36px;border-right:1px solid var(--line);position:relative;min-height:260px;display:flex;flex-direction:column}
.influmatch-root .step:last-child{border-right:0}
.influmatch-root .step .num{font-family:var(--mono);font-size:11px;color:var(--fg-mute);letter-spacing:.18em}
.influmatch-root .step h3{font-family:var(--serif);font-weight:400;font-size:28px;letter-spacing:-.01em;margin:40px 0 10px;line-height:1.05}
.influmatch-root .step p{color:var(--fg-dim);font-size:14px;line-height:1.55;margin:0}
.influmatch-root .step .glyph{margin-top:auto;padding-top:28px;color:var(--fg-mute)}
.influmatch-root .step .glyph svg{display:block}

.influmatch-root .split{display:grid;grid-template-columns:1.1fr .9fr;gap:72px;align-items:center}
.influmatch-root .split.rev{grid-template-columns:.9fr 1.1fr}
.influmatch-root .feat-title{font-family:var(--serif);font-size:clamp(36px,4.4vw,56px);line-height:1;letter-spacing:-.02em;margin:14px 0 20px}
.influmatch-root .feat-title em{font-style:italic;color:var(--fg-dim)}
.influmatch-root .feat-copy{color:var(--fg-dim);font-size:15.5px;line-height:1.6;margin-bottom:28px;max-width:460px}
.influmatch-root .bullets{list-style:none;padding:0;margin:0 0 32px;display:flex;flex-direction:column;gap:14px}
.influmatch-root .bullets li{display:flex;gap:14px;padding:14px 0;border-top:1px solid var(--line);font-size:14.5px}
.influmatch-root .bullets li:last-child{border-bottom:1px solid var(--line)}
.influmatch-root .bullets .k{font-family:var(--mono);font-size:10.5px;color:var(--fg-mute);letter-spacing:.12em;text-transform:uppercase;min-width:28px;padding-top:2px}
.influmatch-root .bullets .v b{display:block;color:var(--fg);font-weight:500;margin-bottom:2px}
.influmatch-root .bullets .v span{color:var(--fg-dim);line-height:1.5}

.influmatch-root .mock{border:1px solid var(--line);border-radius:14px;background:linear-gradient(180deg,#121215,#0d0d0f);padding:18px;font-family:var(--mono)}
.influmatch-root .mock-head{display:flex;justify-content:space-between;align-items:center;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);padding-bottom:14px;border-bottom:1px solid var(--line)}
.influmatch-root .mock-head .dots{display:flex;gap:5px}
.influmatch-root .mock-head .dots i{width:7px;height:7px;border-radius:50%;background:#2a2a2e;display:inline-block}
.influmatch-root .mock-row{display:flex;justify-content:space-between;align-items:center;padding:12px 2px;border-bottom:1px solid var(--line);font-size:12px}
.influmatch-root .mock-row:last-child{border-bottom:0}
.influmatch-root .mock-row .name{color:var(--fg);font-family:var(--sans);font-weight:500;letter-spacing:-.005em}
.influmatch-root .mock-row .sub{color:var(--fg-mute);font-size:10px;letter-spacing:.08em;text-transform:uppercase;margin-top:2px}
.influmatch-root .mock-row .val{color:var(--fg);font-size:11px}
.influmatch-root .mock-row .pill{padding:3px 8px;border:1px solid var(--line-2);border-radius:999px;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim)}
.influmatch-root .mock-row .pill.ok{color:var(--accent);border-color:var(--accent)}
.influmatch-root .mock-stat{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:14px 2px 6px}
.influmatch-root .mock-stat .s{border:1px solid var(--line);border-rad:8px;border-radius:8px;padding:12px}
.influmatch-root .mock-stat .s .n{font-family:var(--serif);font-size:28px;color:var(--fg);line-height:1}
.influmatch-root .mock-stat .s .l{font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-top:8px}
.influmatch-root .mock-chart{height:58px;margin-top:10px;position:relative}
.influmatch-root .mock-chart svg{width:100%;height:100%;overflow:visible}

.influmatch-root .camp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.influmatch-root .camp{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:20px;position:relative;transition:.2s;display:flex;flex-direction:column;min-height:280px}
.influmatch-root .camp:hover{border-color:var(--line-2);background:#18181b;transform:translateY(-2px)}
.influmatch-root .camp .row1{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
.influmatch-root .camp .logo{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#222,#111);border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);color:var(--fg-dim);font-size:18px}
.influmatch-root .camp .status{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);display:flex;gap:6px;align-items:center}
.influmatch-root .camp .status .d{width:5px;height:5px;border-radius:50%;background:var(--accent)}
.influmatch-root .camp h4{font-family:var(--serif);font-weight:400;font-size:24px;line-height:1.1;letter-spacing:-.01em;margin:0 0 6px}
.influmatch-root .camp .brand-name{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:14px}
.influmatch-root .camp .tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.influmatch-root .camp .tags span{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-dim);padding:3px 8px;border:1px solid var(--line);border-radius:999px}
.influmatch-root .camp .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;padding-top:16px;border-top:1px solid var(--line)}
.influmatch-root .camp .foot .lbl{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}
.influmatch-root .camp .foot .val{font-family:var(--serif);font-size:22px;color:var(--fg);line-height:1;margin-top:4px}
.influmatch-root .camp .foot .apps{font-family:var(--mono);font-size:11px;color:var(--fg-dim)}

.influmatch-root .logos{padding:48px 0;border-top:1px solid var(--line)}
.influmatch-root .logos-head{text-align:center;font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:36px}
.influmatch-root .logos-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.influmatch-root .logo-cell{background:var(--bg);padding:28px 10px;display:grid;place-items:center;font-family:var(--serif);font-size:22px;color:var(--fg-dim);letter-spacing:-.01em;font-style:italic}
.influmatch-root .logo-cell .mono{font-family:var(--mono);font-style:normal;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim)}

.influmatch-root .quotes{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.influmatch-root .quote{border:1px solid var(--line);border-radius:14px;padding:28px;background:var(--bg-2);display:flex;flex-direction:column}
.influmatch-root .quote p{font-family:var(--serif);font-size:22px;line-height:1.25;letter-spacing:-.01em;color:var(--fg);margin:0 0 28px;font-weight:400}
.influmatch-root .quote p em{color:var(--fg-dim);font-style:italic}
.influmatch-root .quote .who{display:flex;align-items:center;gap:12px;margin-top:auto;padding-top:20px;border-top:1px solid var(--line)}
.influmatch-root .quote .av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#2a2a2e,#141418);border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:14px;color:var(--fg-dim)}
.influmatch-root .quote .name{font-size:13px;font-weight:500}
.influmatch-root .quote .role{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);margin-top:2px}

.influmatch-root .faq{max-width:860px;margin:0 auto}
.influmatch-root details.q{border-top:1px solid var(--line);padding:24px 0;cursor:pointer}
.influmatch-root details.q:last-of-type{border-bottom:1px solid var(--line)}
.influmatch-root details.q summary{list-style:none;display:flex;justify-content:space-between;align-items:center;gap:20px;font-family:var(--serif);font-size:24px;letter-spacing:-.01em;color:var(--fg)}
.influmatch-root details.q summary::-webkit-details-marker{display:none}
.influmatch-root details.q .ans{color:var(--fg-dim);font-size:15px;line-height:1.6;margin-top:14px;max-width:680px}
.influmatch-root details.q .plus{font-family:var(--mono);font-size:18px;color:var(--fg-mute);transition:transform .3s}
.influmatch-root details.q[open] .plus{transform:rotate(45deg);color:var(--accent)}

.influmatch-root .cta{padding:120px 0;text-align:center;border-top:1px solid var(--line);position:relative;overflow:hidden}
.influmatch-root .cta::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 60% at 50% 120%, rgba(212,244,52,.16), transparent 60%);pointer-events:none}
.influmatch-root .cta h2{font-family:var(--serif);font-size:clamp(56px,8vw,120px);line-height:.95;letter-spacing:-.03em;margin:0 0 18px;position:relative}
.influmatch-root .cta h2 em{font-style:italic;color:var(--fg-dim)}
.influmatch-root .cta h2 .accent{color:var(--accent)}
.influmatch-root .cta .sub{color:var(--fg-dim);font-size:17px;margin:0 auto 36px;max-width:520px;position:relative}
.influmatch-root .cta-btns{display:flex;gap:12px;justify-content:center;position:relative;flex-wrap:wrap}

.influmatch-root footer{border-top:1px solid var(--line);padding:56px 0 36px;color:var(--fg-dim)}
.influmatch-root .foot-grid{display:grid;grid-template-columns:1.2fr repeat(4,1fr);gap:40px;padding-bottom:48px;border-bottom:1px solid var(--line)}
.influmatch-root .foot-grid h5{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin:0 0 18px;font-weight:500}
.influmatch-root .foot-grid ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;font-size:13.5px}
.influmatch-root .foot-grid ul a:hover{color:var(--fg)}
.influmatch-root .foot-brand p{font-size:13.5px;line-height:1.55;max-width:280px;margin:14px 0 0}
.influmatch-root .foot-bot{display:flex;justify-content:space-between;align-items:center;padding-top:28px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--fg-mute);text-transform:uppercase;flex-wrap:wrap;gap:16px}

@media (max-width:1020px){
  .influmatch-root .hero-grid,.influmatch-root .split,.influmatch-root .split.rev{grid-template-columns:1fr;gap:40px}
  .influmatch-root .steps{grid-template-columns:repeat(2,1fr)}
  .influmatch-root .step:nth-child(2){border-right:0}
  .influmatch-root .step:nth-child(1),.influmatch-root .step:nth-child(2){border-bottom:1px solid var(--line)}
  .influmatch-root .camp-grid,.influmatch-root .quotes{grid-template-columns:1fr}
  .influmatch-root .logos-grid{grid-template-columns:repeat(3,1fr)}
  .influmatch-root .foot-grid{grid-template-columns:1fr 1fr}
  .influmatch-root .nav-links{display:none}
}
`;

const Arrow = () => (
  <svg className="btn-arrow" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LandingPage() {
  useEffect(() => {
    const pairs = [
      { b:0, i:0, pct:98, pair:'Aperture · @maia.field',    ticker:'AUD · 18–34\nENG · 6.8%\nCTR · 3.1%' },
      { b:1, i:1, pct:91, pair:'Noctua · @jules.atelier',   ticker:'AUD · 25–40\nENG · 8.1%\nCTR · 2.7%' },
      { b:2, i:2, pct:87, pair:'Folio · @rowan.roast',      ticker:'AUD · 22–38\nENG · 4.9%\nCTR · 2.3%' },
      { b:0, i:1, pct:84, pair:'Aperture · @jules.atelier', ticker:'AUD · 24–36\nENG · 7.4%\nCTR · 2.9%' },
      { b:1, i:2, pct:79, pair:'Noctua · @rowan.roast',     ticker:'AUD · 28–42\nENG · 5.2%\nCTR · 2.1%' },
    ];
    let pairIdx = 0;
    let interval, raf;

    const cardCenter = (el, wrap) => {
      const r = el.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      return { x: ((r.left + r.width/2) - w.left) / w.width * 100, y: ((r.top + r.height/2) - w.top) / w.height * 100 };
    };

    const drawThread = (hotB, hotI) => {
      const stage = document.getElementById('stage');
      const svg = document.getElementById('threadSvg');
      if (!stage || !svg) return;
      svg.innerHTML = '';
      for (let b = 0; b < 3; b++) {
        for (let i = 0; i < 3; i++) {
          const bEl = document.getElementById('b'+b);
          const iEl = document.getElementById('i'+i);
          if (!bEl || !iEl) continue;
          const bc = cardCenter(bEl, stage);
          const ic = cardCenter(iEl, stage);
          const mx = (bc.x + ic.x)/2;
          const d = `M ${bc.x} ${bc.y} C ${mx} ${bc.y}, ${mx} ${ic.y}, ${ic.x} ${ic.y}`;
          const p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d', d);
          if (b === hotB && i === hotI) p.classList.add('hot');
          svg.appendChild(p);
        }
      }
    };

    const cycle = () => {
      const p = pairs[pairIdx];
      document.querySelectorAll('.influmatch-root .card').forEach(c => c.classList.remove('matched'));
      document.getElementById('b'+p.b)?.classList.add('matched');
      document.getElementById('i'+p.i)?.classList.add('matched');
      const pctEl = document.getElementById('matchPct');
      if (pctEl) {
        const start = parseInt(pctEl.textContent, 10) || 0;
        const end = p.pct;
        const dur = 600, t0 = performance.now();
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          pctEl.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - k, 3)));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }
      const pairEl = document.getElementById('matchPair');
      if (pairEl) pairEl.textContent = p.pair;
      const tickerEl = document.getElementById('ticker');
      if (tickerEl) tickerEl.innerHTML = p.ticker.replace(/\n/g, '<br>');
      drawThread(p.b, p.i);
      pairIdx = (pairIdx + 1) % pairs.length;
    };

    const resizeHandler = () => {
      const idx = (pairIdx + pairs.length - 1) % pairs.length;
      drawThread(pairs[idx].b, pairs[idx].i);
    };

    requestAnimationFrame(() => {
      cycle();
      interval = setInterval(cycle, 2600);
    });
    window.addEventListener('resize', resizeHandler);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return (
    <div className="influmatch-root">
      <style>{LANDING_CSS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <nav className="top">
        <div className="wrap row">
          <a href="#" className="brand"><span className="mark"></span>Influ<em>Match</em></a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#influencers">For Creators</a>
            <a href="#brands">For Brands</a>
            <a href="#campaigns">Campaigns</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-cta">
            <a className="btn btn-ghost" href="/login">Sign in</a>
            <a className="btn btn-solid" href="/signup">Join the marketplace →</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="dot"></span> Now open · 1,248 active campaigns</span>

            <h1 className="display">
              The marketplace<br/>where <em>creators</em><br/>get <span className="accent">paid</span> to post.
            </h1>

            <p className="lede">
              Browse open campaigns from vetted brands, apply in one tap, and manage every collaboration — briefs, deliverables, payouts — from a single dashboard.
            </p>

            <div className="hero-cta">
              <a className="btn btn-solid" href="/signup">
                Apply as a creator
                <Arrow/>
              </a>
              <a className="btn btn-line" href="/signup">I'm a brand</a>
            </div>

            <div className="hero-meta">
              <div><b>12,400+</b><br/>creators</div>
              <div><b>$38M</b><br/>paid out</div>
              <div><b>94%</b><br/>campaign fill rate</div>
            </div>
          </div>

          <div className="demo" id="demo">
            <div className="demo-head">
              <span>Live match engine</span>
              <span className="live"><span className="pulse"></span> Matching in real time</span>
            </div>
            <div className="demo-stage" id="stage">
              <span className="col-label left">Brand briefs</span>
              <span className="col-label right">Creators</span>

              <div className="thread">
                <svg id="threadSvg" preserveAspectRatio="none" viewBox="0 0 100 100"></svg>
              </div>

              <div className="card brand-card" id="b0" style={{top:'40px'}}>
                <div className="av">A</div>
                <div>
                  <div className="who">Aperture Coffee</div>
                  <div className="meta">$4K · Lifestyle</div>
                </div>
                <div className="tag">Brief</div>
              </div>
              <div className="card brand-card" id="b1" style={{top:'140px'}}>
                <div className="av">N</div>
                <div>
                  <div className="who">Noctua Watches</div>
                  <div className="meta">$12K · Luxe</div>
                </div>
                <div className="tag">Brief</div>
              </div>
              <div className="card brand-card" id="b2" style={{top:'240px'}}>
                <div className="av">F</div>
                <div>
                  <div className="who">Folio Linen</div>
                  <div className="meta">$2K · Fashion</div>
                </div>
                <div className="tag">Brief</div>
              </div>

              <div className="card inf" id="i0" style={{top:'88px'}}>
                <div className="av">M</div>
                <div>
                  <div className="who">@maia.field</div>
                  <div className="meta">184K · Slow living</div>
                </div>
                <div className="tag">98%</div>
              </div>
              <div className="card inf" id="i1" style={{top:'188px'}}>
                <div className="av">J</div>
                <div>
                  <div className="who">@jules.atelier</div>
                  <div className="meta">62K · Menswear</div>
                </div>
                <div className="tag">91%</div>
              </div>
              <div className="card inf" id="i2" style={{top:'288px'}}>
                <div className="av">R</div>
                <div>
                  <div className="who">@rowan.roast</div>
                  <div className="meta">240K · F&amp;B</div>
                </div>
                <div className="tag">87%</div>
              </div>
            </div>

            <div className="demo-foot">
              <div className="match-panel">
                <div>
                  <div className="lbl">Match</div>
                  <div className="pct" id="matchPct">98</div>
                </div>
                <div style={{borderLeft:'1px solid var(--line)',paddingLeft:'14px'}}>
                  <div className="lbl">Brief → Creator</div>
                  <div className="val" id="matchPair">Aperture · @maia.field</div>
                </div>
              </div>
              <div className="ticker" id="ticker">
                AUD · 18–34<br/>
                ENG · 6.8%<br/>
                CTR · 3.1%
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="how">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-kicker">01 — How it works</div>
              <h2 className="sec-title">Four steps <em>from brief</em> to payout.</h2>
            </div>
            <p className="sec-sub">A single contract-backed workflow for both sides. No DMs, no spreadsheets, no chasing invoices.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">STEP 01</div>
              <h3>Post or <em>browse</em></h3>
              <p>Brands publish a campaign brief. Creators filter by category, budget and audience fit.</p>
              <div className="glyph"><svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="2" y="2" width="40" height="40" rx="2" stroke="currentColor"/><path d="M2 14h40M14 2v12" stroke="currentColor"/></svg></div>
            </div>
            <div className="step">
              <div className="num">STEP 02</div>
              <h3>Apply &amp; <em>review</em></h3>
              <p>Creators pitch with rate and angle. Brands shortlist from ranked applicant cards.</p>
              <div className="glyph"><svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="18" cy="18" r="10" stroke="currentColor"/><path d="M26 26l12 12" stroke="currentColor"/></svg></div>
            </div>
            <div className="step">
              <div className="num">STEP 03</div>
              <h3>Collaborate</h3>
              <p>Shared brief, deliverables, draft reviews and approvals all in one place.</p>
              <div className="glyph"><svg width="44" height="44" viewBox="0 0 44 44" fill="none"><path d="M6 22h32M22 6v32" stroke="currentColor"/><circle cx="22" cy="22" r="6" stroke="currentColor"/></svg></div>
            </div>
            <div className="step">
              <div className="num">STEP 04</div>
              <h3>Track &amp; <em>pay</em></h3>
              <p>Live performance tracking. Funds release automatically when deliverables land.</p>
              <div className="glyph"><svg width="44" height="44" viewBox="0 0 44 44" fill="none"><path d="M4 34l10-10 8 8 16-16" stroke="currentColor"/><path d="M30 16h8v8" stroke="currentColor"/></svg></div>
            </div>
          </div>
        </div>
      </section>

      <section id="influencers">
        <div className="wrap">
          <div className="split">
            <div>
              <div className="sec-kicker">02 — For creators</div>
              <h2 className="feat-title">Turn your feed <em>into</em> a calendar of paid work.</h2>
              <p className="feat-copy">Browse vetted briefs that match your niche. One-tap applications. Every collaboration — from brief to payout — lives on a single dashboard.</p>
              <ul className="bullets">
                <li><span className="k">01</span><div className="v"><b>Smart match</b><span>Campaigns ranked by your audience, niche and historical performance.</span></div></li>
                <li><span className="k">02</span><div className="v"><b>One-tap apply</b><span>Pre-filled pitch with your rate card — apply to ten briefs in a minute.</span></div></li>
                <li><span className="k">03</span><div className="v"><b>Guaranteed payout</b><span>Funds held in escrow, released the moment deliverables are approved.</span></div></li>
              </ul>
              <a className="btn btn-line" href="/signup">Apply as a creator →</a>
            </div>
            <div className="mock">
              <div className="mock-head"><span>Creator · Dashboard</span><span className="dots"><i></i><i></i><i></i></span></div>
              <div className="mock-stat">
                <div className="s"><div className="n">$8,420</div><div className="l">In escrow</div></div>
                <div className="s"><div className="n">7</div><div className="l">Active</div></div>
                <div className="s"><div className="n">6.8%</div><div className="l">Avg ENG</div></div>
              </div>
              <div className="mock-chart">
                <svg viewBox="0 0 400 60" preserveAspectRatio="none">
                  <path d="M0 48 L40 42 L80 44 L120 30 L160 34 L200 22 L240 28 L280 14 L320 20 L360 10 L400 6" fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
                  <path d="M0 48 L40 42 L80 44 L120 30 L160 34 L200 22 L240 28 L280 14 L320 20 L360 10 L400 6 L400 60 L0 60 Z" fill="var(--accent)" opacity=".08"/>
                </svg>
              </div>
              <div style={{marginTop:'14px'}}>
                <div className="mock-row"><div><div className="name">Aperture Coffee — Autumn Drop</div><div className="sub">Due Oct 14 · Reel + 2 stories</div></div><div className="pill ok">Approved</div></div>
                <div className="mock-row"><div><div className="name">Folio Linen — SS26 Launch</div><div className="sub">Due Oct 22 · 1 post</div></div><div className="pill">Draft review</div></div>
                <div className="mock-row"><div><div className="name">Noctua Watches — Holiday</div><div className="sub">Due Nov 3 · Reel</div></div><div className="pill">Applied</div></div>
                <div className="mock-row"><div><div className="name">Oros Skincare — Everyday</div><div className="sub">Due Nov 10 · 2 posts</div></div><div className="pill">Invited</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="brands">
        <div className="wrap">
          <div className="split rev">
            <div className="mock">
              <div className="mock-head"><span>Brand · Campaign 004</span><span className="dots"><i></i><i></i><i></i></span></div>
              <div className="mock-stat">
                <div className="s"><div className="n">2.4M</div><div className="l">Reach</div></div>
                <div className="s"><div className="n">184K</div><div className="l">Engagements</div></div>
                <div className="s"><div className="n">4.2×</div><div className="l">ROAS</div></div>
              </div>
              <div style={{marginTop:'14px'}}>
                <div className="mock-row"><div><div className="name">@maia.field · 184K</div><div className="sub">Lifestyle · 6.8% ENG</div></div><div className="val">98%</div></div>
                <div className="mock-row"><div><div className="name">@jules.atelier · 62K</div><div className="sub">Menswear · 8.1% ENG</div></div><div className="val">91%</div></div>
                <div className="mock-row"><div><div className="name">@rowan.roast · 240K</div><div className="sub">F&amp;B · 4.9% ENG</div></div><div className="val">87%</div></div>
                <div className="mock-row"><div><div className="name">@sae.studio · 98K</div><div className="sub">Design · 5.4% ENG</div></div><div className="val">82%</div></div>
                <div className="mock-row"><div><div className="name">@harlow.co · 310K</div><div className="sub">Travel · 3.7% ENG</div></div><div className="val">78%</div></div>
              </div>
            </div>
            <div>
              <div className="sec-kicker">03 — For brands</div>
              <h2 className="feat-title">Run campaigns <em>like</em> a media buy. Just faster.</h2>
              <p className="feat-copy">Publish a brief, review ranked applicants from our curated pool, and measure reach, engagement and ROAS as content goes live — all without an agency in the middle.</p>
              <ul className="bullets">
                <li><span className="k">01</span><div className="v"><b>Ranked applicants</b><span>Creators scored against your audience and objective — no sifting through thousands of inboxes.</span></div></li>
                <li><span className="k">02</span><div className="v"><b>Brief to approval</b><span>Deliverables, drafts and approvals handled in-platform with a clear audit trail.</span></div></li>
                <li><span className="k">03</span><div className="v"><b>Performance in real time</b><span>Reach, engagement, CTR and ROAS updated automatically as posts go live.</span></div></li>
              </ul>
              <a className="btn btn-line" href="/signup">Post a campaign →</a>
            </div>
          </div>
        </div>
      </section>

      <section id="campaigns">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-kicker">04 — Open briefs</div>
              <h2 className="sec-title">Live on the <em>marketplace</em> right now.</h2>
            </div>
            <p className="sec-sub">A snapshot of campaigns creators are applying to this week. Refreshed hourly.</p>
          </div>

          <div className="camp-grid">
            <div className="camp">
              <div className="row1"><div className="logo">A</div><div className="status"><span className="d"></span> Open · 3d left</div></div>
              <h4>Autumn Drop — Hand-roasted lifestyle reels</h4>
              <div className="brand-name">Aperture Coffee</div>
              <div className="tags"><span>Lifestyle</span><span>Food &amp; drink</span><span>Reel</span><span>US · EU</span></div>
              <div className="foot"><div><div className="lbl">Budget / creator</div><div className="val">$1,200</div></div><div className="apps">42 applicants</div></div>
            </div>
            <div className="camp">
              <div className="row1"><div className="logo">N</div><div className="status"><span className="d"></span> Open · 9d left</div></div>
              <h4>Holiday Capsule — Cinematic unboxing</h4>
              <div className="brand-name">Noctua Watches</div>
              <div className="tags"><span>Luxe</span><span>Menswear</span><span>Reel</span><span>UK · DE · US</span></div>
              <div className="foot"><div><div className="lbl">Budget / creator</div><div className="val">$4,800</div></div><div className="apps">18 applicants</div></div>
            </div>
            <div className="camp">
              <div className="row1"><div className="logo">F</div><div className="status"><span className="d"></span> Open · 12d left</div></div>
              <h4>SS26 — Slow-living wardrobe staples</h4>
              <div className="brand-name">Folio Linen</div>
              <div className="tags"><span>Fashion</span><span>Sustainable</span><span>Post + Story</span><span>Global</span></div>
              <div className="foot"><div><div className="lbl">Budget / creator</div><div className="val">$800</div></div><div className="apps">67 applicants</div></div>
            </div>
            <div className="camp">
              <div className="row1"><div className="logo">O</div><div className="status"><span className="d"></span> Open · 2d left</div></div>
              <h4>Everyday Ritual — Skincare routine integration</h4>
              <div className="brand-name">Oros Skincare</div>
              <div className="tags"><span>Beauty</span><span>Wellness</span><span>Reel + 2 Stories</span><span>US · CA</span></div>
              <div className="foot"><div><div className="lbl">Budget / creator</div><div className="val">$2,200</div></div><div className="apps">91 applicants</div></div>
            </div>
            <div className="camp">
              <div className="row1"><div className="logo">H</div><div className="status"><span className="d"></span> Open · 5d left</div></div>
              <h4>Trailheads — Outdoor gear in the wild</h4>
              <div className="brand-name">Halden Supply</div>
              <div className="tags"><span>Outdoor</span><span>Adventure</span><span>Reel</span><span>US · NO · JP</span></div>
              <div className="foot"><div><div className="lbl">Budget / creator</div><div className="val">$1,600</div></div><div className="apps">34 applicants</div></div>
            </div>
            <div className="camp">
              <div className="row1"><div className="logo">S</div><div className="status"><span className="d"></span> Open · 7d left</div></div>
              <h4>Studio Series — Home-office productivity</h4>
              <div className="brand-name">Sable Desk Co.</div>
              <div className="tags"><span>Design</span><span>Tech</span><span>Post</span><span>Global</span></div>
              <div className="foot"><div><div className="lbl">Budget / creator</div><div className="val">$950</div></div><div className="apps">55 applicants</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="logos" style={{paddingTop:'56px',paddingBottom:'56px',borderTop:'1px solid var(--line)'}}>
        <div className="wrap">
          <div className="logos-head">Trusted by teams running creator marketing at scale</div>
          <div className="logos-grid">
            <div className="logo-cell"><span className="mono">APERTURE</span></div>
            <div className="logo-cell">Noctua</div>
            <div className="logo-cell"><span className="mono">FOLIO°</span></div>
            <div className="logo-cell">Oros</div>
            <div className="logo-cell"><span className="mono">HALDEN</span></div>
            <div className="logo-cell">Sable</div>
            <div className="logo-cell">Marlow</div>
            <div className="logo-cell"><span className="mono">KIND/CO</span></div>
            <div className="logo-cell">Ferris</div>
            <div className="logo-cell"><span className="mono">NORTH/9</span></div>
            <div className="logo-cell">Atlas</div>
            <div className="logo-cell"><span className="mono">PARC</span></div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-kicker">05 — Signal</div>
              <h2 className="sec-title">What <em>people</em> are saying.</h2>
            </div>
            <p className="sec-sub">From the creators filling their calendars and the brand teams filling their funnels.</p>
          </div>
          <div className="quotes">
            <div className="quote">
              <p>I went from cold-emailing brands to having <em>six briefs waiting</em> for me every Monday morning. The escrow alone changed my business.</p>
              <div className="who"><div className="av">M</div><div><div className="name">Maia Field</div><div className="role">Creator · 184K · Lifestyle</div></div></div>
            </div>
            <div className="quote">
              <p>We replaced a full talent agency with InfluMatch. <em>Same ROAS</em>, a third of the cost, and we own the creator relationships.</p>
              <div className="who"><div className="av">D</div><div><div className="name">Daniela Roth</div><div className="role">Head of Brand · Aperture</div></div></div>
            </div>
            <div className="quote">
              <p>The applicant ranking is the real product. <em>We shortlist in minutes</em>, not weeks, and the matches are genuinely on-brand.</p>
              <div className="who"><div className="av">J</div><div><div className="name">Jonah Park</div><div className="role">Growth Lead · Noctua</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="wrap">
          <div className="sec-head" style={{justifyContent:'center',textAlign:'center'}}>
            <div>
              <div className="sec-kicker">06 — Answers</div>
              <h2 className="sec-title">Frequently <em>asked.</em></h2>
            </div>
          </div>
          <div className="faq">
            <details className="q" open>
              <summary>How does InfluMatch make money?<span className="plus">+</span></summary>
              <div className="ans">We take a flat 8% platform fee on completed campaigns, paid by the brand. Creators keep 100% of their negotiated rate. No subscription, no hidden fees, no minimums.</div>
            </details>
            <details className="q">
              <summary>Who vets the creators?<span className="plus">+</span></summary>
              <div className="ans">Every creator is reviewed for audience authenticity, engagement quality and past brand safety before they can apply. We use a combination of automated audits and human review.</div>
            </details>
            <details className="q">
              <summary>How are payouts handled?<span className="plus">+</span></summary>
              <div className="ans">Brand budgets sit in escrow for the duration of a campaign. Funds release automatically to creators the moment deliverables are approved — usually within 24 hours of posting.</div>
            </details>
            <details className="q">
              <summary>Can I run campaigns across multiple platforms?<span className="plus">+</span></summary>
              <div className="ans">Yes. Briefs support Instagram, TikTok, YouTube and long-form newsletters. Performance metrics are normalized into a single dashboard so you can compare like-for-like.</div>
            </details>
            <details className="q">
              <summary>What's the minimum campaign budget?<span className="plus">+</span></summary>
              <div className="ans">$500 per brief. We don't recommend going lower — creator supply and applicant quality both drop off significantly below that threshold.</div>
            </details>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <h2>The <em>marketplace</em><br/>is <span className="accent">open.</span></h2>
          <p className="sub">Start a campaign in under ten minutes — or browse 1,248 open briefs waiting for creators right now.</p>
          <div className="cta-btns">
            <a className="btn btn-solid" href="/signup">Apply as a creator →</a>
            <a className="btn btn-line" href="#">Book a walkthrough</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a href="#" className="brand"><span className="mark"></span>Influ<em>Match</em></a>
              <p>The marketplace for campaign-based creator collaborations. Brooklyn &amp; Lisbon.</p>
            </div>
            <div>
              <h5>Product</h5>
              <ul><li><a href="#">For creators</a></li><li><a href="#">For brands</a></li><li><a href="#">Pricing</a></li><li><a href="#">Changelog</a></li></ul>
            </div>
            <div>
              <h5>Resources</h5>
              <ul><li><a href="#">Benchmarks report</a></li><li><a href="#">Creator handbook</a></li><li><a href="#">Brand playbook</a></li><li><a href="#">API</a></li></ul>
            </div>
            <div>
              <h5>Company</h5>
              <ul><li><a href="#">About</a></li><li><a href="#">Careers</a></li><li><a href="#">Press</a></li><li><a href="#">Contact</a></li></ul>
            </div>
            <div>
              <h5>Legal</h5>
              <ul><li><a href="#">Terms</a></li><li><a href="#">Privacy</a></li><li><a href="#">Escrow policy</a></li><li><a href="#">Creator agreement</a></li></ul>
            </div>
          </div>
          <div className="foot-bot">
            <div>© 2026 InfluMatch, Inc.</div>
            <div>v4.12 · Status · All systems nominal</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
