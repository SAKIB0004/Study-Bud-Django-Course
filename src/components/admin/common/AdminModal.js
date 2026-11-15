import { useEffect } from "react";

function AdminModal({
    isOpen,
    onClose,
    title,
    children,
    size = "medium",
}) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="admin-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <div
                className={`admin-modal admin-modal--${size}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className="admin-modal__header">
                    <h2>{title}</h2>

                    <button
                        type="button"
                        className="admin-modal__close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className="admin-modal__body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AdminModal;