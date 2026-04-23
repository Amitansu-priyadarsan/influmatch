import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layouts/AdminLayout';
import Badge from '../../components/ui/Badge';
import { Users, Instagram, CheckCircle, Clock, Search } from 'lucide-react';
import { useState } from 'react';

export default function AdminInfluencers() {
    const { influencers, campaigns } = useAuth();
    const [search, setSearch] = useState('');

    const filtered = influencers.filter(
        (i) =>
            i.profile?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            i.email?.toLowerCase().includes(search.toLowerCase()) ||
            i.profile?.instagram?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">Influencers</h1>
                    <p className="theme-text-muted text-sm">
                        {influencers.length} registered · {influencers.filter(i => i.onboarded).length} onboarded
                    </p>
                </div>

                <div className="relative mb-6">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-icon" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email or handle..."
                        className="w-full theme-bg-elevated border theme-border theme-text placeholder:theme-text-faint rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="theme-text-icon text-xs uppercase tracking-wider text-left">
                                <th className="px-6 py-2 font-medium">Influencer</th>
                                <th className="px-6 py-2 font-medium">Platform</th>
                                <th className="px-6 py-2 font-medium">Audience</th>
                                <th className="px-6 py-2 font-medium">Location / Niche</th>
                                <th className="px-6 py-2 font-medium">Campaigns</th>
                                <th className="px-6 py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((inf) => {
                                const infCampaigns = campaigns.filter(c => c.assignedInfluencer === inf.id);
                                return (
                                    <tr key={inf.id} className="theme-bg-elevated border theme-border-elevated rounded-2xl hover:theme-bg-elevated-hover transition-all group">
                                        <td className="px-6 py-4 rounded-l-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {inf.profile?.fullName?.charAt(0) || inf.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="theme-text font-semibold flex items-center gap-1.5 truncate">
                                                        {inf.profile?.fullName || 'Not onboarded'}
                                                        {inf.onboarded && <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />}
                                                    </span>
                                                    <span className="theme-text-icon text-xs truncate">{inf.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {inf.profile?.instagram ? (
                                                <div className="flex items-center gap-1.5 theme-text-secondary text-sm">
                                                    <Instagram size={14} className="text-pink-400" />
                                                    <span>@{inf.profile.instagram}</span>
                                                </div>
                                            ) : (
                                                <span className="theme-text-faint text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 theme-text-secondary text-sm font-medium">
                                            {inf.profile?.followers || '0'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs">
                                                <span className="theme-text-secondary">{inf.profile?.city || 'N/A'}</span>
                                                <span className="text-violet-400/80">{inf.profile?.niche || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 theme-text-muted text-sm">
                                            {infCampaigns.length}
                                        </td>
                                        <td className="px-6 py-4 rounded-r-2xl">
                                            <Badge variant={inf.onboarded ? 'success' : 'warning'}>
                                                {inf.onboarded ? 'Onboarded' : 'Pending'}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col gap-3">
                    {filtered.map((inf) => {
                        const infCampaigns = campaigns.filter(c => c.assignedInfluencer === inf.id);
                        return (
                            <div key={inf.id} className="theme-bg-elevated border theme-border-elevated rounded-2xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {inf.profile?.fullName?.charAt(0) || inf.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="theme-text font-semibold text-sm flex items-center gap-1.5 truncate">
                                            {inf.profile?.fullName || 'Not onboarded'}
                                            {inf.onboarded && <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />}
                                        </span>
                                        <span className="theme-text-icon text-xs block truncate">{inf.email}</span>
                                    </div>
                                    <Badge variant={inf.onboarded ? 'success' : 'warning'}>
                                        {inf.onboarded ? 'Onboarded' : 'Pending'}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs pl-[52px]">
                                    {inf.profile?.instagram && (
                                        <div className="flex items-center gap-1.5 theme-text-secondary">
                                            <Instagram size={12} className="text-pink-400" />
                                            <span>@{inf.profile.instagram}</span>
                                        </div>
                                    )}
                                    <span className="theme-text-secondary font-medium">{inf.profile?.followers || '0'} followers</span>
                                    {inf.profile?.niche && (
                                        <span className="text-violet-400/80">{inf.profile.niche}</span>
                                    )}
                                    <span className="theme-text-muted">{infCampaigns.length} campaigns</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 theme-bg-elevated border theme-border-subtle rounded-2xl">
                        <Users size={40} className="theme-text-faint mx-auto mb-3" />
                        <p className="theme-text-icon">No influencers found</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
