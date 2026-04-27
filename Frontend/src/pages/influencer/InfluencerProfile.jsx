import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import InfluencerLayout from '../../components/layouts/InfluencerLayout';
import AvatarUpload from '../../components/ui/AvatarUpload';
import GalleryUpload from '../../components/ui/GalleryUpload';
import PhotoGallery from '../../components/ui/PhotoGallery';

const PROFILE_CSS = `
.im-prof .head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:32px;flex-wrap:wrap}
.im-prof .kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg-mute);margin-bottom:12px}
.im-prof .kicker .n{color:var(--accent)}
.im-prof h1{font-family:var(--serif);font-weight:400;font-size:clamp(40px,4.4vw,56px);line-height:1;letter-spacing:-.02em;margin:0}
.im-prof h1 em{font-style:italic;color:var(--fg-dim)}

.im-prof .cta-row{display:flex;gap:10px}
.im-prof .btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;font-size:13px;font-weight:500;border:1px solid transparent;cursor:pointer;transition:.15s;white-space:nowrap}
.im-prof .btn-line{border-color:var(--line-2);color:var(--fg);background:var(--surface-1)}
.im-prof .btn-line:hover{background:var(--surface-1-hover)}
.im-prof .btn-solid{background:var(--accent);color:var(--accent-ink);font-weight:500}
.im-prof .btn-solid:hover{filter:brightness(1.08)}
.im-prof .btn-solid:disabled{opacity:.45;cursor:not-allowed;filter:none}

.im-prof .hero{display:grid;grid-template-columns:auto 1fr auto;gap:26px;align-items:center;padding:28px;border:1px solid var(--line);border-radius:14px;background:var(--bg-2);margin-bottom:32px}
.im-prof .hero .av{width:86px;height:86px;border-radius:50%;background:linear-gradient(135deg,var(--avatar-from),var(--avatar-to));border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:40px;color:var(--fg-dim);overflow:hidden}
.im-prof .hero .av img{width:100%;height:100%;object-fit:cover;display:block}
.im-prof .hero h2{font-family:var(--serif);font-weight:400;font-size:34px;letter-spacing:-.015em;line-height:1;margin:0}
.im-prof .hero .line{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-dim);margin-top:10px}
.im-prof .hero .line span{color:var(--fg-mute);margin:0 8px}
.im-prof .hero .bio{color:var(--fg-dim);font-size:14px;line-height:1.55;margin-top:14px;max-width:560px}
.im-prof .hero .pct{text-align:right;padding-left:24px;border-left:1px solid var(--line);min-width:160px}
.im-prof .hero .pct .lbl{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute)}
.im-prof .hero .pct .val{font-family:var(--serif);font-size:52px;color:var(--accent);font-style:italic;line-height:1;margin-top:8px}
.im-prof .hero .pct .bar{width:100%;height:4px;background:var(--line);border-radius:999px;overflow:hidden;margin-top:10px}
.im-prof .hero .pct .bar i{display:block;height:100%;background:var(--accent);transition:width .3s}

.im-prof .sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin:12px 0 16px}
.im-prof .sec-head h3{font-family:var(--serif);font-weight:400;font-size:26px;letter-spacing:-.015em;margin:0;line-height:1.05}
.im-prof .sec-head h3 em{font-style:italic;color:var(--fg-dim)}

.im-prof .card{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:24px;margin-bottom:18px}
.im-prof .kv{display:grid;grid-template-columns:repeat(2,1fr);gap:18px 24px}
.im-prof .kv .cell .l{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--fg-mute)}
.im-prof .kv .cell .v{font-size:14px;color:var(--fg);margin-top:6px;line-height:1.4;word-break:break-word}
.im-prof .kv .cell .v.empty{color:var(--fg-mute);font-style:italic;font-family:var(--serif)}

.im-prof .plats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.im-prof .plat{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:var(--surface-faint);color:inherit;text-decoration:none;transition:.15s}
.im-prof a.plat{cursor:pointer}
.im-prof a.plat:hover{border-color:var(--accent);background:var(--surface-tint)}
.im-prof a.plat:hover .pi{color:var(--accent)}
.im-prof .plat .pi{width:32px;height:32px;border-radius:8px;background:var(--surface-tint);border:1px solid var(--line-2);display:grid;place-items:center;color:var(--fg-dim);flex:none}
.im-prof .plat .pn{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg)}
.im-prof .plat .ph{font-size:13px;color:var(--fg-dim);margin-top:2px}
.im-prof .plat .fol{margin-left:auto;font-family:var(--serif);font-size:20px;color:var(--accent);font-style:italic}
.im-prof .plat-empty{color:var(--fg-mute);font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase}
.im-prof .gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}
.im-prof .gallery-grid img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px;border:1px solid var(--line);background:var(--surface-faint)}
.im-prof .gallery-empty{padding:32px;text-align:center;border:1px dashed var(--line-2);border-radius:12px;color:var(--fg-mute);font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}

.im-prof .fld{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.im-prof .fld label{font-size:13px;color:var(--fg);font-weight:500}
.im-prof .fld label .opt{color:var(--fg-mute);font-weight:400}
.im-prof .fld input,.im-prof .fld textarea{width:100%;border-radius:10px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:12px 14px;font-family:var(--sans);font-size:14px;outline:none;transition:.15s;line-height:1.5}
.im-prof .fld textarea{min-height:110px;resize:vertical}
.im-prof .fld input:focus,.im-prof .fld textarea:focus{border-color:var(--accent);background:var(--accent-soft)}
.im-prof .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}

.im-prof .saved{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid var(--accent);background:var(--accent-soft);color:var(--accent);border-radius:999px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}

@media (max-width:900px){
  .im-prof .hero{grid-template-columns:auto 1fr;gap:18px}
  .im-prof .hero .pct{grid-column:1 / -1;text-align:left;border-left:0;padding-left:0;border-top:1px solid var(--line);padding-top:14px}
  .im-prof .kv,.im-prof .plats,.im-prof .grid-2{grid-template-columns:1fr}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('im-prof-styles')) {
  const tag = document.createElement('style');
  tag.id = 'im-prof-styles';
  tag.textContent = PROFILE_CSS;
  document.head.appendChild(tag);
}

const PLATFORM_LABELS = {
  instagram:'Instagram', youtube:'YouTube', tiktok:'TikTok',
  twitter:'X / Twitter', linkedin:'LinkedIn', substack:'Newsletter',
};
const PLATFORM_ICONS = {
  instagram:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
  youtube:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg>,
  tiktok:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.5a3.5 3.5 0 11-3.5-3.5"/><path d="M14 4c0 2.5 2 4.5 4.5 4.5"/></svg>,
  twitter:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l16 16M20 4L4 20"/></svg>,
  linkedin:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 114 0v4M12 10v7" strokeLinecap="round"/></svg>,
  substack:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d="M4 5h16M4 10h16M4 15h16v5l-8-4-8 4z"/></svg>,
};

function platformUrl(id, handle) {
  if (!handle) return null;
  const h = String(handle).trim();
  if (!h) return null;
  if (/^https?:\/\//i.test(h)) return h;
  if (/^[\w-]+\.[\w.-]+/.test(h) && !h.startsWith('@')) return 'https://' + h.replace(/^\/+/, '');
  const u = h.replace(/^@/, '');
  switch (id) {
    case 'instagram': return `https://instagram.com/${u}`;
    case 'youtube':   return `https://youtube.com/@${u}`;
    case 'tiktok':    return `https://tiktok.com/@${u}`;
    case 'twitter':   return `https://twitter.com/${u}`;
    case 'linkedin':  return `https://linkedin.com/in/${u}`;
    case 'substack':  return `https://${u}.substack.com`;
    default: return null;
  }
}

