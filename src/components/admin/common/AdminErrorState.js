function AdminErrorState({
    message = "Something went wrong.",
    onRetry,
}) {
    return (
        <div className="admin-error-state">
            <h3>Unable to load data</h3>
            <p>{message}</p>

            {onRetry && (
                <button
                    type="button"
                    className="admin-button admin-button--primary"
                    onClick={onRetry}
                >
                    Try Again
                </button>
            )}
        </div>
    );
}

export default AdminErrorState;