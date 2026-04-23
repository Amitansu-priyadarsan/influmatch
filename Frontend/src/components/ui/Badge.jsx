export default function Badge({ children, variant = 'default' }) {
    const variants = {
        default: 'theme-badge-default',
        success: 'theme-badge-success border',
        warning: 'theme-badge-warning border',
        danger: 'theme-badge-danger border',
        info: 'theme-badge-info border',
        active: 'theme-badge-active border',
        submitted: 'theme-badge-success border',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>
            {children}
        </span>
    );
}
