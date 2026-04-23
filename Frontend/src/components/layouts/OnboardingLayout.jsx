import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function OnboardingLayout({ steps, currentStep, heroTitle, heroSubtitle, title, subtitle, children, footer }) {
    const isFirst = currentStep === 1;

    return (
        <div className="min-h-screen theme-bg flex">
            {/* Left sidebar */}
            <aside
                className={`hidden md:flex md:w-[38%] lg:w-[32%] flex-col justify-between p-10 relative overflow-hidden transition-colors ${
                    isFirst ? 'bg-gradient-to-br from-violet-600 to-pink-500 text-white' : 'theme-bg-elevated border-r theme-border'
                }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isFirst ? 'bg-white/15 backdrop-blur' : 'bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/30'}`}>
                        <Zap size={20} className={isFirst ? 'text-white' : 'text-white'} />
                    </div>
                    <span className={`text-2xl font-bold ${isFirst ? 'text-white' : 'theme-text'}`}>InfluMatch</span>
                </div>

                {/* Middle content: hero on step 1, step tracker after */}
                {isFirst ? (
                    <div>
                        <h2 className="text-4xl font-bold leading-tight mb-4">{heroTitle}</h2>
                        <p className="text-white/80 text-sm leading-relaxed">{heroSubtitle}</p>
                    </div>
                ) : (
                    <nav className="flex flex-col gap-5">
                        {steps.map((s) => {
                            const done = currentStep > s.id;
                            const active = currentStep === s.id;
                            return (
                                <div key={s.id} className="flex items-center gap-3">
                                    {done ? (
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <CheckCircle2 size={18} className="text-white" />
                                        </div>
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                                            active ? 'border-violet-500 text-violet-500' : 'theme-border theme-text-faint'
                                        }`}>
                                            {s.id}
                                        </div>
                                    )}
                                    <span className={`text-sm font-semibold tracking-wider uppercase ${
                                        active ? 'text-violet-500' : done ? 'theme-text-faint line-through decoration-emerald-500/40' : 'theme-text-faint'
                                    }`}>
                                        {s.title}
                                    </span>
                                    {active && <ArrowRight size={16} className="text-violet-500 ml-auto" />}
                                </div>
                            );
                        })}
                    </nav>
                )}

                {/* Decorative bottom */}
                <div className="relative h-24">
                    <div className={`absolute bottom-0 left-0 w-40 h-24 rounded-tr-[3rem] ${isFirst ? 'bg-white/10' : 'bg-violet-500/5'}`} />
                    <div className={`absolute bottom-6 left-10 w-6 h-6 rounded ${isFirst ? 'bg-white' : 'bg-violet-500'}`} />
                    <div className={`absolute bottom-0 left-12 w-1 h-16 ${isFirst ? 'bg-white/60' : 'bg-violet-500/60'}`} />
                </div>
            </aside>

            {/* Right main */}
            <main className="flex-1 flex flex-col">

                <div className="flex-1 flex justify-center px-6 pb-10">
                    <div className="w-full max-w-2xl">
                        <h1 className="text-3xl font-bold theme-text mb-2">{title}</h1>
                        {subtitle && <p className="theme-text-muted text-sm mb-8 leading-relaxed">{subtitle}</p>}
                        {children}
                        {footer && <div className="mt-8">{footer}</div>}
                    </div>
                </div>
            </main>
        </div>
    );
}

export function OptionTile({ icon: Icon, title, description, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                selected
                    ? 'border-violet-500 bg-violet-500/5 shadow-md'
                    : 'theme-border theme-bg-elevated hover:border-violet-400 hover:shadow-sm'
            }`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
                selected ? 'border-violet-500 bg-violet-500/10 text-violet-500' : 'theme-border theme-text-icon'
            }`}>
                <Icon size={22} />
            </div>
            <div className="flex-1">
                <p className={`text-sm font-bold tracking-wide uppercase ${selected ? 'text-violet-500' : 'theme-text'}`}>{title}</p>
                {description && <p className="text-sm theme-text-muted mt-0.5">{description}</p>}
            </div>
            {selected && <ArrowRight size={18} className="text-violet-500" />}
        </button>
    );
}

export function OptionCard({ icon: Icon, title, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all ${
                selected
                    ? 'border-violet-500 bg-violet-500/5 shadow-md'
                    : 'theme-border theme-bg-elevated hover:border-violet-400 hover:shadow-sm'
            }`}
        >
            <div className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 ${
                selected ? 'border-violet-500 bg-violet-500/10 text-violet-500' : 'theme-border theme-text-icon'
            }`}>
                <Icon size={36} />
            </div>
            <p className={`text-sm font-bold tracking-wider uppercase ${selected ? 'text-violet-500' : 'theme-text'}`}>{title}</p>
        </button>
    );
}
