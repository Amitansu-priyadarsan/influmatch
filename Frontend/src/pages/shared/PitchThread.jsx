import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InfluencerLayout from '../../components/layouts/InfluencerLayout';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import { api } from '../../lib/api';

const CSS = `
.pt-shell{max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
.pt-back{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);cursor:pointer;display:inline-flex;gap:8px;align-items:center;width:fit-content}
.pt-back:hover{color:var(--accent)}

.pt-head{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:18px;display:flex;gap:14px;align-items:center}
.pt-head .av{width:54px;height:54px;border-radius:50%;background:var(--surface-tint);border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--serif);font-size:22px;color:var(--fg-mute);overflow:hidden;flex:none}
.pt-head .av.sq{border-radius:12px}
.pt-head .av img{width:100%;height:100%;object-fit:cover}
.pt-head h2{font-family:var(--serif);font-size:22px;font-weight:500;margin:0;line-height:1.2}
.pt-head .meta{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-top:4px}
.pt-head .view{margin-left:auto;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);background:var(--accent-soft);border:1px solid var(--accent-border);padding:7px 14px;border-radius:999px;cursor:pointer;transition:.15s}
.pt-head .view:hover{filter:brightness(1.08)}

.pt-stream{display:flex;flex-direction:column;gap:14px;padding:28px;border:1px solid var(--line);border-radius:14px;background:var(--bg-2);min-height:420px}
.pt-row{max-width:80%;text-align:left}
.pt-row.mine{margin-left:auto;text-align:right}
.pt-bubble{display:inline-block;min-width:60px;max-width:100%;padding:14px 18px;border-radius:16px;font-size:15px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--line);box-sizing:border-box;text-align:left}
.pt-bubble.mine{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.pt-bubble.theirs{background:var(--surface-faint)}
.pt-stamp{display:block;margin-top:4px}
.pt-stamp{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;color:var(--fg-mute);text-transform:uppercase}

.pt-composer{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);padding:14px;display:flex;gap:10px;align-items:flex-end}
.pt-composer textarea{flex:1;min-height:60px;max-height:200px;border-radius:10px;border:1px solid var(--line-2);background:var(--surface-1);color:var(--fg);padding:12px 14px;font-family:var(--sans);font-size:14px;outline:none;resize:vertical;line-height:1.5;transition:.15s}
.pt-composer textarea:focus{border-color:var(--accent);background:var(--accent-soft)}
.pt-send{background:var(--accent);color:var(--accent-ink);font-weight:500;font-size:13.5px;padding:11px 20px;border-radius:999px;border:0;cursor:pointer;display:inline-flex;gap:8px;align-items:center;transition:.15s;flex:none}
.pt-send:hover{filter:brightness(1.08)}
.pt-send:disabled{opacity:.45;cursor:not-allowed;filter:none}

.pt-empty{color:var(--fg-mute);text-align:center;padding:40px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}
.pt-err{color:var(--danger);font-family:var(--mono);font-size:11px;letter-spacing:.08em;margin-top:6px}
`;

if (typeof document !== 'undefined' && !document.getElementById('pt-styles')) {
  const tag = document.createElement('style');
  tag.id = 'pt-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

function whenLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return sameDay ? time : `${d.toLocaleDateString()} · ${time}`;
}

export default function PitchThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const streamRef = useRef(null);

  const isCreator = user?.role === 'influencer';
  const Layout = isCreator ? InfluencerLayout : OwnerLayout;
  const listPath = isCreator ? '/influencer/pitches' : '/owner/inbox';
  const profileLink = thread && (
    isCreator
      ? `/influencer/brands/${thread.brandId}`
      : `/owner/influencers/${thread.influencerId}`
  );

  const reload = async () => {
    try {
      const data = await api.getPitchThread(id);
      setThread(data);
      // mark read in the background
      api.markPitchRead(id).catch(() => {});
    } catch (e) {
      setErr(e.message || 'Could not load thread');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getPitchThread(id);
        if (!cancelled) setThread(data);
        api.markPitchRead(id).catch(() => {});
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Could not load thread');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [thread?.messages?.length]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      const msg = await api.sendPitchMessage(id, body);
      setThread((t) => t ? { ...t, messages: [...(t.messages || []), msg], lastMessageAt: msg.createdAt } : t);
      setDraft('');
    } catch (e) {
      setErr(e.message || 'Could not send.');
    } finally {
      setSending(false);
    }
  };

  const cp = thread?.counterparty || {};
  const name = isCreator ? (cp.business || 'Brand') : (cp.fullName || 'Creator');
  const initial = (name || '?').charAt(0).toUpperCase();
  const meta = isCreator
    ? [cp.category, cp.city].filter(Boolean).join(' · ')
    : [cp.niche, cp.city, cp.followers && `${cp.followers} followers`].filter(Boolean).join(' · ');

  return (
    <Layout title={name}>
      <div className="pt-shell">
        <span className="pt-back" onClick={() => navigate(listPath)}>← Back to {isCreator ? 'pitches' : 'inbox'}</span>

        {loading ? (
          <div className="pt-empty">Loading…</div>
        ) : err ? (
          <div className="pt-empty">{err}</div>
        ) : thread ? (
          <>
            <div className="pt-head">
              <div className={'av' + (isCreator ? ' sq' : '')}>
                {cp.avatarUrl ? <img src={cp.avatarUrl} alt="" /> : initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <h2>{name}</h2>
                {meta && <div className="meta">{meta}</div>}
              </div>
              {profileLink && (
                <button className="view" onClick={() => navigate(profileLink)}>
                  View profile →
                </button>
              )}
            </div>

            <div className="pt-stream" ref={streamRef}>
              {(thread.messages || []).length === 0 ? (
                <div className="pt-empty">No messages yet.</div>
              ) : (
                thread.messages.map((m) => {
                  const mine = m.authorId === user.id;
                  return (
                    <div key={m.id} className={'pt-row' + (mine ? ' mine' : '')}>
                      <div className={'pt-bubble ' + (mine ? 'mine' : 'theirs')}>{m.body}</div>
                      <span className="pt-stamp">{whenLabel(m.createdAt)}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-composer">
              <textarea
                placeholder="Write a reply…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={sending}
              />
              <button className="pt-send" onClick={send} disabled={sending || !draft.trim()}>
                {sending ? 'Sending…' : 'Send →'}
              </button>
            </div>
            {err && <div className="pt-err">{err}</div>}
          </>
        ) : null}
      </div>
    </Layout>
  );
}
