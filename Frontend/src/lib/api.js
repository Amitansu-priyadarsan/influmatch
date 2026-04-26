/**
 * Token-aware fetch wrapper.
 *
 * Token strategy:
 *  - Anonymous: backend issues a session token via POST /session.
 *    We store it in localStorage as `influmatch.session_token` and send
 *    it as `X-Session-Token` on every request.
 *  - Signed in: backend issues an auth token from /auth/signup or
 *    /auth/signin. We delete the session token and start sending
 *    `Authorization: Bearer <auth_token>` on every request.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const KEYS = {
    session: 'influmatch.session_token',
    auth: 'influmatch.auth_token',
};

export const tokens = {
    getSession: () => localStorage.getItem(KEYS.session),
    setSession: (t) => localStorage.setItem(KEYS.session, t),
    clearSession: () => localStorage.removeItem(KEYS.session),
    getAuth: () => localStorage.getItem(KEYS.auth),
    setAuth: (t) => localStorage.setItem(KEYS.auth, t),
    clearAuth: () => localStorage.removeItem(KEYS.auth),
    clearAll: () => {
        localStorage.removeItem(KEYS.session);
        localStorage.removeItem(KEYS.auth);
    },
};

class ApiError extends Error {
    constructor(message, status, payload) {
        super(message);
        this.status = status;
        this.payload = payload;
    }
}

async function request(path, { method = 'GET', body, signal } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const auth = tokens.getAuth();
    const session = tokens.getSession();
    if (auth) headers.Authorization = `Bearer ${auth}`;
    else if (session) headers['X-Session-Token'] = session;

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
    });

    let payload = null;
    const text = await res.text();
    if (text) {
        try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
    }

    if (!res.ok) {
        const detail = payload?.detail || payload?.message || res.statusText;
        const message = Array.isArray(detail)
            ? detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
            : detail;
        throw new ApiError(message, res.status, payload);
    }
    return payload;
}

/**
 * Issue a fresh session token. Called on app boot if no auth token exists.
 */
export async function ensureSession() {
    if (tokens.getAuth()) return null;
    if (tokens.getSession()) return tokens.getSession();
    const data = await request('/session', { method: 'POST' });
    tokens.setSession(data.session_token);
    return data.session_token;
}

export const api = {
    request,

    signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
    signin: (payload) => request('/auth/signin', { method: 'POST', body: payload }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),

    onboardInfluencer: (payload) =>
        request('/onboarding/influencer', { method: 'POST', body: payload }),
    onboardOwner: (payload) =>
        request('/onboarding/owner', { method: 'POST', body: payload }),

    // Campaigns
    listCampaigns: () => request('/campaigns'),
    createCampaign: (payload) => request('/campaigns', { method: 'POST', body: payload }),
    applyToCampaign: (campaignId, payload) =>
        request(`/campaigns/${campaignId}/apply`, { method: 'POST', body: payload }),
    acceptApplication: (campaignId, influencerId) =>
        request(`/campaigns/${campaignId}/accept/${influencerId}`, { method: 'POST' }),
    rejectApplication: (campaignId, influencerId) =>
        request(`/campaigns/${campaignId}/reject/${influencerId}`, { method: 'POST' }),
    assignInfluencer: (campaignId, influencerId) =>
        request(`/campaigns/${campaignId}/assign/${influencerId}`, { method: 'POST' }),
    unassignInfluencer: (campaignId) =>
        request(`/campaigns/${campaignId}/unassign`, { method: 'POST' }),
    submitPost: (campaignId, postLink) =>
        request(`/campaigns/${campaignId}/submit-post`, { method: 'POST', body: { postLink } }),
    listInfluencers: () => request('/influencers'),

    // Public profiles (visible to any signed-in user)
    getInfluencer: (id) => request(`/influencers/${id}`),
    listBrands: () => request('/brands'),
    getBrand: (id) => request(`/brands/${id}`),

    // Pitches (creator → brand DMs, distinct from campaign comments)
    startPitch: ({ brandId, body }) =>
        request('/pitches/threads', { method: 'POST', body: { brandId, body } }),
    listPitchThreads: () => request('/pitches/threads'),
    getPitchThread: (id) => request(`/pitches/threads/${id}`),
    sendPitchMessage: (id, body) =>
        request(`/pitches/threads/${id}/messages`, { method: 'POST', body: { body } }),
    markPitchRead: (id) =>
        request(`/pitches/threads/${id}/read`, { method: 'POST' }),

    // Comments (negotiation thread)
    listComments: (campaignId, influencerId) =>
        request(`/applications/${campaignId}/${influencerId}/comments`),
    postComment: (campaignId, influencerId, body) =>
        request(`/applications/${campaignId}/${influencerId}/comments`, {
            method: 'POST', body: { body },
        }),

    // Ratings
    submitRating: (payload) => request('/ratings', { method: 'POST', body: payload }),
    listMyRatingsForCampaign: (campaignId) =>
        request(`/ratings/given-by-me/${campaignId}`),
};

export { ApiError };
