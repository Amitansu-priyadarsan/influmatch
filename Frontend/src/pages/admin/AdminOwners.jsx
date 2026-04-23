import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layouts/AdminLayout';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Plus, Mail, Building2, MapPin, Search } from 'lucide-react';

export default function AdminOwners() {
    const { owners, campaigns, createOwner } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ email: '', password: '', business: '', city: '' });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.email) e.email = 'Email is required';
        if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
        if (!form.business) e.business = 'Business name is required';
        if (!form.city) e.city = 'City is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!validate()) return;
        createOwner(form);
        setSuccess(true);
        setTimeout(() => {
            setIsOpen(false);
            setForm({ email: '', password: '', business: '', city: '' });
            setSuccess(false);
        }, 1200);
    };

    const filtered = owners.filter(
        (o) =>
            o.business?.toLowerCase().includes(search.toLowerCase()) ||
            o.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">Brand Owners</h1>
                        <p className="theme-text-muted text-sm">{owners.length} restaurant & cafe accounts</p>
                    </div>
                    <Button onClick={() => setIsOpen(true)} className="flex-shrink-0">
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Owner</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-icon" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by business or email..."
                        className="w-full theme-bg-elevated border theme-border theme-text placeholder:theme-text-faint rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="theme-text-icon text-xs uppercase tracking-wider text-left">
                                <th className="px-6 py-2 font-medium">Business</th>
                                <th className="px-6 py-2 font-medium">Location</th>
                                <th className="px-6 py-2 font-medium">Contact</th>
                                <th className="px-6 py-2 font-medium">Stats</th>
                                <th className="px-6 py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((owner) => {
                                const ownerCampaigns = campaigns.filter(c => c.ownerId === owner.id);
                                return (
                                    <tr key={owner.id} className="theme-bg-elevated border theme-border-elevated rounded-2xl hover:theme-bg-elevated-hover transition-all group">
                                        <td className="px-6 py-4 rounded-l-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                                    {owner.business?.charAt(0)}
                                                </div>
                                                <span className="theme-text font-semibold">{owner.business}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 theme-text-secondary text-sm">
                                                <MapPin size={14} className="text-blue-400/60" />
                                                <span>{owner.city}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 theme-text-icon text-xs">
                                                <Mail size={12} />
                                                {owner.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="theme-text-secondary text-sm font-medium">{ownerCampaigns.length} campaigns</span>
                                        </td>
                                        <td className="px-6 py-4 rounded-r-2xl">
                                            <Badge variant="active">Active</Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col gap-3">
                    {filtered.map((owner) => {
                        const ownerCampaigns = campaigns.filter(c => c.ownerId === owner.id);
                        return (
                            <div key={owner.id} className="theme-bg-elevated border theme-border-elevated rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {owner.business?.charAt(0)}
                                        </div>
                                        <span className="theme-text font-semibold text-sm">{owner.business}</span>
                                    </div>
                                    <Badge variant="active">Active</Badge>
                                </div>
                                <div className="flex flex-col gap-2 text-xs pl-12">
                                    <div className="flex items-center gap-1.5 theme-text-secondary">
                                        <MapPin size={12} className="text-blue-400/60" />
                                        <span>{owner.city}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 theme-text-icon">
                                        <Mail size={12} />
                                        <span className="truncate">{owner.email}</span>
                                    </div>
                                    <span className="theme-text-secondary font-medium">{ownerCampaigns.length} campaigns</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 theme-bg-elevated border theme-border-subtle rounded-2xl">
                        <Building2 size={40} className="theme-text-faint mx-auto mb-3" />
                        <p className="theme-text-icon">No owners found</p>
                    </div>
                )}
            </div>

            {/* Add Owner Modal */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Brand Owner">
                {success ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                            <span className="text-emerald-400 text-xl">✓</span>
                        </div>
                        <p className="theme-text font-medium">Owner account created!</p>
                    </div>
                ) : (
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <Input
                            label="Business Name"
                            placeholder="e.g. Brewhouse Cafe"
                            icon={Building2}
                            error={errors.business}
                            value={form.business}
                            onChange={(e) => setForm({ ...form, business: e.target.value })}
                        />
                        <Input
                            label="City"
                            placeholder="e.g. Bangalore"
                            icon={MapPin}
                            error={errors.city}
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                        />
                        <Input
                            label="Login Email"
                            type="email"
                            placeholder="owner@business.com"
                            icon={Mail}
                            error={errors.email}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <Input
                            label="Temporary Password"
                            type="text"
                            placeholder="Min. 6 characters"
                            error={errors.password}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                        <div className="flex gap-3 mt-2">
                            <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1">
                                Create Account
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
