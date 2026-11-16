import AdminModal from "./AdminModal";

function AdminConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to continue?",
    itemName = "",
    warning = "This action cannot be undone.",
    confirmText = "Yes, Delete",
    cancelText = "Cancel",
    loading = false,
    confirmVariant = "danger",
}) {
    const handleConfirm = () => {
        if (loading) return;
        onConfirm();
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={loading ? () => {} : onClose}
            title={title}
            size="small"
        >
            <div className="admin-confirm-modal">

                <p className="admin-confirm-message">
                    {message}
                    {itemName && (
                        <>
                            {" "}
                            <strong>{itemName}</strong>?
                        </>
                    )}
                </p>

                {warning && (
                    <p className="admin-confirm-warning">
                        {warning}
                    </p>
                )}

                <div className="admin-confirm-actions">

                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className={`admin-btn admin-btn-${confirmVariant}`}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>

                </div>
            </div>
        </AdminModal>
    );
}

export default AdminConfirmModal;
