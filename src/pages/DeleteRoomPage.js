import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import roomService from "../services/api/roomService";

function DeleteRoomPage({ type = "room" }) {
    const { id, messageId } = useParams();
    const navigate = useNavigate();

    const isMessage = type === "message";

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    // Fetch room or message
    useEffect(() => {
        const fetchItem = async () => {
            try {
                if (isMessage) {
                    const response = await roomService.getMessages(id);

                    const messages = Array.isArray(response)
                        ? response
                        : response.results || [];

                    const selectedMessage = messages.find(
                        (message) =>
                            String(message.id) === String(messageId)
                    );

                    if (!selectedMessage) {
                        setError("Message not found.");
                        return;
                    }

                    setItem(selectedMessage);

                } else {
                    const response = await roomService.getRoomById(id);
                    setItem(response);
                }

            } catch (error) {
                setError(
                    error.response?.data?.detail ||
                    `Unable to load ${isMessage ? "message" : "room"}.`
                );
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id, messageId, isMessage]);

    // Delete room or message
    const handleDelete = async () => {
        try {
            setDeleting(true);
            setError("");

            if (isMessage) {
                await roomService.deleteMessage(id, messageId);
                // Return to previous page after deleting a message
                navigate(-1);
            } else {
                await roomService.deleteRoom(id);
                // Redirect to HomePage after deleting a room
                 navigate("/", { replace: true });
            }

        } catch (error) {
            setError(
                error.response?.data?.detail ||
                `Failed to delete ${isMessage ? "message" : "room"}.`
            );
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!item) {
        return (
            <div className="delete-room-page">
                <p>{error || "Item not found."}</p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const itemName = isMessage ? item.body : item.name;

    return (
        <div className="delete-room-page">

            <div className="delete-room-container">

                <h1>
                    Delete {isMessage ? "Message" : "Study Room"}
                </h1>

                <p>
                    Are you sure you want to delete
                    <strong> "{itemName}"</strong>?
                </p>

                {error && (
                    <p className="error-message">{error}</p>
                )}

                <div className="delete-room-actions">
                    <button
                        type="button"
                        className="btn btn--dark"
                        onClick={() => navigate(-1)}
                        disabled={deleting}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="btn btn--main"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                </div>

            </div>

        </div>
    );
}

export default DeleteRoomPage;
