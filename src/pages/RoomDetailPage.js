
import { useEffect, useState, useContext  } from "react";
import { useParams, Link } from "react-router-dom";

import { FaArrowLeft, FaEdit, FaTrashAlt} from "react-icons/fa";

import roomService from "../services/api/roomService";
import { AuthContext } from "../context/AuthContext";

import TopicsSidebar from "../components/topics/TopicsSidebar";
import RightSidebar from "../components/layout/RightSidebar";
import formatRelativeTime from "../utils/formatRelativeTime";
import getImageUrl from "../utils/getImageUrl";

function RoomDetailPage() {
    const { id } = useParams();
    const { user, isAuthenticated } = useContext(AuthContext);

    // Room data
    const [room, setRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [topics, setTopics] = useState([]);
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);

    // Message form
    const [messageBody, setMessageBody] = useState("");
    const [sending, setSending] = useState(false);
    const [messageError, setMessageError] = useState("");

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const fetchParticipants = async () => {
        try {
            const response = await roomService.getParticipants(id);

            const participantList = Array.isArray(response)
                ? response
                : response.results || [];

            console.log("Updated participants:", participantList);
            setParticipants(participantList);
        } catch (error) {
            console.error("Failed to fetch participants:", error);
        }
    };

    // Fetch room information and related data
    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    roomResponse,
                    usersResponse,
                    topicsResponse,
                    messagesResponse,
                    roomsResponse
                ] = await Promise.all([
                    roomService.getRoomById(id),
                    roomService.getUsers(),
                    roomService.getTopics(),
                    roomService.getMessages(id),
                    roomService.getRooms()
                ]);

                // Normalize API responses
                const userList = Array.isArray(usersResponse)
                    ? usersResponse
                    : usersResponse.results || [];

                const topicList = Array.isArray(topicsResponse)
                    ? topicsResponse
                    : topicsResponse.results || [];

                const messageList = Array.isArray(messagesResponse)
                    ? messagesResponse
                    : messagesResponse.results || [];

                const roomList = Array.isArray(roomsResponse)
                    ? roomsResponse
                    : roomsResponse.results || roomsResponse.rooms || [];

                // Update React states
                setRoom(roomResponse);
                setUsers(userList);
                setTopics(topicList);
                setMessages(messageList);
                setRooms(roomList);

                // Fetch participants
                await fetchParticipants();

            } catch (error) {
                console.error("Failed to fetch room:", error);

                setError(
                    error.response?.data?.detail ||
                    "Unable to load room details."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchRoomDetails();

    }, [id]);


    // Send a new message
    // Send a new message
    const handleMessageSubmit = async (event) => {
        event.preventDefault();

        const body = messageBody.trim();

        if (!body || sending) return;

        try {
            setSending(true);
            setMessageError("");

            const newMessage = await roomService.createMessage(id, {
                body: body
            });

            // Add the new message to the beginning
            setMessages((previousMessages) => [
                newMessage,
                ...previousMessages
            ]);

            // Refresh participants after successful message creation
            await fetchParticipants();

            // Clear input
            setMessageBody("");

        } catch (error) {
            console.error("Failed to send message:", error);

            setMessageError(
                error.response?.data?.detail ||
                "Unable to send your message."
            );

        } finally {
            setSending(false);
        }
    };

    // Loading state
    if (loading) {
        return <p>Loading room details...</p>;
    }

    // Error state
    if (error) {
        return <p className="error-message">{error}</p>;
    }

    // Room not found
    if (!room) {
        return <p>Room not found.</p>;
    }

    // Resolve host ID
    const hostId =
        typeof room.host === "object"
            ? room.host?.id
            : room.host;

    const host = users.find(
        (user) => String(user.id) === String(hostId)
    );

    const isRoomHost = isAuthenticated && user && String(user.id) === String(hostId);

    // Resolve topic ID
    const topicId =
        typeof room.topic === "object"
            ? room.topic?.id
            : room.topic;

    const topic = topics.find(
        (item) => String(item.id) === String(topicId)
    );

    // Resolve message author
    const getMessageUser = (message) => {
        const messageUserId =
            typeof message.user === "object"
                ? message.user?.id
                : message.user;

        return users.find(
            (user) => String(user.id) === String(messageUserId)
        );
    };

    return (
        <main className="room-details-page">

            <div className="room-details-container">

                {/* LEFT: Browse Topics */}
                <TopicsSidebar
                    topics={topics}
                    rooms={rooms}
                    currentTopicId={topicId}
                />

                {/* MIDDLE: Main room content */}
                <div className="room-main">

                    {/* Room top navigation */}
                    <div className="room-details-header">

                        <div className="room-header-left">

                            <Link to="/" className="back-link" title="Back to Home">
                                <FaArrowLeft />
                                {/* <span>Back</span> */}
                            </Link>

                            <h2>Study Room</h2>

                        </div>

                        <div className="room-header-actions">

                            {isRoomHost && (
                                <>
                                    <Link
                                        to={`/room/${room.id}/edit`}
                                        className="room-edit-btn"
                                    >
                                        <FaEdit />
                                    </Link>

                                    <Link
                                        to={`/room/${room.id}/delete`}
                                        className="room-delete-btn"
                                    >
                                        <FaTrashAlt />
                                    </Link>
                                </>
                            )}

                        </div>

                    </div>

                    {/* Room information */}
                    <section className="room-information">

                        <div className="room-info-heading">

                            <h1>{room.name}</h1>

                            <span className="room-created">
                                {formatRelativeTime(room.created)}
                            </span>

                        </div>

                        {room.description && (
                            <p className="room-description">
                                {room.description}
                            </p>
                        )}

                        {/* Host */}
                        <div className="room-host-section">

                            <p>Hosted By</p>

                            {host ? (

                                <Link
                                    to={`/profile/${host.id}`}
                                    className="room-user"
                                >

                                    <div className="user-avatar">
                                        <img
                                            src={getImageUrl(host.avatar)}
                                            alt={`${host.username}'s avatar`}
                                        />
                                    </div>

                                    <strong>
                                        @{host.username}
                                    </strong>

                                </Link>

                            ) : (
                                <p>Host information unavailable.</p>
                            )}

                        </div>

                        {/* Topic */}
                        <div className="room-topic-section">

                            <span>
                                {topic?.name || "Unknown Topic"}
                            </span>

                        </div>

                    </section>

                    {/* Room conversation */}
                    <section className="room-conversation">

                        <h2>Room Conversation</h2>

                        {/* Messages list */}
                        <div className="room-messages-section">

                            {messages.length > 0 ? (

                                messages.map((message) => {

                                    const messageUser = getMessageUser(message);

                                    const messageUserId =
                                        typeof message.user === "object"
                                            ? message.user?.id
                                            : message.user;

                                    const canDeleteMessage =
                                        isAuthenticated &&
                                        user &&
                                        (
                                            String(user.id) === String(messageUserId) ||
                                            isRoomHost
                                        );
                                    return (

                                        <div
                                            className="room-message"
                                            key={message.id}
                                        >

                                            {/* Message header */}
                                            <div className="message-header">

                                                <Link
                                                    to={`/profile/${messageUser?.id || message.user}`}
                                                    className="room-user"
                                                >

                                                    <div className="user-avatar">
                                                        <img
                                                            src={getImageUrl(messageUser?.avatar)}
                                                            alt={`${messageUser?.username || "User"}'s avatar`}
                                                        />
                                                    </div>

                                                    <strong>
                                                        @{messageUser?.username || "Unknown User"}
                                                    </strong>

                                                </Link>

                                                <span className="message-date">
                                                    {formatRelativeTime(message.created)}
                                                </span>

                                            </div>

                                            {/* Message body */}
                                            <div className="message-content">

                                                {/* Message body and delete action */}
                                                <div className="message-content">

                                                    <p className="message-body">
                                                        {message.body}
                                                    </p>

                                                    {canDeleteMessage && (
                                                        <Link
                                                            to={`/room/${id}/messages/${message.id}/delete`}
                                                            className="message-delete-btn"
                                                        >
                                                            <FaTrashAlt />
                                                        </Link>
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    );
                                })

                            ) : (

                                <p className="messages-placeholder">
                                    No messages yet. Start the conversation!
                                </p>

                            )}

                        </div>

                        {/* Message error */}
                        {messageError && (
                            <p className="error-message">
                                {messageError}
                            </p>
                        )}

                        {/* Message form */}
                        <form
                            className="room-message-form"
                            onSubmit={handleMessageSubmit}
                        >

                            <input
                                type="text"
                                name="body"
                                placeholder="Write your message here..."
                                value={messageBody}
                                onChange={(event) =>
                                    setMessageBody(event.target.value)
                                }
                            />

                            <button
                                type="submit"
                                disabled={sending || !messageBody.trim()}
                            >
                                {sending ? "Sending..." : "Send"}
                            </button>

                        </form>

                    </section>

                </div>

                
                {/* RIGHT: Participants sidebar */}
                <RightSidebar
                    className="room-participants-section"
                    title={
                        <>
                            Participants
                            <span> {" "}({participants.length} Joined)</span>
                        </>
                    }
                >
                    <div className="room-participants-list">

                        {participants.length > 0 ? (

                            participants.map((participant) => (

                                <Link
                                    key={participant.id}
                                    to={`/profile/${participant.id}`}
                                    className="room-user"
                                >

                                    <div className="user-avatar">
                                        <img
                                            src={getImageUrl(participant.avatar)}
                                            alt={`${participant.username || "User"}'s avatar`}
                                        />
                                    </div>

                                    <div className="participant-info">

                                        <strong> {participant.name || participant.username}</strong>

                                        <span>@{participant.username}</span>

                                    </div>

                                </Link>
                            ))

                        ) : (
                            <p>No participants found.</p>
                        )}

                    </div>
                </RightSidebar>
                
            </div>

        </main>
    );
}

export default RoomDetailPage;
