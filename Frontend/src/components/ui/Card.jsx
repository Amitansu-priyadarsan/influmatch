export default function Card({ children, className = '', glass = false }) {
    const base = glass
        ? 'theme-bg-elevated border theme-border backdrop-blur-sm'
        : 'theme-bg-card border theme-border-subtle';
    return (
        <div className={`${base} rounded-2xl p-6 ${className}`}>
            {children}
        </div>
    );
}
