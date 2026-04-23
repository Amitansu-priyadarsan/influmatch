import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative z-10 w-full ${maxWidth} theme-bg-card border theme-border rounded-2xl theme-shadow`}>
                <div className="flex items-center justify-between p-5 border-b theme-border">
                    <h3 className="text-lg font-semibold theme-text">{title}</h3>
                    <button
                        onClick={onClose}
                        className="theme-text-icon hover:theme-text transition-colors p-1 rounded-lg hover:theme-bg-elevated"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
