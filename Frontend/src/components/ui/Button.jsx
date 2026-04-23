export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', onClick }) {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-violet-600 text-white hover:bg-violet-700 active:scale-95 shadow-lg shadow-violet-500/25',
        secondary: 'theme-bg-elevated theme-text theme-border border hover:opacity-80 active:scale-95 backdrop-blur-sm',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
        ghost: 'theme-text-muted hover:theme-text hover:theme-bg-elevated active:scale-95',
        outline: 'border border-violet-500 text-violet-400 hover:bg-violet-500/10 active:scale-95',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-base',
    };
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
}
