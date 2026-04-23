import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Megaphone, LogOut, Zap, Building2, Users, Menu, X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const navItems = [
    { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/owner/campaigns', icon: Megaphone, label: 'My Campaigns' },
    { to: '/owner/applicants', icon: Users, label: 'Applicants' },
];

export default function OwnerLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleLogout = () => { logout(); navigate('/login'); };
    const initials = user?.business?.charAt(0) || 'B';

    return (
        <div className="min-h-screen theme-bg flex">
            {/* Mobile header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 theme-bg-sidebar border-b theme-border-subtle px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Zap size={15} className="text-white" />
                    </div>
                    <span className="theme-text font-bold text-sm">InfluMatch</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="theme-text p-1.5 rounded-lg hover:theme-bg-elevated">
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`w-64 theme-bg-sidebar border-r theme-border-subtle flex flex-col fixed h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-6 border-b theme-border-subtle">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Zap size={18} className="text-white" />
                        </div>
                        <div>
                            <span className="theme-text font-bold text-base">InfluMatch</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Building2 size={10} className="text-blue-400" />
                                <span className="text-blue-400 text-[10px] font-semibold uppercase tracking-wider">Brand Owner</span>
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
                                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/20'
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="theme-text text-sm font-medium truncate">{user?.business}</p>
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
