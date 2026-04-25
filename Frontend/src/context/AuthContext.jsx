import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokens } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [bootLoading, setBootLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [influencers, setInfluencers] = useState([]);

    // Boot: if we have an auth token, fetch /me. Otherwise stay anonymous —
    // the session token is created lazily on /login or /signup mount.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (tokens.getAuth()) {
                    try {
                        const me = await api.me();
                        if (!cancelled) setUser(me);
                    } catch {
                        tokens.clearAuth();
                    }
                }
            } finally {
                if (!cancelled) setBootLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const refreshCampaigns = useCallback(async () => {
        if (!tokens.getAuth()) { setCampaigns([]); return []; }
        try {
            const list = await api.listCampaigns();
            setCampaigns(list || []);
            return list || [];
        } catch {
            setCampaigns([]);
            return [];
        }
    }, []);

    const refreshInfluencers = useCallback(async () => {
        if (!user || user.role !== 'owner') return [];
        try {
            const list = await api.listInfluencers();
            setInfluencers(list || []);
            return list || [];
        } catch {
            return [];
        }
    }, [user]);

    // Whenever we have an authenticated, onboarded user → load campaigns.
    useEffect(() => {
        if (user && user.role !== 'admin') {
            refreshCampaigns();
            if (user.role === 'owner') refreshInfluencers();
        } else {
            setCampaigns([]);
            setInfluencers([]);
        }
    }, [user, refreshCampaigns, refreshInfluencers]);

    const handleAuthSuccess = (data) => {
        tokens.setAuth(data.auth_token);
        tokens.clearSession();
        setUser(data.user);
        return data.user;
    };

    const login = async (email, password) => {
        try {
            const data = await api.signin({ email: email.trim(), password });
            const u = handleAuthSuccess(data);
            return { success: true, role: u.role, onboarded: !!u.onboarded };
        } catch (err) {
            return { success: false, error: err.message || 'Sign in failed' };
        }
    };

    const signup = async ({ role, email, password, name }) => {
        const apiRole = role === 'brand' ? 'owner' : role;
        try {
            const data = await api.signup({
                role: apiRole,
                email: (email || '').trim(),
                password,
                name,
            });
            const u = handleAuthSuccess(data);
            return { success: true, role: u.role, onboarded: !!u.onboarded };
        } catch (err) {
            return { success: false, error: err.message || 'Sign up failed' };
        }
    };

    const logout = () => {
        // Clear LOCAL state first so that any page mounted after this
        // (e.g. LoginPage's ensureSession) sees a clean slate immediately.
        // The server-side token revoke is fire-and-forget.
        const stale = tokens.getAuth();
        tokens.clearAll();
        setUser(null);
        setCampaigns([]);
        setInfluencers([]);
        if (stale) {
            const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
            fetch(`${base}/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${stale}` },
            }).catch(() => {});
        }
    };

    const completeOnboarding = async (profile) => {
        const updated = await api.onboardInfluencer(profile);
        setUser(updated);
        return updated;
    };

    const completeOwnerOnboarding = async (data) => {
        const updated = await api.onboardOwner(data);
        setUser(updated);
        return updated;
    };

    // ----- Campaign mutators (all hit the backend then refresh local cache) -----

    const createCampaign = async (campaignData) => {
        const created = await api.createCampaign(campaignData);
        setCampaigns((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
        return created;
    };

    const applyToCampaign = async (campaignId, payload) => {
        // payload: { message?, proposedPrice?, proposedNote? } OR a string (legacy)
        const body = typeof payload === 'string' ? { message: payload } : (payload || {});
        await api.applyToCampaign(campaignId, body);
        await refreshCampaigns();
    };

    const postComment = async (campaignId, influencerId, body) => {
        await api.postComment(campaignId, influencerId, body);
        await refreshCampaigns();
    };

    const submitRating = async ({ campaignId, score, comment }) => {
        await api.submitRating({ campaignId, score, comment });
        await refreshCampaigns();
        // Refresh /me so the user's own cached rating updates if they were the ratee.
        try {
            const me = await api.me();
            setUser(me);
        } catch { /* ignore */ }
    };

    const acceptApplication = async (campaignId, influencerId) => {
        const updated = await api.acceptApplication(campaignId, influencerId);
        setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    };

    const rejectApplication = async (campaignId, influencerId) => {
        const updated = await api.rejectApplication(campaignId, influencerId);
        setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    };

    const assignInfluencer = async (campaignId, influencerId) => {
        const updated = await api.assignInfluencer(campaignId, influencerId);
        setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    };

    const unassignInfluencer = async (campaignId) => {
        const updated = await api.unassignInfluencer(campaignId);
        setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    };

    const submitPost = async (campaignId, postLink) => {
        const updated = await api.submitPost(campaignId, postLink);
        setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                bootLoading,
                influencers,
                owners: [], // not yet wired to backend
                campaigns,
                refreshCampaigns,
                refreshInfluencers,
                login,
                logout,
                signup,
                completeOnboarding,
                completeOwnerOnboarding,
                createCampaign,
                applyToCampaign,
                acceptApplication,
                rejectApplication,
                assignInfluencer,
                unassignInfluencer,
                submitPost,
                postComment,
                submitRating,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
