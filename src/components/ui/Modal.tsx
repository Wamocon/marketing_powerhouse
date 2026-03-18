import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, footer, maxWidth = '560px' }: ModalProps) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal animate-in"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth }}
            >
                <div className="modal-header">
                    <div className="modal-title">{title}</div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
