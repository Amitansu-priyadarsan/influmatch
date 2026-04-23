import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layouts/AdminLayout';
import Badge from '../../components/ui/Badge';
import { Megaphone, Calendar, Tag, User, Link, Building2 } from 'lucide-react';

export default function AdminCampaigns() {
    const { campaigns, influencers, owners } = useAuth();

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">All Campaigns</h1>
                    <p className="theme-text-muted text-sm">{campaigns.length} campaigns across all brands</p>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="theme-text-icon text-xs uppercase tracking-wider text-left">
                                <th className="px-6 py-2 font-medium">Campaign</th>
                                <th className="px-6 py-2 font-medium">Business / Owner</th>
                                <th className="px-6 py-2 font-medium">Details</th>
                                <th className="px-6 py-2 font-medium">Status</th>
                                <th className="px-6 py-2 font-medium">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((c) => {
                                const inf = influencers.find(i => i.id === c.assignedInfluencer);
                                const owner = owners.find(o => o.id === c.ownerId);
                                return (
                                    <tr key={c.id} className="theme-bg-elevated border theme-border-elevated rounded-2xl hover:theme-bg-elevated-hover transition-all group">
                                        <td className="px-6 py-4 rounded-l-2xl">
                                            <div className="flex flex-col">
                                                <span className="theme-text font-semibold">{c.title}</span>
                                                <span className="theme-text-icon text-sm">{c.brand}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="theme-text-secondary text-sm font-medium">{owner?.business || 'N/A'}</span>
                                                <span className="theme-text-icon text-xs">{owner?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 theme-text-muted text-xs">
                                                    <Tag size={12} className="text-violet-400" />
                                                    <span>{c.promoCode}</span>
                                                </div>
                                                <div className="flex items-center gap-2 theme-text-muted text-xs">
                                                    <Calendar size={12} className="text-blue-400" />
                                                    <span>{c.startDate} → {c.endDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2 theme-text-muted text-xs">
                                                    <User size={12} className="text-pink-400" />
                                                    <span>{inf ? (inf.profile?.fullName || inf.email) : 'Unassigned'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={c.status === 'submitted' ? 'submitted' : c.status === 'active' ? 'active' : c.status === 'open' ? 'info' : 'default'}>
                                                {c.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 rounded-r-2xl">
                                            {c.submittedPost ? (
                                                <a href={c.submittedPost} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 text-sm">
                                                    <Link size={14} />
                                                    View
                                                </a>
                                            ) : (
                                                <span className="theme-text-faint text-xs italic">Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col gap-3">
                    {campaigns.map((c) => {
                        const inf = influencers.find(i => i.id === c.assignedInfluencer);
                        const owner = owners.find(o => o.id === c.ownerId);
                        return (
                            <div key={c.id} className="theme-bg-elevated border theme-border-elevated rounded-2xl p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="min-w-0 flex-1">
                                        <span className="theme-text font-semibold text-sm block truncate">{c.title}</span>
                                        <span className="theme-text-icon text-xs">{c.brand}</span>
                                    </div>
                                    <Badge variant={c.status === 'submitted' ? 'submitted' : c.status === 'active' ? 'active' : c.status === 'open' ? 'info' : 'default'}>
                                        {c.status}
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-2 text-xs">
                                    <div className="flex items-center gap-2 theme-text-muted">
                                        <Tag size={12} className="text-violet-400 flex-shrink-0" />
                                        <span>{c.promoCode}</span>
                                    </div>
                                    <div className="flex items-center gap-2 theme-text-muted">
                                        <Calendar size={12} className="text-blue-400 flex-shrink-0" />
                                        <span>{c.startDate} → {c.endDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 theme-text-muted">
                                        <User size={12} className="text-pink-400 flex-shrink-0" />
                                        <span>{inf ? (inf.profile?.fullName || inf.email) : 'Unassigned'}</span>
                                    </div>
                                    {owner && (
                                        <div className="flex items-center gap-2 theme-text-secondary">
                                            <Building2 size={12} className="text-blue-400 flex-shrink-0" />
                                            <span>{owner.business}</span>
                                        </div>
                                    )}
                                </div>
                                {c.submittedPost && (
                                    <div className="mt-3 pt-3 border-t theme-border-elevated">
                                        <a href={c.submittedPost} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 text-xs font-medium">
                                            <Link size={12} />
                                            View Submitted Post
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {campaigns.length === 0 && (
                    <div className="text-center py-16">
                        <Megaphone size={40} className="theme-text-faint mx-auto mb-3" />
                        <p className="theme-text-icon">No campaigns yet</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
