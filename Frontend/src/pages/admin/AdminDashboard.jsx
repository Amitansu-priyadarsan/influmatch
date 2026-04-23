import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layouts/AdminLayout';
import Card from '../../components/ui/Card';
import { Users, Building2, Megaphone, TrendingUp, Activity, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
    const { influencers, owners, campaigns } = useAuth();

    const stats = [
        {
            label: 'Total Influencers',
            value: influencers.length,
            icon: Users,
            color: 'from-violet-500 to-purple-600',
            subtext: `${influencers.filter(i => i.onboarded).length} onboarded`,
        },
        {
            label: 'Brand Owners',
            value: owners.length,
            icon: Building2,
            color: 'from-blue-500 to-cyan-600',
            subtext: 'Active accounts',
        },
        {
            label: 'Total Campaigns',
            value: campaigns.length,
            icon: Megaphone,
            color: 'from-pink-500 to-rose-600',
            subtext: `${campaigns.filter(c => c.status === 'active').length} active`,
        },
        {
            label: 'Posts Submitted',
            value: campaigns.filter(c => c.submittedPost).length,
            icon: CheckCircle,
            color: 'from-emerald-500 to-green-600',
            subtext: 'Completed deliverables',
        },
    ];

    const recentCampaigns = campaigns.slice(-4).reverse();
    const recentInfluencers = influencers.slice(-3).reverse();

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">Admin Dashboard</h1>
                    <p className="theme-text-muted text-sm">Overview of your influencer marketing platform</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="theme-bg-elevated border theme-border rounded-2xl p-5 hover:theme-bg-elevated-hover transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <stat.icon size={18} className="text-white" />
                                </div>
                                <TrendingUp size={14} className="theme-text-faint" />
                            </div>
                            <p className="text-2xl md:text-3xl font-bold theme-text mb-1">{stat.value}</p>
                            <p className="theme-text-secondary text-sm font-medium">{stat.label}</p>
                            <p className="theme-text-faint text-xs mt-1">{stat.subtext}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Campaigns */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="theme-text font-semibold text-lg">Recent Campaigns</h2>
                            <Activity size={16} className="theme-text-faint" />
                        </div>
                        <div className="flex flex-col gap-3">
                            {recentCampaigns.map((c) => {
                                const inf = influencers.find(i => i.id === c.assignedInfluencer);
                                return (
                                    <div key={c.id} className="theme-bg-elevated border theme-border-elevated rounded-xl p-4 hover:theme-bg-elevated-hover transition-all">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="theme-text font-medium text-sm">{c.title}</p>
                                                <p className="theme-text-icon text-xs mt-0.5">{c.brand}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.status === 'submitted'
                                                    ? 'theme-badge-success'
                                                    : 'theme-badge-active'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3">
                                            <p className="theme-text-faint text-xs">🏷 {c.promoCode}</p>
                                            {inf && <p className="theme-text-faint text-xs">👤 {inf.profile?.fullName || inf.email}</p>}
                                            <p className="theme-text-faint text-xs">📅 {c.startDate} → {c.endDate}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {recentCampaigns.length === 0 && (
                                <div className="theme-bg-elevated border theme-border-subtle rounded-xl p-8 text-center">
                                    <p className="theme-text-faint text-sm">No campaigns yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Influencers */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="theme-text font-semibold text-lg">Influencers</h2>
                            <Users size={16} className="theme-text-faint" />
                        </div>
                        <div className="flex flex-col gap-3">
                            {recentInfluencers.map((inf) => (
                                <div key={inf.id} className="theme-bg-elevated border theme-border-elevated rounded-xl p-4 hover:theme-bg-elevated-hover transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                            {inf.profile?.fullName?.charAt(0) || inf.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="theme-text text-sm font-medium truncate">
                                                {inf.profile?.fullName || inf.email}
                                            </p>
                                            <p className="theme-text-icon text-xs truncate">
                                                {inf.profile?.instagram || 'Not onboarded'}
                                            </p>
                                        </div>
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${inf.onboarded ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                    </div>
                                    {inf.profile?.niche && (
                                        <p className="theme-text-faint text-xs mt-2 pl-12">{inf.profile.niche} • {inf.profile.followers}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
