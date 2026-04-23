import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEYS = {
    user: 'influmatch.user',
    token: 'influmatch.token',
    influencers: 'influmatch.influencers',
    owners: 'influmatch.owners',
    campaigns: 'influmatch.campaigns',
    version: 'influmatch.version',
};

const DATA_VERSION = '3';

if (typeof window !== 'undefined') {
    try {
        if (localStorage.getItem(STORAGE_KEYS.version) !== DATA_VERSION) {
            localStorage.removeItem(STORAGE_KEYS.influencers);
            localStorage.removeItem(STORAGE_KEYS.owners);
            localStorage.removeItem(STORAGE_KEYS.campaigns);
            localStorage.removeItem(STORAGE_KEYS.user);
            localStorage.removeItem(STORAGE_KEYS.token);
            localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION);
        }
    } catch {}
}

const loadJSON = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const saveJSON = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore quota errors
    }
};

const genToken = (id) => `tok_${id}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const AuthContext = createContext(null);

// Hardcoded super admin credentials
const ADMIN_EMAIL = 'admin@influmatch.com';
const ADMIN_PASSWORD = 'Admin@1234';

// Mock data for demo
const MOCK_INFLUENCERS = [
    {
        id: 'inf_001',
        email: 'priya@example.com',
        password: 'password123',
        role: 'influencer',
        onboarded: true,
        profile: {
            fullName: 'Priya Sharma',
            instagram: '@priya.creates',
            followers: '45K',
            niche: 'Lifestyle & Food',
            city: 'Mumbai',
            bio: 'Passionate about food and travel.',
            phone: '+91 9876543210',
        },
    },
    {
        id: 'inf_002',
        email: 'rahul@example.com',
        password: 'password123',
        role: 'influencer',
        onboarded: false,
        profile: null,
    },
];

const MOCK_OWNERS = [
    {
        id: 'own_001',
        email: 'cafe@brewhouse.com',
        password: 'password123',
        role: 'owner',
        onboarded: true,
        business: 'Brewhouse Cafe',
        city: 'Bangalore',
        category: 'Food & Beverage',
        website: '',
    },
    {
        id: 'own_002',
        email: 'rahul.brand@example.com',
        password: 'password123',
        role: 'owner',
        onboarded: false,
        business: '',
        city: '',
        category: '',
        website: '',
    },
];

const DEFAULT_CAMPAIGNS = [
        {
            id: 'camp_001',
            title: 'Summer Brew Special',
            brand: 'Brewhouse Cafe',
            ownerId: 'own_001',
            offer: '1 Free Coffee + 20% discount for followers',
            promoCode: 'BREW20',
            startDate: '2026-03-01',
            endDate: '2026-03-31',
            status: 'active',
            assignedInfluencer: 'inf_001',
            submittedPost: null,
            applications: [
                { influencerId: 'inf_001', status: 'accepted', appliedAt: '2026-02-25', message: 'I love coffee content! Would love to promote this.' },
            ],
        },
        {
            id: 'camp_002',
            title: 'Fitness Gear Launch',
            brand: 'Brewhouse Cafe',
            ownerId: 'own_001',
            offer: 'Free product + Rs 5000 per post',
            promoCode: 'FIT2026',
            startDate: '2026-04-15',
            endDate: '2026-05-15',
            status: 'open',
            assignedInfluencer: null,
            submittedPost: null,
            applications: [],
        },
        {
            id: 'camp_003',
            title: 'Monsoon Fashion Week',
            brand: 'Brewhouse Cafe',
            ownerId: 'own_001',
            offer: 'Rs 10,000 + free wardrobe for the season',
            promoCode: 'MONSOON10',
            startDate: '2026-06-01',
            endDate: '2026-07-31',
            status: 'open',
            assignedInfluencer: null,
            submittedPost: null,
            applications: [
                { influencerId: 'inf_001', status: 'pending', appliedAt: '2026-04-10', message: 'Fashion is my forte — I can create reels and stories for this!' },
            ],
        },
    ];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => loadJSON(STORAGE_KEYS.user, null));
    const [influencers, setInfluencers] = useState(() => loadJSON(STORAGE_KEYS.influencers, MOCK_INFLUENCERS));
    const [owners, setOwners] = useState(() => loadJSON(STORAGE_KEYS.owners, MOCK_OWNERS));
    const [campaigns, setCampaigns] = useState(() => loadJSON(STORAGE_KEYS.campaigns, DEFAULT_CAMPAIGNS));

    useEffect(() => {
        if (user) saveJSON(STORAGE_KEYS.user, user);
        else localStorage.removeItem(STORAGE_KEYS.user);
    }, [user]);
    useEffect(() => { saveJSON(STORAGE_KEYS.influencers, influencers); }, [influencers]);
    useEffect(() => { saveJSON(STORAGE_KEYS.owners, owners); }, [owners]);
    useEffect(() => { saveJSON(STORAGE_KEYS.campaigns, campaigns); }, [campaigns]);

    const persistSession = (u) => {
        const token = genToken(u.id);
        localStorage.setItem(STORAGE_KEYS.token, token);
        setUser(u);
        return token;
    };

    const login = (email, password) => {
        const normalizedEmail = (email || '').trim().toLowerCase();

        // Admin login
        if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
            const adminUser = { id: 'admin', email: ADMIN_EMAIL, role: 'admin', name: 'Super Admin' };
            persistSession(adminUser);
            return { success: true, role: 'admin' };
        }

        // Influencer login
        const influencer = influencers.find(
            (i) => i.email.toLowerCase() === normalizedEmail && i.password === password
        );
        if (influencer) {
            persistSession(influencer);
            return { success: true, role: 'influencer', onboarded: !!influencer.onboarded };
        }

        // Owner login
        const owner = owners.find(
            (o) => o.email.toLowerCase() === normalizedEmail && o.password === password
        );
        if (owner) {
            persistSession(owner);
            return { success: true, role: 'owner', onboarded: owner.onboarded !== false };
        }

        return { success: false, error: 'Invalid email or password' };
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.token);
        setUser(null);
    };

    const signup = ({ role, email, password, ...rest }) => {
        const trimmedEmail = (email || '').trim().toLowerCase();
        if (!trimmedEmail || !password) {
            return { success: false, error: 'Email and password are required' };
        }
        if (trimmedEmail === ADMIN_EMAIL.toLowerCase()) {
            return { success: false, error: 'This email is reserved' };
        }
        const emailTaken =
            influencers.some((i) => i.email.toLowerCase() === trimmedEmail) ||
            owners.some((o) => o.email.toLowerCase() === trimmedEmail);
        if (emailTaken) {
            return { success: false, error: 'An account with this email already exists' };
        }

        if (role === 'influencer') {
            const newInfluencer = {
                id: `inf_${Date.now()}`,
                email: trimmedEmail,
                password,
                role: 'influencer',
                onboarded: false,
                profile: null,
            };
            setInfluencers((prev) => [...prev, newInfluencer]);
            persistSession(newInfluencer);
            return { success: true, role: 'influencer', onboarded: false };
        }

        if (role === 'owner') {
            const newOwner = {
                id: `own_${Date.now()}`,
                email: trimmedEmail,
                password,
                role: 'owner',
                onboarded: false,
                business: '',
                city: '',
                category: '',
                website: '',
            };
            setOwners((prev) => [...prev, newOwner]);
            persistSession(newOwner);
            return { success: true, role: 'owner', onboarded: false };
        }

        return { success: false, error: 'Please select a valid role' };
    };

    const completeOnboarding = (profile) => {
        const updated = influencers.map((inf) =>
            inf.id === user.id ? { ...inf, onboarded: true, profile } : inf
        );
        setInfluencers(updated);
        setUser((prev) => ({ ...prev, onboarded: true, profile }));
    };

    const completeOwnerOnboarding = (data) => {
        const updated = owners.map((o) =>
            o.id === user.id ? { ...o, onboarded: true, ...data } : o
        );
        setOwners(updated);
        setUser((prev) => ({ ...prev, onboarded: true, ...data }));
    };

    const createOwner = (ownerData) => {
        const newOwner = {
            id: `own_${Date.now()}`,
            role: 'owner',
            ...ownerData,
        };
        setOwners((prev) => [...prev, newOwner]);
        return newOwner;
    };

    const createCampaign = (campaignData) => {
        const newCampaign = {
            id: `camp_${Date.now()}`,
            ownerId: user.id,
            brand: user.business,
            status: 'open',
            submittedPost: null,
            assignedInfluencer: null,
            applications: [],
            ...campaignData,
        };
        setCampaigns((prev) => [...prev, newCampaign]);
        return newCampaign;
    };

    const applyToCampaign = (campaignId, message) => {
        setCampaigns((prev) =>
            prev.map((c) =>
                c.id === campaignId
                    ? {
                        ...c,
                        applications: [
                            ...(c.applications || []),
                            {
                                influencerId: user.id,
                                status: 'pending',
                                appliedAt: new Date().toISOString().split('T')[0],
                                message: message || '',
                            },
                        ],
                    }
                    : c
            )
        );
    };

    const acceptApplication = (campaignId, influencerId) => {
        setCampaigns((prev) =>
            prev.map((c) => {
                if (c.id !== campaignId) return c;
                return {
                    ...c,
                    status: 'active',
                    assignedInfluencer: influencerId,
                    applications: (c.applications || []).map((app) =>
                        app.influencerId === influencerId
                            ? { ...app, status: 'accepted' }
                            : { ...app, status: app.status === 'pending' ? 'rejected' : app.status }
                    ),
                };
            })
        );
    };

    const rejectApplication = (campaignId, influencerId) => {
        setCampaigns((prev) =>
            prev.map((c) => {
                if (c.id !== campaignId) return c;
                return {
                    ...c,
                    applications: (c.applications || []).map((app) =>
                        app.influencerId === influencerId
                            ? { ...app, status: 'rejected' }
                            : app
                    ),
                };
            })
        );
    };

    const assignInfluencer = (campaignId, influencerId) => {
        setCampaigns((prev) =>
            prev.map((c) =>
                c.id === campaignId ? { ...c, assignedInfluencer: influencerId, status: 'active' } : c
            )
        );
    };

    const submitPost = (campaignId, postLink) => {
        setCampaigns((prev) =>
            prev.map((c) =>
                c.id === campaignId ? { ...c, submittedPost: postLink, status: 'submitted' } : c
            )
        );
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                influencers,
                owners,
                campaigns,
                login,
                logout,
                signup,
                completeOnboarding,
                completeOwnerOnboarding,
                createOwner,
                createCampaign,
                applyToCampaign,
                acceptApplication,
                rejectApplication,
                assignInfluencer,
                submitPost,
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
