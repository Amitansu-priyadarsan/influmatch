import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OwnerLayout from '../../components/layouts/OwnerLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Users, Megaphone, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

export default function OwnerApplicantsOverview() {
    const { user, campaigns } = useAuth();
    const navigate = useNavigate();

    const myCampaigns = campaigns.filter((c) => c.ownerId === user.id);
    const campaignsWithApps = myCampaigns.filter((c) => (c.applications || []).length > 0);
    const totalPending = myCampaigns.reduce(
        (sum, c) => sum + (c.applications || []).filter((a) => a.status === 'pending').length,
        0
    );

    return (
        <OwnerLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">Applicants</h1>
                        <p className="theme-text-muted text-sm">
                            {totalPending} pending review{totalPending !== 1 ? 's' : ''} across {campaignsWithApps.length} campaign{campaignsWithApps.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {myCampaigns.length === 0 ? (
                    <div className="text-center py-20 theme-bg-elevated border theme-border-subtle rounded-2xl">
                        <div className="w-16 h-16 rounded-2xl theme-bg-elevated flex items-center justify-center mx-auto mb-4">
                            <Users size={28} className="theme-text-faint" />
                        </div>
                        <p className="theme-text-muted font-medium mb-1">No campaigns yet</p>
                        <p className="theme-text-faint text-sm">Create a campaign to start receiving applications</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {myCampaigns.map((campaign) => {
                            const apps = campaign.applications || [];
                            const pending = apps.filter((a) => a.status === 'pending').length;
                            const accepted = apps.filter((a) => a.status === 'accepted').length;
                            const rejected = apps.filter((a) => a.status === 'rejected').length;

                            return (
                                <div
                                    key={campaign.id}
                                    className="theme-bg-elevated border theme-border-elevated rounded-2xl p-6 hover:theme-bg-elevated-hover transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <Megaphone size={20} className="text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="theme-text font-semibold text-base sm:text-lg">{campaign.title}</h3>
                                                    <Badge variant={campaign.status === 'open' ? 'info' : campaign.status === 'active' ? 'active' : 'submitted'}>
                                                        {campaign.status}
                                                    </Badge>
                                                </div>
                                                <p className="theme-text-icon text-xs sm:text-sm truncate">{campaign.promoCode} · {campaign.startDate} → {campaign.endDate}</p>
                                            </div>
                                        </div>

                                        {/* Application counts */}
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-shrink-0">
                                            {pending > 0 && (
                                                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                                                    <Clock size={13} className="text-amber-400" />
                                                    <span className="text-amber-300 text-sm font-medium">{pending}</span>
                                                </div>
                                            )}
                                            {accepted > 0 && (
                                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                                                    <CheckCircle size={13} className="text-emerald-400" />
                                                    <span className="text-emerald-300 text-sm font-medium">{accepted}</span>
                                                </div>
                                            )}
                                            {rejected > 0 && (
                                                <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
                                                    <XCircle size={13} className="text-red-400" />
                                                    <span className="text-red-300 text-sm font-medium">{rejected}</span>
                                                </div>
                                            )}
                                            {apps.length === 0 && (
                                                <span className="theme-text-faint text-sm italic">No applications</span>
                                            )}
                                        </div>

                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => navigate(`/owner/applicants/${campaign.id}`)}
                                            className="text-xs flex-shrink-0"
                                        >
                                            <Users size={13} />
                                            View ({apps.length})
                                            <ChevronRight size={13} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </OwnerLayout>
    );
}
