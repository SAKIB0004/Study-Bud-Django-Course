function AdminLoading({ message = "Loading..." }) {
    return (
        <div className="admin-loading">
            <div className="admin-loading__spinner" />
            <p>{message}</p>
        </div>
    );
}

export default AdminLoading;