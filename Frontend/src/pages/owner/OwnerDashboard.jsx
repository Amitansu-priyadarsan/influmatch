import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import { Megaphone, CheckCircle, TrendingUp, Tag, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function OwnerDashboard() {
    const { user, campaigns, influencers } = useAuth();
    const navigate = useNavigate();

    const myCampaigns = campaigns.filter(c => c.ownerId === user.id);
    const activeCampaigns = myCampaigns.filter(c => c.status === 'active');
    const submittedCampaigns = myCampaigns.filter(c => c.submittedPost);
    const pendingApps = myCampaigns.reduce(
        (sum, c) => sum + (c.applications || []).filter(a => a.status === 'pending').length, 0
    );

    const stats = [
        { label: 'Total Campaigns', value: myCampaigns.length, icon: Megaphone, color: 'from-blue-500 to-cyan-500' },
        { label: 'Active', value: activeCampaigns.length, icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
        { label: 'Pending Applications', value: pendingApps, icon: Clock, color: 'from-amber-500 to-orange-500' },
        { label: 'Posts Received', value: submittedCampaigns.length, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
    ];

    return (
        <OwnerLayout>
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">Welcome, {user.business} 👋</h1>
                    <p className="theme-text-muted text-sm">Here's how your campaigns are performing</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((s) => (
                        <div key={s.label} className="theme-bg-elevated border theme-border-elevated rounded-2xl p-5">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                                <s.icon size={18} className="text-white" />
                            </div>
                            <p className="text-2xl md:text-3xl font-bold theme-text mb-1">{s.value}</p>
                            <p className="theme-text-muted text-sm">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="theme-text font-semibold text-lg">Recent Campaigns</h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/owner/campaigns')}>
                        View all <ArrowRight size={14} />
                    </Button>
                </div>
                <div className="flex flex-col gap-3">
                    {myCampaigns.slice(-3).reverse().map((c) => {
                        const inf = influencers.find(i => i.id === c.assignedInfluencer);
                        const appCount = (c.applications || []).length;
                        const pendingCount = (c.applications || []).filter(a => a.status === 'pending').length;
                        return (
                            <div key={c.id} className="theme-bg-elevated border theme-border-elevated rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <Megaphone size={18} className="text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="theme-text font-medium">{c.title}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 theme-text-icon text-xs">
                                            <Tag size={10} />
                                            {c.promoCode}
                                        </span>
                                        {inf ? (
                                            <span className="theme-text-icon text-xs">Assigned: {inf.profile?.fullName}</span>
                                        ) : appCount > 0 ? (
                                            <span className="flex items-center gap-1 text-amber-300 text-xs">
                                                <Clock size={10} />
                                                {pendingCount} pending · {appCount} total
                                            </span>
                                        ) : (
                                            <span className="theme-text-faint text-xs">No applications yet</span>
                                        )}
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium self-start sm:self-auto ${
                                    c.status === 'submitted' ? 'theme-badge-success'
                                    : c.status === 'open' ? 'theme-badge-active'
                                    : 'theme-badge-info'
                                }`}>
                                    {c.status}
                                </span>
                            </div>
                        );
                    })}
                    {myCampaigns.length === 0 && (
                        <div className="text-center py-10">
                            <p className="theme-text-faint text-sm mb-4">No campaigns yet</p>
                            <Button onClick={() => navigate('/owner/campaigns')}>
                                <Megaphone size={15} />
                                Create your first campaign
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </OwnerLayout>
    );
}
