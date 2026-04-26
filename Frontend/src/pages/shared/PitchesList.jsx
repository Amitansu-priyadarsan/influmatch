import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InfluencerLayout from '../../components/layouts/InfluencerLayout';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import { api } from '../../lib/api';

const CSS = `
.pl-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:24px;gap:18px;flex-wrap:wrap}
.pl-head h1{font-family:var(--serif);font-size:36px;margin:0;font-weight:400;letter-spacing:-.01em}
.pl-head h1 em{font-style:italic;color:var(--fg-dim)}
.pl-head p{color:var(--fg-dim);font-size:14px;margin:6px 0 0;max-width:520px}
.pl-count{font-family:var(--mono);font-size:11px;color:var(--fg-mute);letter-spacing:.14em;text-transform:uppercase}

.pl-list{display:flex;flex-direction:column;gap:10px}
.pl-row{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:18px;cursor:pointer;transition:.15s;display:flex;gap:16px;align-items:center;position:relative}
.pl-row:hover{border-color:var(--accent-border);transform:translateY(-1px)}
.pl-row.unread{border-color:var(--accent);background:linear-gradient(90deg,var(--accent-soft),var(--bg-2) 70%)}
.pl-row .av{width:48px;height:48px;border-radius:50%;background:var(--surface-tint);border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:20px;color:var(--fg-mute);overflow:hidden;flex:none}
.pl-row .av.sq{border-radius:12px}
.pl-row .av img{width:100%;height:100%;object-fit:cover}
.pl-row .body{flex:1;min-width:0}
.pl-row .top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:4px}
.pl-row .top h4{font-family:var(--serif);font-size:18px;margin:0;font-weight:500;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl-row .when{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute);flex:none}
.pl-row .preview{font-size:13.5px;color:var(--fg-dim);line-height:1.45;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.pl-row .preview b{color:var(--fg);font-weight:500}
.pl-row .badge{position:absolute;top:14px;right:14px;background:var(--accent);color:var(--accent-ink);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;border-radius:999px;padding:3px 9px;min-width:22px;text-align:center}
.pl-row .meta{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-top:6px}

.pl-empty{padding:80px 20px;text-align:center;color:var(--fg-mute);font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;border:1px dashed var(--line);border-radius:14px}
`;

if (typeof document !== 'undefined' && !document.getElementById('pl-styles')) {
  const tag = document.createElement('style');
  tag.id = 'pl-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

function relativeTime(iso) {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (isNaN(t)) return '';
  const diff = Date.now() - t;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(t).toLocaleDateString();
}

export default function PitchesList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCreator = user?.role === 'influencer';
  const Layout = isCreator ? InfluencerLayout : OwnerLayout;
  const detailBase = isCreator ? '/influencer/pitches' : '/owner/inbox';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listPitchThreads();
        if (!cancelled) setThreads(list || []);
      } catch {
        if (!cancelled) setThreads([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalUnread = threads.reduce((s, t) => s + (t.unreadCount || 0), 0);

  return (
    <Layout title={isCreator ? 'My Pitches' : 'Inbox'}>
      <div className="pl-head">
        <div>
          <h1>{isCreator ? <>My <em>pitches.</em></> : <>Pitch <em>inbox.</em></>}</h1>
          <p>
            {isCreator
              ? 'Direct conversations with brands you\'ve reached out to. These are separate from per-campaign messages.'
              : 'Creators reaching out to your brand directly — outside of any specific campaign. Reply, ignore, or invite them to apply to one of your briefs.'}
          </p>
        </div>
        <span className="pl-count">
          {loading ? 'Loading…' : (
            totalUnread > 0
              ? <><b style={{color:'var(--accent)'}}>{totalUnread}</b> unread · {threads.length} total</>
              : `${threads.length} thread${threads.length === 1 ? '' : 's'}`
          )}
        </span>
      </div>

      {loading ? (
        <div className="pl-empty">Loading…</div>
      ) : threads.length === 0 ? (
        <div className="pl-empty">
          {isCreator
            ? 'No pitches yet — open a brand profile and hit "Send a pitch" to start a conversation.'
            : 'No inbound pitches yet. Once your brand profile is live, creators can pitch you here.'}
        </div>
      ) : (
        <div className="pl-list">
          {threads.map((t) => {
            const cp = t.counterparty || {};
            const name = isCreator ? (cp.business || 'Brand') : (cp.fullName || 'Creator');
            const initial = (name || '?').charAt(0).toUpperCase();
            const last = t.lastMessage;
            const fromMe = last && last.authorId === user.id;
            const meta = isCreator
              ? [cp.category, cp.city].filter(Boolean).join(' · ')
              : [cp.niche, cp.city, cp.followers && `${cp.followers} followers`].filter(Boolean).join(' · ');
            return (
              <div
                key={t.id}
                className={'pl-row' + ((t.unreadCount || 0) > 0 ? ' unread' : '')}
                onClick={() => navigate(`${detailBase}/${t.id}`)}
              >
                <div className={'av' + (isCreator ? ' sq' : '')}>
                  {cp.avatarUrl ? <img src={cp.avatarUrl} alt="" /> : initial}
                </div>
                <div className="body">
                  <div className="top">
                    <h4>{name}</h4>
                    <span className="when">{relativeTime(t.lastMessageAt)}</span>
                  </div>
                  {last && (
                    <div className="preview">
                      {fromMe && <b>You: </b>}
                      {last.body}
                    </div>
                  )}
                  {meta && <div className="meta">{meta}</div>}
                </div>
                {t.unreadCount > 0 && <span className="badge">{t.unreadCount}</span>}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
