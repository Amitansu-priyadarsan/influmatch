import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const OWNER_ONB_CSS = `
.im-onb .chip-row{display:flex;flex-wrap:wrap;gap:10px}
.im-onb .chip{padding:9px 16px;border-radius:999px;border:1px solid var(--line-2);background:var(--surface-1);font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-dim);cursor:pointer;transition:.15s}
.im-onb .chip:hover{border-color:var(--line-2);color:var(--fg)}
.im-onb .chip.selected{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
`;

if (typeof document !== 'undefined' && !document.getElementById('im-onb-owner-base')) {
  const tag = document.createElement('style');
  tag.id = 'im-onb-owner-base';
  tag.textContent = OWNER_ONB_CSS;
  document.head.appendChild(tag);
}

const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>
);

const CATEGORIES = [
  { id:'food', name:'Food & Beverage',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v18M18 3v6a3 3 0 01-3 3v9M9 3v6M12 3v6M6 10a3 3 0 006 0"/></svg> },
  { id:'fashion', name:'Fashion & Apparel',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d="M8 4l4 3 4-3 4 3-2 4-2-1v10H6V10l-2 1-2-4z"/></svg> },
  { id:'beauty', name:'Beauty & Cosmetics',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2 5 5 .5-4 3.5 1.5 5-4.5-3-4.5 3L9 12 5 8.5 10 8z"/></svg> },
  { id:'fitness', name:'Fitness & Wellness',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h2M19 12h2M7 8v8M17 8v8M7 12h10"/></svg> },
  { id:'tech', name:'Tech & Gadgets',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 21h8M12 17v4"/></svg> },
  { id:'home', name:'Home & Lifestyle',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H10v6H4a1 1 0 01-1-1z"/></svg> },
  { id:'travel', name:'Travel & Hospitality',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16l20-8-8 14-3-6z"/></svg> },
  { id:'services', name:'Services',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> },
  { id:'other', name:'Other',
    svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/></svg> },
];

const BUDGETS = [
  { id:'micro', label:'Under ₹25K' },
  { id:'small', label:'₹25K – ₹1L' },
  { id:'mid',   label:'₹1L – ₹5L' },
  { id:'large', label:'₹5L+' },
];

const STEPS = [
  { id:1, label:'Business' },
  { id:2, label:'Brand profile' },
];

export default function OwnerOnboarding() {
  const { completeOwnerOnboarding } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    business: '', category: '', city: '',
    website: '', phone: '', budget: '', description: '',
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const goto = (n) => {
    if (n < 1 || n > 2) return;
    setStep(n);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const continueStep1 = () => {
    const e = {};
    if (!form.business.trim()) e.business = 'Business name is required';
    if (!form.category) e.category = 'Pick a category';
    if (!form.city.trim()) e.city = 'City is required';
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    goto(2);
  };

  const finish = () => {
    const categoryName = CATEGORIES.find((c) => c.id === form.category)?.name || '';
    const budgetLabel = BUDGETS.find((b) => b.id === form.budget)?.label || '';
    completeOwnerOnboarding({
      business: form.business.trim(),
      city: form.city.trim(),
      category: categoryName,
      website: form.website.trim(),
      phone: form.phone.trim(),
      budget: budgetLabel,
      description: form.description.trim(),
    });
    setDone(true);
  };

  const progress = step * 50;

  return (
    <div className="im-onb">
      <div className="grid-bg" />
      <div className="glow" />

      <div className="shell">
        <aside className="side">
          <a href="/" className="brand"><span className="mark" />Influ<em>Match</em></a>

          <div>
            <div className="side-eyebrow">Brand onboarding</div>
            <h3 className="side-tag">Find the <em>creators</em> your audience already <span className="accent">trusts.</span></h3>
            <p className="side-lede">Tell us about your business, set your campaign profile, and we'll match you with creators who fit your brand.</p>
          </div>

          <nav className="stepper">
            {STEPS.map((s) => {
              const cls = 'step' + (step === s.id ? ' active' : step > s.id ? ' done' : '');
              return (
                <div key={s.id} className={cls}>
                  <span className="dot">{step > s.id ? <IconCheck width="13" height="13" /> : s.id}</span>
                  <span className="label">{s.label}</span>
                  <span className="chev">→</span>
                </div>
              );
            })}
          </nav>

          <div className="side-foot">
            <span className="pulse" />
            <span>Autosaving · encrypted</span>
          </div>
        </aside>

        <main className="main">
          <div className="main-top">
            <div className="progress">
              <span>Step {String(step).padStart(2,'0')} of 02</span>
              <span className="bar"><i style={{ width: progress + '%' }} /></span>
            </div>
            <div className="right" style={{ display:'flex', gap:18, alignItems:'center' }}>
              <button onClick={toggleTheme} title="Toggle theme" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--fg-dim)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.14em', textTransform:'uppercase' }}>
                {theme === 'dark' ? '☀ Light' : '☾ Dark'}
              </button>
              <span>Having troubles? <a>Get help →</a></span>
            </div>
          </div>

          <div className="main-body">
            {step === 1 && (
              <section>
                <div className="q-kicker"><span className="n">01 —</span> Business</div>
                <h2 className="q">Tell us about your <em>business.</em></h2>
                <p className="q-sub">Your brand name, category, and city — this is what creators will see when they browse briefs.</p>

                <div className="form-col">
                  <div className="fld">
                    <label>Business name <span className="req">*</span></label>
                    <div className="inp">
                      <span className="lico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg>
                      </span>
                      <input type="text" placeholder="e.g. Brewhouse Cafe"
                        value={form.business}
                        onChange={(e) => update('business', e.target.value)} />
                    </div>
                    {errors.business && <div className="err">{errors.business}</div>}
                  </div>

                  <div className="fld">
                    <label>Category <span className="req">*</span></label>
                    <div className="grid" style={{ marginTop: 4 }}>
                      {CATEGORIES.map((c) => (
                        <button key={c.id} type="button"
                          className={'tile' + (form.category === c.id ? ' selected' : '')}
                          onClick={() => update('category', c.id)}>
                          <span className="chk"><IconCheck /></span>
                          <span className="ico">{c.svg}</span>
                          <span className="name">{c.name}</span>
                        </button>
                      ))}
                    </div>
                    {errors.category && <div className="err">{errors.category}</div>}
                  </div>

                  <div className="fld">
                    <label>City <span className="req">*</span></label>
                    <div className="inp">
                      <span className="lico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>
                      </span>
                      <input type="text" placeholder="e.g. Bangalore"
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)} />
                    </div>
                    {errors.city && <div className="err">{errors.city}</div>}
                  </div>
                </div>

                <div className="nav-row">
                  <button className="btn btn-line" onClick={() => navigate('/')}>← Cancel</button>
                  <button className="btn btn-solid" onClick={continueStep1}>Continue <span>→</span></button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <div className="q-kicker"><span className="n">02 —</span> Brand profile</div>
                <h2 className="q">How should creators <em>reach</em> you?</h2>
                <p className="q-sub">A few extra details help creators pitch the right ideas. All optional — you can update these later.</p>

                <div className="form-col">
                  <div className="fld">
                    <label>Website <span style={{ color:'var(--fg-mute)', fontWeight:400 }}>— optional</span></label>
                    <div className="inp">
                      <span className="lico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>
                      </span>
                      <input type="url" placeholder="https://yourbusiness.com"
                        value={form.website}
                        onChange={(e) => update('website', e.target.value)} />
                    </div>
                  </div>

                  <div className="fld">
                    <label>Contact phone <span style={{ color:'var(--fg-mute)', fontWeight:400 }}>— optional</span></label>
                    <div className="inp">
                      <span className="lico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 012-2h2l2 5-2 1a12 12 0 006 6l1-2 5 2v2a2 2 0 01-2 2A16 16 0 014 5z"/></svg>
                      </span>
                      <input type="tel" placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)} />
                    </div>
                  </div>

                  <div className="fld">
                    <label>Typical campaign budget <span style={{ color:'var(--fg-mute)', fontWeight:400 }}>— optional</span></label>
                    <div className="chip-row" style={{ marginTop: 4 }}>
                      {BUDGETS.map((b) => (
                        <button key={b.id} type="button"
                          className={'chip' + (form.budget === b.id ? ' selected' : '')}
                          onClick={() => update('budget', form.budget === b.id ? '' : b.id)}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="fld">
                    <label>Short description <span style={{ color:'var(--fg-mute)', fontWeight:400 }}>— optional</span></label>
                    <div className="inp">
                      <span className="lico">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>
                      </span>
                      <textarea placeholder="What does your business do? What makes it unique?"
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)} />
                    </div>
                  </div>

                  <div className="success">
                    <span className="chk"><IconCheck /></span>
                    <div>
                      <b>You're almost done.</b>
                      <span>Hit <kbd>Finish</kbd> to create your business profile and head to your dashboard.</span>
                    </div>
                  </div>
                </div>

                <div className="nav-row">
                  <button className="btn btn-line" onClick={() => goto(1)}>← Back</button>
                  <button className="btn btn-solid" onClick={finish}>Finish <span>→</span></button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {done && (
        <div className="overlay">
          <div className="card">
            <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--accent)', color:'var(--accent-ink)', display:'grid', placeItems:'center', margin:'0 auto 18px' }}>
              <IconCheck width="22" height="22" />
            </div>
            <h3>Welcome to <em>InfluMatch.</em></h3>
            <p>Your business profile is live. Create your first campaign and start matching with creators now.</p>
            <button className="btn btn-solid" onClick={() => navigate('/owner/dashboard')}>Go to dashboard →</button>
          </div>
        </div>
      )}
    </div>
  );
}
