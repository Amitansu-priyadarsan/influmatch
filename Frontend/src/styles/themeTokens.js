// Global editorial theme tokens. Imported once at app boot.
// Scopes both onboarding (.im-onb) and creator app (.im-app) wrappers
// to inherit from [data-theme] on <html>.

const TOKENS = `
:root,
:root[data-theme="dark"],
.im-app,
.im-onb {
  --bg:#0b0b0c;
  --bg-2:#111113;
  --bg-3:#17171a;
  --surface-hover:#18181b;
  --line:rgba(255,255,255,0.08);
  --line-2:rgba(255,255,255,0.14);
  --fg:#ededec;
  --fg-dim:#a6a6a3;
  --fg-mute:#6b6b68;
  --accent:oklch(0.86 0.14 104);
  --accent-ink:#0b0b0c;
  --accent-soft:rgba(212,244,52,0.10);
  --accent-border:rgba(212,244,52,0.55);
  --avatar-from:#2b2b30;
  --avatar-to:#1a1a1d;
  --logo-from:#222222;
  --logo-to:#111111;
  --bg-translucent:rgba(11,11,12,0.7);
  --surface-1:rgba(255,255,255,0.02);
  --surface-1-hover:rgba(255,255,255,0.06);
  --surface-tint:rgba(255,255,255,0.04);
  --surface-faint:rgba(255,255,255,0.012);
  --grid-line:rgba(255,255,255,0.025);
  --scrim:rgba(11,11,12,0.72);
  --danger:#ff8a8a;
  --danger-soft:rgba(255,138,138,0.06);
  --danger-border:rgba(255,138,138,0.35);
  --serif:'Instrument Serif','Times New Roman',serif;
  --sans:'Geist',ui-sans-serif,system-ui,sans-serif;
  --mono:'Geist Mono',ui-monospace,monospace;
}

:root[data-theme="light"],
:root[data-theme="light"] .im-app,
:root[data-theme="light"] .im-onb {
  --bg:#faf9f5;
  --bg-2:#f2f1ec;
  --bg-3:#e8e7e1;
  --surface-hover:#ecebe4;
  --line:rgba(0,0,0,0.08);
  --line-2:rgba(0,0,0,0.16);
  --fg:#18181a;
  --fg-dim:#55554f;
  --fg-mute:#88887f;
  --accent:oklch(0.78 0.17 105);
  --accent-ink:#0b0b0c;
  --accent-soft:rgba(170,195,30,0.16);
  --accent-border:rgba(150,175,20,0.55);
  --avatar-from:#dcdbd5;
  --avatar-to:#ebeae3;
  --logo-from:#d2d1cb;
  --logo-to:#e8e7e1;
  --bg-translucent:rgba(250,249,245,0.78);
  --surface-1:rgba(0,0,0,0.025);
  --surface-1-hover:rgba(0,0,0,0.05);
  --surface-tint:rgba(0,0,0,0.04);
  --surface-faint:rgba(0,0,0,0.018);
  --grid-line:rgba(0,0,0,0.05);
  --scrim:rgba(15,15,12,0.45);
  --danger:#c62828;
  --danger-soft:rgba(198,40,40,0.06);
  --danger-border:rgba(198,40,40,0.35);
}
`;

if (typeof document !== 'undefined' && !document.getElementById('im-theme-tokens')) {
  const tag = document.createElement('style');
  tag.id = 'im-theme-tokens';
  tag.textContent = TOKENS;
  // Insert at top of head so per-page scoped CSS can override structural rules
  // but tokens cascade as base.
  document.head.insertBefore(tag, document.head.firstChild);
}
