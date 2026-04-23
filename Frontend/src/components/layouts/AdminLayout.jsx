import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Building2, Megaphone, LogOut, Zap, Shield, Menu, X
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/influencers', icon: Users, label: 'Influencers' },
    { to: '/admin/owners', icon: Building2, label: 'Brand Owners' },
    { to: '/admin/campaigns', icon: Megaphone, label: 'All Campaigns' },
];

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="min-h-screen theme-bg flex">
            {/* Mobile header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 theme-bg-sidebar border-b theme-border-subtle px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                        <Zap size={15} className="text-white" />
                    </div>
                    <span className="theme-text font-bold text-sm">InfluMatch</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="theme-text p-1.5 rounded-lg hover:theme-bg-elevated">
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`w-64 theme-bg-sidebar border-r theme-border-subtle flex flex-col fixed h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-6 border-b theme-border-subtle">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Zap size={18} className="text-white" />
                        </div>
                        <div>
                            <span className="theme-text font-bold text-base">InfluMatch</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Shield size={10} className="text-violet-400" />
                                <span className="text-violet-400 text-[10px] font-semibold uppercase tracking-wider">Super Admin</span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <p className="theme-text-faint text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
                    <ul className="flex flex-col gap-1">
                        {navItems.map(({ to, icon: Icon, label }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                                            : 'theme-text-muted hover:theme-text hover:theme-bg-elevated'
                                        }`
                                    }
                                >
                                    <Icon size={17} />
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t theme-border-subtle">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="theme-text text-sm font-medium truncate">{user?.name}</p>
                            <p className="theme-text-icon text-xs truncate">{user?.email}</p>
                        </div>
                    </div>
                    <ThemeToggle />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="flex-1 md:ml-64 px-4 py-8 pt-18 md:pt-8 min-w-0">{children}</main>
        </div>
    );
}
