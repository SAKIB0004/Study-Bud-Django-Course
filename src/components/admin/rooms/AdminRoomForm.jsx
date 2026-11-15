
import AdminSearchableSelect from "../common/AdminSearchableSelect";
import AdminLoading from "../common/AdminLoading";

function AdminRoomForm({
    roomName,
    setRoomName,
    description,
    setDescription,
    users,
    topics,
    selectedHost,
    setSelectedHost,
    selectedTopics,
    setSelectedTopics,
    onCreateTopic,
    formLoading = false,
    submitting = false,
    addingTopic = false,
    formError = "",
    onSubmit,
    onCancel,
}) {
    if (formLoading) {
        return <AdminLoading message="Loading users and topics..." />;
    }

    return (
        <form onSubmit={onSubmit}>
            {formError && (
                <p className="admin-error">{formError}</p>
            )}

            <div className="admin-form-group">
                <label htmlFor="room-name">
                    Room Name *
                </label>

                <input
                    id="room-name"
                    type="text"
                    value={roomName}
                    onChange={(event) =>
                        setRoomName(event.target.value)
                    }
                    placeholder="Enter room name"
                    required
                    disabled={submitting}
                />
            </div>

            <div className="admin-form-group">
                <label htmlFor="room-description">
                    Description
                </label>

                <textarea
                    id="room-description"
                    value={description}
                    onChange={(event) =>
                        setDescription(event.target.value)
                    }
                    placeholder="Enter room description"
                    rows={4}
                    disabled={submitting}
                />
            </div>

            <div className="admin-form-group">
                <label>Select Host *</label>

                <AdminSearchableSelect
                    options={users}
                    value={selectedHost}
                    onChange={setSelectedHost}
                    placeholder="Search users by name or username..."
                    getOptionLabel={(user) =>
                        user.name || user.username
                    }
                    getOptionDescription={(user) =>
                        user.username
                            ? `@${user.username}`
                            : user.email
                    }
                    getOptionSearchText={(user) =>
                        `${user.name || ""} ${user.username || ""} ${user.email || ""}`
                    }
                    disabled={submitting}
                />

                <small>
                    Search and select one user as the room host.
                </small>
            </div>

            <div className="admin-form-group">
                <label>Select Topics *</label>

                <AdminSearchableSelect
                    options={topics}
                    value={selectedTopics}
                    onChange={setSelectedTopics}
                    multiple
                    placeholder="Search or create topics..."
                    getOptionLabel={(topic) => topic.name}
                    getOptionSearchText={(topic) => topic.name}
                    onCreate={onCreateTopic}
                    createLabel={(name) => `+ Create "${name}"`}
                    disabled={submitting || addingTopic}
                />

                <small>
                    Select multiple topics, search existing topics,
                    or create a new one.
                </small>
            </div>

            <div className="admin-modal-actions">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={submitting || addingTopic}
                >
                    {submitting
                        ? "Creating..."
                        : addingTopic
                            ? "Adding Topic..."
                            : "Create Room"}
                </button>
            </div>
        </form>
    );
}

export default AdminRoomForm;
