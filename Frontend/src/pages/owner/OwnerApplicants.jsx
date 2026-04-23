import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
    ArrowLeft, Users, CheckCircle, XCircle, Clock, Instagram,
    MapPin, Phone, MessageSquare, Star, TrendingUp, User,
} from 'lucide-react';

export default function OwnerApplicants() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const { campaigns, influencers, acceptApplication, rejectApplication } = useAuth();
    const [profileOpen, setProfileOpen] = useState(null);
    const [confirmAccept, setConfirmAccept] = useState(null);
    const [confirmReject, setConfirmReject] = useState(null);

    const campaign = campaigns.find((c) => c.id === campaignId);

    if (!campaign) {
        return (
            <OwnerLayout>
                <div className="max-w-4xl mx-auto text-center py-20">
                    <p className="theme-text-muted">Campaign not found</p>
                    <Button variant="secondary" onClick={() => navigate('/owner/campaigns')} className="mt-4">
                        <ArrowLeft size={14} /> Back to Campaigns
                    </Button>
                </div>
            </OwnerLayout>
        );
    }

    const applications = campaign.applications || [];
    const pendingApps = applications.filter((a) => a.status === 'pending');
    const acceptedApps = applications.filter((a) => a.status === 'accepted');
    const rejectedApps = applications.filter((a) => a.status === 'rejected');

    const getInfluencer = (id) => influencers.find((i) => i.id === id);

    const handleAccept = (influencerId) => {
        acceptApplication(campaignId, influencerId);
        setConfirmAccept(null);
    };

    const handleReject = (influencerId) => {
        rejectApplication(campaignId, influencerId);
        setConfirmReject(null);
    };

    const statusConfig = {
        pending: { label: 'Pending Review', variant: 'warning', icon: Clock, color: 'text-amber-400' },
        accepted: { label: 'Accepted', variant: 'success', icon: CheckCircle, color: 'text-emerald-400' },
        rejected: { label: 'Rejected', variant: 'danger', icon: XCircle, color: 'text-red-400' },
    };

    return (
        <OwnerLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/owner/campaigns')}
                        className="flex items-center gap-2 theme-text-icon hover:theme-text-secondary text-sm mb-4 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Campaigns
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">{campaign.title}</h1>
                    <p className="theme-text-muted text-sm">
                        {campaign.brand} · {campaign.promoCode} · {campaign.startDate} → {campaign.endDate}
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="theme-bg-elevated border theme-border-elevated rounded-2xl p-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
                            <Clock size={18} className="text-white" />
                        </div>
                        <p className="text-2xl md:text-3xl font-bold theme-text mb-1">{pendingApps.length}</p>
                        <p className="theme-text-muted text-sm">Pending Review</p>
                    </div>
                    <div className="theme-bg-elevated border theme-border-elevated rounded-2xl p-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-3">
                            <CheckCircle size={18} className="text-white" />
                        </div>
                        <p className="text-2xl md:text-3xl font-bold theme-text mb-1">{acceptedApps.length}</p>
                        <p className="theme-text-muted text-sm">Accepted</p>
                    </div>
                    <div className="theme-bg-elevated border theme-border-elevated rounded-2xl p-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-3">
                            <XCircle size={18} className="text-white" />
                        </div>
                        <p className="text-2xl md:text-3xl font-bold theme-text mb-1">{rejectedApps.length}</p>
                        <p className="theme-text-muted text-sm">Rejected</p>
                    </div>
                </div>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <div className="text-center py-20 theme-bg-elevated border theme-border-subtle rounded-2xl">
                        <div className="w-16 h-16 rounded-2xl theme-bg-elevated flex items-center justify-center mx-auto mb-4">
                            <Users size={28} className="theme-text-faint" />
                        </div>
                        <p className="theme-text-muted font-medium mb-1">No applications yet</p>
                        <p className="theme-text-faint text-sm">Influencers will start applying once they discover your campaign</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="theme-text-icon text-xs font-semibold uppercase tracking-wider mb-1">
                            All Applications ({applications.length})
                        </p>

                        {applications.map((app) => {
                            const inf = getInfluencer(app.influencerId);
                            if (!inf) return null;
                            const status = statusConfig[app.status];
                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={app.influencerId}
                                    className="theme-bg-elevated border theme-border-elevated rounded-2xl p-5 hover:theme-bg-elevated-hover transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                                            {inf.profile?.fullName?.charAt(0)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                                                <h3 className="theme-text font-semibold text-base sm:text-lg">{inf.profile?.fullName}</h3>
                                                <Badge variant={status.variant}>{status.label}</Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 mb-3">
                                                <span className="flex items-center gap-1.5 theme-text-muted text-sm">
                                                    <Instagram size={13} />
                                                    {inf.profile?.instagram}
                                                </span>
                                                <span className="flex items-center gap-1.5 theme-text-muted text-sm">
                                                    <Star size={13} className="text-pink-400" />
                                                    {inf.profile?.followers} followers
                                                </span>
                                                <span className="flex items-center gap-1.5 theme-text-muted text-sm">
                                                    <TrendingUp size={13} />
                                                    {inf.profile?.niche}
                                                </span>
                                                <span className="flex items-center gap-1.5 theme-text-muted text-sm">
                                                    <MapPin size={13} />
                                                    {inf.profile?.city}
                                                </span>
                                            </div>

                                            {/* Application message */}
                                            {app.message && (
                                                <div className="theme-bg-elevated border theme-border-subtle rounded-xl p-3 mb-3">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <MessageSquare size={12} className="theme-text-faint" />
                                                        <span className="theme-text-faint text-xs font-medium">Application Message</span>
                                                    </div>
                                                    <p className="theme-text-secondary text-sm leading-relaxed">"{app.message}"</p>
                                                </div>
                                            )}

                                            <p className="theme-text-faint text-xs">Applied on {app.appliedAt}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setProfileOpen(inf)}
                                                className="text-xs"
                                            >
                                                <User size={12} />
                                                View Profile
                                            </Button>

                                            {app.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setConfirmAccept(inf)}
                                                        className="text-xs bg-emerald-600 hover:bg-emerald-500"
                                                    >
                                                        <CheckCircle size={12} />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => setConfirmReject(inf)}
                                                        className="text-xs"
                                                    >
                                                        <XCircle size={12} />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Full Profile Modal */}
            <Modal
                isOpen={!!profileOpen}
                onClose={() => setProfileOpen(null)}
                title="Influencer Profile"
                maxWidth="max-w-lg"
            >
                {profileOpen && (() => {
                    const inf = profileOpen;
                    const app = applications.find((a) => a.influencerId === inf.id);
                    return (
                        <div className="flex flex-col gap-5">
                            {/* Profile header */}
                            <div className="flex items-center gap-4 bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-500/20 rounded-xl p-5">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-2xl">
                                    {inf.profile?.fullName?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="theme-text font-bold text-xl">{inf.profile?.fullName}</h3>
                                    <p className="theme-text-muted text-sm">{inf.profile?.instagram}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="flex items-center gap-1 text-pink-300 text-sm font-medium">
                                            <Star size={13} className="fill-pink-400" />
                                            {inf.profile?.followers}
                                        </span>
                                        <span className="theme-text-faint">·</span>
                                        <span className="theme-text-muted text-sm">{inf.profile?.niche}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="theme-bg-elevated rounded-xl p-4">
                                    <div className="flex items-center gap-2 theme-text-icon text-xs font-medium mb-2">
                                        <MapPin size={12} />
                                        Location
                                    </div>
                                    <p className="theme-text font-medium">{inf.profile?.city}</p>
                                </div>
                                <div className="theme-bg-elevated rounded-xl p-4">
                                    <div className="flex items-center gap-2 theme-text-icon text-xs font-medium mb-2">
                                        <Phone size={12} />
                                        Phone
                                    </div>
                                    <p className="theme-text font-medium">{inf.profile?.phone}</p>
                                </div>
                                <div className="theme-bg-elevated rounded-xl p-4 col-span-2">
                                    <div className="flex items-center gap-2 theme-text-icon text-xs font-medium mb-2">
                                        <MessageSquare size={12} />
                                        Bio
                                    </div>
                                    <p className="theme-text-secondary text-sm leading-relaxed">{inf.profile?.bio}</p>
                                </div>
                            </div>

                            {/* Application message if exists */}
                            {app?.message && (
                                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                                    <p className="theme-text-icon text-xs font-medium uppercase tracking-wider mb-2">Their pitch for this campaign</p>
                                    <p className="theme-text-secondary text-sm leading-relaxed italic">"{app.message}"</p>
                                </div>
                            )}

                            {/* Actions */}
                            {app?.status === 'pending' && (
                                <div className="flex gap-3 pt-2 border-t theme-border-subtle">
                                    <Button
                                        variant="danger"
                                        onClick={() => { setProfileOpen(null); setConfirmReject(inf); }}
                                        className="flex-1"
                                    >
                                        <XCircle size={14} />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => { setProfileOpen(null); setConfirmAccept(inf); }}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                                    >
                                        <CheckCircle size={14} />
                                        Accept & Assign
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </Modal>

            {/* Confirm Accept Modal */}
            <Modal
                isOpen={!!confirmAccept}
                onClose={() => setConfirmAccept(null)}
                title="Accept Application"
            >
                {confirmAccept && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                            <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                            <p className="theme-text font-medium">
                                Accept <span className="text-emerald-300">{confirmAccept.profile?.fullName}</span>?
                            </p>
                            <p className="theme-text-icon text-sm mt-1">
                                This will assign them to the campaign and reject all other pending applications.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setConfirmAccept(null)} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleAccept(confirmAccept.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                            >
                                <CheckCircle size={14} />
                                Confirm Accept
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Reject Modal */}
            <Modal
                isOpen={!!confirmReject}
                onClose={() => setConfirmReject(null)}
                title="Reject Application"
            >
                {confirmReject && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                            <XCircle size={32} className="text-red-400 mx-auto mb-2" />
                            <p className="theme-text font-medium">
                                Reject <span className="text-red-300">{confirmReject.profile?.fullName}</span>?
                            </p>
                            <p className="theme-text-icon text-sm mt-1">
                                This influencer will be notified that they were not selected.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setConfirmReject(null)} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleReject(confirmReject.id)}
                                className="flex-1"
                            >
                                <XCircle size={14} />
                                Confirm Reject
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </OwnerLayout>
    );
}
