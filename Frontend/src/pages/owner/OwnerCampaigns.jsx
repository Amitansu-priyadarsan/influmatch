import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Plus, Megaphone, Users, ChevronDown, Clock, Eye } from 'lucide-react';

export default function OwnerCampaigns() {
    const { user, campaigns, influencers, createCampaign, assignInfluencer } = useAuth();
    const navigate = useNavigate();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(null);
    const [form, setForm] = useState({ title: '', offer: '', promoCode: '', startDate: '', endDate: '' });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    const myCampaigns = campaigns.filter(c => c.ownerId === user.id);
    const onboardedInfluencers = influencers.filter(i => i.onboarded);

    const validate = () => {
        const e = {};
        if (!form.title) e.title = 'Title is required';
        if (!form.offer) e.offer = 'Offer description is required';
        if (!form.promoCode) e.promoCode = 'Promo code is required';
        if (!form.startDate) e.startDate = 'Required';
        if (!form.endDate) e.endDate = 'Required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!validate()) return;
        createCampaign(form);
        setSuccess('Campaign created!');
        setTimeout(() => {
            setIsCreateOpen(false);
            setForm({ title: '', offer: '', promoCode: '', startDate: '', endDate: '' });
            setSuccess('');
        }, 1200);
    };

    const handleAssign = (campaignId, influencerId) => {
        assignInfluencer(campaignId, influencerId);
        setAssignOpen(null);
    };

    return (
        <OwnerLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">My Campaigns</h1>
                        <p className="theme-text-muted text-sm">{myCampaigns.length} campaigns for {user.business}</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="self-start sm:self-auto">
                        <Plus size={16} />
                        New Campaign
                    </Button>
                </div>

                {myCampaigns.length === 0 ? (
                    <div className="text-center py-20 theme-bg-elevated border theme-border-subtle rounded-2xl">
                        <div className="w-16 h-16 rounded-2xl theme-bg-elevated flex items-center justify-center mx-auto mb-4">
                            <Megaphone size={28} className="theme-text-faint" />
                        </div>
                        <p className="theme-text-muted font-medium mb-2">No campaigns yet</p>
                        <p className="theme-text-faint text-sm mb-6">Create your first campaign and assign an influencer</p>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus size={16} />
                            Create Campaign
                        </Button>
                    </div>
                ) : (
                    <>
                    {/* Mobile card view */}
                    <div className="md:hidden flex flex-col gap-3">
                        {myCampaigns.map((c) => {
                            const inf = influencers.find(i => i.id === c.assignedInfluencer);
                            const apps = c.applications || [];
                            const pendingCount = apps.filter(a => a.status === 'pending').length;
                            return (
                                <div key={c.id} className="theme-bg-elevated border theme-border-elevated rounded-2xl p-4">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="min-w-0">
                                            <p className="theme-text font-semibold truncate">{c.title}</p>
                                            <p className="theme-text-icon text-sm">{c.brand}</p>
                                        </div>
                                        <Badge variant={c.status === 'submitted' ? 'submitted' : c.status === 'open' ? 'info' : 'active'}>
                                            {c.status}
                                        </Badge>
                                    </div>

                                    <p className="theme-text-secondary text-sm mb-2 line-clamp-2">{c.offer}</p>

                                    <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                                        <code className="theme-promo px-2 py-0.5 rounded-md font-mono">{c.promoCode}</code>
                                        <span className="theme-text-muted whitespace-nowrap">{c.startDate} → {c.endDate}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                                        <button
                                            onClick={() => navigate(`/owner/applicants/${c.id}`)}
                                            className="flex items-center gap-1.5 theme-text-muted"
                                        >
                                            <Users size={13} />
                                            <span className="theme-text font-medium">{apps.length}</span> applicants
                                            {pendingCount > 0 && (
                                                <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                                                    <Clock size={9} />
                                                    {pendingCount} new
                                                </span>
                                            )}
                                        </button>
                                        {inf ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[9px] font-bold">
                                                    {inf.profile?.fullName?.charAt(0) || 'I'}
                                                </div>
                                                <span className="theme-text-secondary text-sm">{inf.profile?.fullName || inf.email}</span>
                                            </div>
                                        ) : (
                                            <span className="theme-text-faint text-xs italic">Unassigned</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => navigate(`/owner/applicants/${c.id}`)}
                                            className="inline-flex items-center gap-1.5 text-xs py-1.5 px-3 flex-1"
                                        >
                                            <Eye size={12} />
                                            Applicants
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setAssignOpen(c.id)}
                                            className="inline-flex items-center gap-1.5 text-xs py-1.5 px-3 flex-1"
                                        >
                                            <Users size={12} />
                                            {inf ? 'Reassign' : 'Assign'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop table view */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-3">
                            <thead>
                                <tr className="theme-text-icon text-xs uppercase tracking-wider text-left">
                                    <th className="px-6 py-2 font-medium">Campaign</th>
                                    <th className="px-6 py-2 font-medium">Offer</th>
                                    <th className="px-6 py-2 font-medium">Promo</th>
                                    <th className="px-6 py-2 font-medium">Dates</th>
                                    <th className="px-6 py-2 font-medium">Applicants</th>
                                    <th className="px-6 py-2 font-medium">Influencer</th>
                                    <th className="px-6 py-2 font-medium">Status</th>
                                    <th className="px-6 py-2 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myCampaigns.map((c) => {
                                    const inf = influencers.find(i => i.id === c.assignedInfluencer);
                                    const apps = c.applications || [];
                                    const pendingCount = apps.filter(a => a.status === 'pending').length;
                                    return (
                                        <tr key={c.id} className="theme-bg-elevated border theme-border-elevated rounded-2xl hover:theme-bg-elevated-hover transition-all group">
                                            <td className="px-6 py-4 rounded-l-2xl">
                                                <div className="flex flex-col">
                                                    <span className="theme-text font-semibold">{c.title}</span>
                                                    <span className="theme-text-icon text-sm">{c.brand}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="theme-text-secondary text-sm max-w-[150px] truncate" title={c.offer}>{c.offer}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="theme-promo px-2 py-0.5 rounded-md font-mono text-xs">{c.promoCode}</code>
                                            </td>
                                            <td className="px-6 py-4 theme-text-muted text-xs whitespace-nowrap">
                                                {c.startDate} → {c.endDate}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => navigate(`/owner/applicants/${c.id}`)}
                                                    className="flex items-center gap-2 hover:theme-bg-elevated rounded-lg px-2 py-1 -mx-2 transition-colors"
                                                >
                                                    <span className="theme-text font-medium text-sm">{apps.length}</span>
                                                    {pendingCount > 0 && (
                                                        <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                                                            <Clock size={9} />
                                                            {pendingCount} new
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                {inf ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                            {inf.profile?.fullName?.charAt(0) || 'I'}
                                                        </div>
                                                        <span className="theme-text-secondary text-sm whitespace-nowrap">{inf.profile?.fullName || inf.email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="theme-text-faint text-xs italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={c.status === 'submitted' ? 'submitted' : c.status === 'open' ? 'info' : 'active'}>
                                                    {c.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 rounded-r-2xl text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => navigate(`/owner/applicants/${c.id}`)}
                                                        className="inline-flex items-center gap-1.5 text-xs py-1.5 px-3"
                                                    >
                                                        <Eye size={12} />
                                                        Applicants
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => setAssignOpen(c.id)}
                                                        className="inline-flex items-center gap-1.5 text-xs py-1.5 px-3"
                                                    >
                                                        <Users size={12} />
                                                        {inf ? 'Reassign' : 'Assign'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </div>

            {/* Create Campaign Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Campaign" maxWidth="max-w-2xl">
                {success ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                            <span className="text-emerald-400 text-xl">✓</span>
                        </div>
                        <p className="theme-text font-medium">{success}</p>
                    </div>
                ) : (
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <Input
                            label="Campaign Title"
                            placeholder="e.g. Summer Brew Special"
                            error={errors.title}
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium theme-text-secondary">Offer Description</label>
                            <textarea
                                placeholder="e.g. 1 Free Coffee + 20% discount for all followers"
                                value={form.offer}
                                onChange={(e) => setForm({ ...form, offer: e.target.value })}
                                rows={3}
                                className="w-full theme-bg-elevated border theme-border theme-text placeholder:theme-text-faint rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                            />
                            {errors.offer && <p className="text-red-400 text-xs">{errors.offer}</p>}
                        </div>
                        <Input
                            label="Promo Code"
                            placeholder="e.g. BREW20"
                            error={errors.promoCode}
                            value={form.promoCode}
                            onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Start Date"
                                type="date"
                                error={errors.startDate}
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            />
                            <Input
                                label="End Date"
                                type="date"
                                error={errors.endDate}
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-3 mt-1">
                            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1">
                                Create Campaign
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Assign Influencer Modal */}
            <Modal
                isOpen={!!assignOpen}
                onClose={() => setAssignOpen(null)}
                title="Assign Influencer"
                maxWidth="max-w-md"
            >
                <div className="flex flex-col gap-1">
                    {onboardedInfluencers.length === 0 ? (
                        <p className="theme-text-icon text-sm p-4 text-center">No onboarded influencers available</p>
                    ) : (
                        onboardedInfluencers.map((i) => (
                            <button
                                key={i.id}
                                onClick={() => handleAssign(assignOpen, i.id)}
                                className="w-full flex items-center gap-4 p-4 hover:theme-bg-elevated transition-all text-left rounded-xl group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg group-hover:shadow-violet-500/20">
                                    {i.profile?.fullName?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="theme-text font-medium truncate">{i.profile?.fullName}</p>
                                    <p className="theme-text-icon text-xs truncate">@{i.profile?.instagram} · {i.profile?.followers}</p>
                                </div>
                                <div className="text-violet-400 group-hover:translate-x-1 transition-transform">
                                    <ChevronDown size={18} className="-rotate-90" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </Modal>
        </OwnerLayout>
    );
}
