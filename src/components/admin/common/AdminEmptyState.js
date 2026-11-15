function AdminEmptyState({
    title = "No data found",
    message = "There is nothing to display right now.",
    action,
    actionLabel,
}) {
    return (
        <div className="admin-empty-state">
            <h3>{title}</h3>
            <p>{message}</p>

            {action && actionLabel && (
                <button
                    type="button"
                    className="admin-button admin-button--primary"
                    onClick={action}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export default AdminEmptyState;