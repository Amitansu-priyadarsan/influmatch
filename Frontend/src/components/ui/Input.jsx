export default function Input({ label, error, icon: Icon, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium theme-text-secondary">{label}</label>
            )}
            <div className="relative">
                {Icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-icon">
                        <Icon size={16} />
                    </span>
                )}
                <input
                    className={`w-full theme-bg-input border theme-border theme-text rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 placeholder:theme-text-faint ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
    );
}