function computePct(profile) {
  if (!profile) return 0;
  const fields = [
    profile.fullName, profile.phone, profile.city, profile.bio, profile.niche,
    profile.instagram || (profile.platforms && Object.keys(profile.platforms).length > 0),
    profile.followers,
  ];
  const filled = fields.filter((f) => !!f && String(f).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export default function InfluencerProfile() {
  const { user, completeOnboarding } = useAuth();
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: user.profile?.fullName || '',
    phone: user.profile?.phone || '',
    city: user.profile?.city || '',
    bio: user.profile?.bio || '',
    niche: user.profile?.niche || '',
    instagram: user.profile?.instagram || user.profile?.platforms?.instagram?.handle || '',
    followers: user.profile?.followers || user.profile?.platforms?.instagram?.followers || '',
    avatarUrl: user.profile?.avatarUrl || '',
    gallery: user.profile?.gallery || [],
  });

  const profile = user.profile || {};
  const pct = computePct(profile);
  const initial = (profile.fullName?.charAt(0) || user.email?.charAt(0) || 'C').toUpperCase();
  const platforms = profile.platforms || {};
  const platformEntries = Object.entries(platforms).filter(([, v]) => v && (v.handle || v.followers));

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    const ig = form.instagram.trim();
    const fol = form.followers.trim();
    const mergedPlatforms = { ...(profile.platforms || {}) };
    if (ig || fol) {
      mergedPlatforms.instagram = {
        ...(mergedPlatforms.instagram || {}),
        handle: ig,
        followers: fol,
      };
    } else {
      delete mergedPlatforms.instagram;
    }
    completeOnboarding({
      ...profile,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      bio: form.bio.trim(),
      niche: form.niche.trim(),
      instagram: ig,
      followers: fol,
      avatarUrl: form.avatarUrl || '',
      gallery: form.gallery || [],
      platforms: mergedPlatforms,
      niches: profile.niches || [],
      contentTypes: profile.contentTypes || [],
    });
    setEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2400);
  };

  const cancel = () => {
    setForm({
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      city: profile.city || '',
      bio: profile.bio || '',
      niche: profile.niche || '',
      instagram: profile.instagram || profile.platforms?.instagram?.handle || '',
      followers: profile.followers || profile.platforms?.instagram?.followers || '',
      avatarUrl: profile.avatarUrl || '',
      gallery: profile.gallery || [],
    });
    setEditing(false);
  };

  return (
    <InfluencerLayout title="Profile">
      <div className="im-prof">
        <div className="head">
          <div>
            <div className="kicker"><span className="n">04 —</span> Profile</div>
            <h1>Your <em>profile.</em></h1>
          </div>
          <div className="cta-row">
            {justSaved && <span className="saved">✓ Saved</span>}
            {!editing && <button className="btn btn-solid" onClick={() => setEditing(true)}>Edit profile →</button>}
            {editing && (
              <>
                <button className="btn btn-line" onClick={cancel}>Cancel</button>
                <button className="btn btn-solid" onClick={save} disabled={!form.fullName.trim()}>Save changes →</button>
              </>
            )}
          </div>
        </div>

        <div className="hero">
          <div className="av">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : initial}
          </div>
          <div>
            <h2>{profile.fullName || 'Unnamed creator'}</h2>
            <div className="line">
              {profile.instagram || user.email}
              {profile.city && <><span>·</span>{profile.city}</>}
              {profile.niche && <><span>·</span>{profile.niche}</>}
            </div>
            {profile.bio && <p className="bio">{profile.bio}</p>}
          </div>
          <div className="pct">
            <div className="lbl">Completion</div>
            <div className="val">{pct}%</div>
            <div className="bar"><i style={{ width: pct + '%' }} /></div>
          </div>
        </div>

        {!editing && (
          <>
            <div className="sec-head"><h3>Basic <em>info.</em></h3></div>
            <div className="card">
              <div className="kv">
                <div className="cell"><div className="l">Full name</div><div className={'v' + (!profile.fullName ? ' empty' : '')}>{profile.fullName || 'not set'}</div></div>
                <div className="cell"><div className="l">Email</div><div className="v">{user.email}</div></div>
                <div className="cell"><div className="l">Phone</div><div className={'v' + (!profile.phone ? ' empty' : '')}>{profile.phone || 'not set'}</div></div>
                <div className="cell"><div className="l">City</div><div className={'v' + (!profile.city ? ' empty' : '')}>{profile.city || 'not set'}</div></div>
                <div className="cell"><div className="l">Niche</div><div className={'v' + (!profile.niche ? ' empty' : '')}>{profile.niche || 'not set'}</div></div>
                <div className="cell"><div className="l">Primary followers</div><div className={'v' + (!profile.followers ? ' empty' : '')}>{profile.followers || 'not set'}</div></div>
                <div className="cell" style={{ gridColumn:'1 / -1' }}><div className="l">Bio</div><div className={'v' + (!profile.bio ? ' empty' : '')}>{profile.bio || 'No bio yet — tell brands what you care about.'}</div></div>
              </div>
            </div>

            <div className="sec-head"><h3>Portfolio <em>photos.</em></h3></div>
            <div className="card">
              <PhotoGallery
                photos={profile.gallery || []}
                emptyText="No portfolio photos yet — add up to 5 to stand out."
              />
            </div>

            <div className="sec-head"><h3>Platforms <em>& reach.</em></h3></div>
            <div className="card">
              {platformEntries.length === 0 && !profile.instagram ? (
                <div className="plat-empty">No platforms connected yet.</div>
              ) : platformEntries.length > 0 ? (
                <div className="plats">
                  {platformEntries.map(([id, v]) => {
                    const url = platformUrl(id, v.handle);
                    const Tag = url ? 'a' : 'div';
                    const props = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {};
                    return (
                      <Tag key={id} className="plat" {...props}>
                        <div className="pi">{PLATFORM_ICONS[id] || PLATFORM_ICONS.instagram}</div>
                        <div>
                          <div className="pn">{PLATFORM_LABELS[id] || id}</div>
                          <div className="ph">{v.handle || '—'}</div>
                        </div>
                        <div className="fol">{v.followers || '—'}</div>
                      </Tag>
                    );
                  })}
                </div>
              ) : (
                <div className="plats">
                  {(() => {
                    const url = platformUrl('instagram', profile.instagram);
                    const Tag = url ? 'a' : 'div';
                    const props = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {};
                    return (
                      <Tag className="plat" {...props}>
                        <div className="pi">{PLATFORM_ICONS.instagram}</div>
                        <div>
                          <div className="pn">Instagram</div>
                          <div className="ph">{profile.instagram}</div>
                        </div>
                        <div className="fol">{profile.followers || '—'}</div>
                      </Tag>
                    );
                  })()}
                </div>
              )}
            </div>
          </>
        )}

        {editing && (
          <>
            <div className="sec-head"><h3>Edit <em>profile.</em></h3></div>
            <div className="card">
              <div className="fld">
                <label>Profile photo <span className="opt">— optional, recommended</span></label>
                <AvatarUpload
                  value={form.avatarUrl}
                  onChange={(v) => update('avatarUrl', v)}
                  label="Add photo"
                  hint="A clear face shot helps brands recognise you. JPG or PNG, up to 8 MB."
                />
              </div>
              <div className="fld">
                <label>Portfolio photos <span className="opt">— up to 5. Creators with 3+ samples get 5× more match offers.</span></label>
                <GalleryUpload
                  value={form.gallery}
                  onChange={(v) => update('gallery', v)}
                  hint="Show your style: Reels stills, product shots, lifestyle frames."
                />
              </div>
              <div className="grid-2">
                <div className="fld">
                  <label>Full name</label>
                  <input type="text" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
                </div>
                <div className="fld">
                  <label>Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
                <div className="fld">
                  <label>City</label>
                  <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
                <div className="fld">
                  <label>Niche</label>
                  <input type="text" value={form.niche} onChange={(e) => update('niche', e.target.value)} />
                </div>
                <div className="fld">
                  <label>Instagram handle</label>
                  <input type="text" placeholder="@yourhandle" value={form.instagram} onChange={(e) => update('instagram', e.target.value)} />
                </div>
                <div className="fld">
                  <label>Followers</label>
                  <input type="text" placeholder="45K" value={form.followers} onChange={(e) => update('followers', e.target.value)} />
                </div>
              </div>
              <div className="fld">
                <label>Bio <span className="opt">— optional</span></label>
                <textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} placeholder="Tell brands about your content and what you care about..." />
              </div>
            </div>
          </>
        )}
      </div>
    </InfluencerLayout>
  );
}
