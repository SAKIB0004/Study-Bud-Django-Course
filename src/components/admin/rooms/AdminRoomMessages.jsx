
import AdminLoading from "../common/AdminLoading";
import AdminEmptyState from "../common/AdminEmptyState";
import AdminErrorState from "../common/AdminErrorState";

function AdminRoomMessages({
    messages = [],
    loading = false,
    error = "",
}) {
    if (loading) {
        return (
            <AdminLoading message="Loading messages..." />
        );
    }

    if (error) {
        return (
            <AdminErrorState message={error} />
        );
    }

    if (messages.length === 0) {
        return (
            <AdminEmptyState
                title="No messages yet"
                message="There are no messages in this room."
            />
        );
    }

    return (
        <div className="admin-message-list">
            {messages.map((message) => (
                <div
                    className="admin-message-item"
                    key={message.id}
                >
                    <div className="admin-message-header">
                        <strong>
                            {message.user_name || "Unknown User"}
                        </strong>

                        <small>
                            {message.created
                                ? new Date(
                                    message.created
                                ).toLocaleString()
                                : ""}
                        </small>
                    </div>

                    <p>{message.body}</p>
                </div>
            ))}
        </div>
    );
}

export default AdminRoomMessages;
