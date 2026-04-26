import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import AvatarUpload from '../../components/ui/AvatarUpload';

const PROFILE_CSS = `
.op-prof .head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:32px;flex-wrap:wrap}
.op-prof .kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:12px}
.op-prof .kicker .n{color:var(--accent)}
.op-prof h1{font-family:var(--serif);font-weight:400;font-size:clamp(40px,4.4vw,56px);line-height:1;letter-spacing:-.02em;margin:0}
.op-prof h1 em{font-style:italic;color:var(--fg-dim)}
.op-prof .cta-row{display:flex;gap:10px}
.op-prof .btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;font-size:13px;font-weight:500;border:1px solid transparent;cursor:pointer;transition:.15s;white-space:nowrap}
.op-prof .btn-line{border-color:var(--line-2);color:var(--fg);background:var(--surface-1)}
.op-prof .btn-line:hover{background:var(--surface-1-hover)}
.op-prof .btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:500}
.op-prof .btn-solid:hover{filter:brightness(1.08)}
.op-prof .btn-solid:disabled{opacity:.45;cursor:not-allowed;filter:none}

.op-prof .hero{display:grid;grid-template-columns:auto 1fr;gap:26px;align-items:center;padding:28px;border:1px solid var(--line);border-radius:14px;background:var(--bg-2);margin-bottom:32px}
.op-prof .hero .logo{width:96px;height:96px;border-radius:18px;background:var(--surface-tint);border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:42px;color:var(--fg-mute);overflow:hidden}
.op-prof .hero .logo img{width:100%;height:100%;object-fit:cover;display:block}
.op-prof .hero h2{font-family:var(--serif);font-weight:400;font-size:34px;letter-spacing:-.015em;line-height:1;margin:0}
.op-prof .hero .line{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim);margin-top:10px}
.op-prof .hero .line span{color:var(--fg-mute);margin:0 8px}
.op-prof .hero .desc{color:var(--fg-dim);font-size:14px;line-height:1.55;margin-top:14px;max-width:560px}

.op-prof .sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin:12px 0 16px}
.op-prof .sec-head h3{font-family:var(--serif);font-weight:400;font-size:26px;letter-spacing:-.015em;margin:0;line-height:1.05}
.op-prof .sec-head h3 em{font-style:italic;color:var(--fg-dim)}

.op-prof .card{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:24px;margin-bottom:18px}
.op-prof .kv{display:grid;grid-template-columns:repeat(2,1fr);gap:18px 24px}
.op-prof .kv .cell .l{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute)}
.op-prof .kv .cell .v{font-size:14px;color:var(--fg);margin-top:6px;line-height:1.4;word-break:break-word}
.op-prof .kv .cell .v.empty{color:var(--fg-mute);font-style:italic;font-family:var(--serif)}

.op-prof .fld{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.op-prof .fld label{font-size:13px;color:var(--fg);font-weight:500}
.op-prof .fld label .opt{color:var(--fg-mute);font-weight:400}
.op-prof .fld input,.op-prof .fld textarea{width:100%;border-radius:10px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:12px 14px;font-family:var(--sans);font-size:14px;outline:none;transition:.15s;line-height:1.5}
.op-prof .fld textarea{min-height:110px;resize:vertical}
.op-prof .fld input:focus,.op-prof .fld textarea:focus{border-color:var(--accent);background:var(--accent-soft)}
.op-prof .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.op-prof .saved{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid var(--accent);background:var(--accent-soft);color:var(--accent);border-radius:999px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}

@media (max-width:900px){
  .op-prof .hero{grid-template-columns:auto 1fr;gap:18px}
  .op-prof .kv,.op-prof .grid-2{grid-template-columns:1fr}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('op-prof-styles')) {
  const tag = document.createElement('style');
  tag.id = 'op-prof-styles';
  tag.textContent = PROFILE_CSS;
  document.head.appendChild(tag);
}

export default function OwnerProfile() {
  const { user, completeOwnerOnboarding } = useAuth();
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [form, setForm] = useState({
    business: user.profile?.business || '',
    city: user.profile?.city || '',
    category: user.profile?.category || '',
    website: user.profile?.website || '',
    phone: user.profile?.phone || '',
    budget: user.profile?.budget || '',
    description: user.profile?.description || '',
    avatarUrl: user.profile?.avatarUrl || '',
  });

  const profile = user.profile || {};
  const initial = (profile.business?.charAt(0) || 'B').toUpperCase();

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    await completeOwnerOnboarding({
      business: form.business.trim(),
      city: form.city.trim(),
      category: form.category.trim(),
      website: form.website.trim(),
      phone: form.phone.trim(),
      budget: form.budget.trim(),
      description: form.description.trim(),
      avatarUrl: form.avatarUrl || '',
    });
    setEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2400);
  };

  const cancel = () => {
    setForm({
      business: profile.business || '',
      city: profile.city || '',
      category: profile.category || '',
      website: profile.website || '',
      phone: profile.phone || '',
      budget: profile.budget || '',
      description: profile.description || '',
      avatarUrl: profile.avatarUrl || '',
    });
    setEditing(false);
  };

  return (
    <OwnerLayout title="Profile">
      <div className="op-prof">
        <div className="head">
          <div>
            <div className="kicker"><span className="n">01 —</span> Brand profile</div>
            <h1>Your <em>brand.</em></h1>
          </div>
          <div className="cta-row">
            {justSaved && <span className="saved">✓ Saved</span>}
            {!editing && <button className="btn btn-solid" onClick={() => setEditing(true)}>Edit profile →</button>}
            {editing && (
              <>
                <button className="btn btn-line" onClick={cancel}>Cancel</button>
                <button className="btn btn-solid" onClick={save} disabled={!form.business.trim()}>Save changes →</button>
              </>
            )}
          </div>
        </div>

        <div className="hero">
          <div className="logo">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : initial}
          </div>
          <div>
            <h2>{profile.business || 'Unnamed brand'}</h2>
            <div className="line">
              {profile.category || 'Uncategorised'}
              {profile.city && <><span>·</span>{profile.city}</>}
              {profile.budget && <><span>·</span>{profile.budget}</>}
            </div>
            {profile.description && <p className="desc">{profile.description}</p>}
          </div>
        </div>

        {!editing && (
          <>
            <div className="sec-head"><h3>Brand <em>info.</em></h3></div>
            <div className="card">
              <div className="kv">
                <div className="cell"><div className="l">Business name</div><div className={'v' + (!profile.business ? ' empty' : '')}>{profile.business || 'not set'}</div></div>
                <div className="cell"><div className="l">Email</div><div className="v">{user.email}</div></div>
                <div className="cell"><div className="l">Category</div><div className={'v' + (!profile.category ? ' empty' : '')}>{profile.category || 'not set'}</div></div>
                <div className="cell"><div className="l">City</div><div className={'v' + (!profile.city ? ' empty' : '')}>{profile.city || 'not set'}</div></div>
                <div className="cell"><div className="l">Website</div><div className={'v' + (!profile.website ? ' empty' : '')}>{profile.website || 'not set'}</div></div>
                <div className="cell"><div className="l">Phone</div><div className={'v' + (!profile.phone ? ' empty' : '')}>{profile.phone || 'not set'}</div></div>
                <div className="cell"><div className="l">Typical budget</div><div className={'v' + (!profile.budget ? ' empty' : '')}>{profile.budget || 'not set'}</div></div>
                <div className="cell" style={{ gridColumn:'1 / -1' }}><div className="l">Description</div><div className={'v' + (!profile.description ? ' empty' : '')}>{profile.description || 'No description yet — tell creators what your brand is about.'}</div></div>
              </div>
            </div>
          </>
        )}

        {editing && (
          <>
            <div className="sec-head"><h3>Edit <em>profile.</em></h3></div>
            <div className="card">
              <div className="fld">
                <label>Brand logo or photo <span className="opt">— optional, recommended</span></label>
                <AvatarUpload
                  value={form.avatarUrl}
                  onChange={(v) => update('avatarUrl', v)}
                  label="Add logo"
                  hint="Your logo or a storefront photo. JPG or PNG, up to 8 MB."
                  shape="square"
                />
              </div>
              <div className="grid-2">
                <div className="fld">
                  <label>Business name</label>
                  <input type="text" value={form.business} onChange={(e) => update('business', e.target.value)} />
                </div>
                <div className="fld">
                  <label>Category</label>
                  <input type="text" value={form.category} onChange={(e) => update('category', e.target.value)} />
                </div>
                <div className="fld">
                  <label>City</label>
                  <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
                <div className="fld">
                  <label>Website</label>
                  <input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://yourbusiness.com" />
                </div>
                <div className="fld">
                  <label>Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
                <div className="fld">
                  <label>Typical budget</label>
                  <input type="text" value={form.budget} onChange={(e) => update('budget', e.target.value)} placeholder="e.g. ₹25K – ₹1L" />
                </div>
              </div>
              <div className="fld">
                <label>Description <span className="opt">— optional</span></label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="What does your business do? What makes it unique?" />
              </div>
            </div>
          </>
        )}
      </div>
    </OwnerLayout>
  );
}
