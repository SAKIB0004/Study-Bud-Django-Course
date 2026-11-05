
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function TopicBrowserModal({
    isOpen,
    onClose,
    topics = [],
    rooms = [],
    selectedTopicId = null,
}) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const getTopicRoomCount = (topicId) => {
        return rooms.filter((room) => {
            const roomTopicId =
                typeof room.topic === "object"
                    ? room.topic?.id
                    : room.topic;

            return String(roomTopicId) === String(topicId);
        }).length;
    };

    const sortedTopics = useMemo(() => {
        return [...topics].sort((a, b) => {
            return getTopicRoomCount(b.id) - getTopicRoomCount(a.id);
        });
    }, [topics, rooms]);

    const filteredTopics = sortedTopics.filter((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="topic-modal-overlay" onClick={onClose}>
            <div
                className="topic-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="topic-modal-header">
                    <div>
                        <h2>Browse Topics</h2>
                        <p>Explore all available discussion topics.</p>
                    </div>

                    <button
                        type="button"
                        className="topic-modal-close"
                        onClick={onClose}
                        aria-label="Close topics"
                    >
                        &times;
                    </button>
                </div>

                <div className="topic-modal-search">
                    <input
                        type="text"
                        placeholder="Search topics..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />
                </div>

                <div className="topic-modal-list">
                    <button
                        type="button"
                        className={`topic-modal-item ${
                            !selectedTopicId ? "active" : ""
                        }`}
                        onClick={onClose}
                    >
                        <span>All Topics</span>
                        <span className="topic-count">{topics.length}</span>
                    </button>

                    {filteredTopics.map((topic) => (
                        <button
                            type="button"
                            key={topic.id}
                            className={`topic-modal-item ${
                                String(selectedTopicId) === String(topic.id)
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => {
                                navigate(`/?topic=${topic.id}`);
                            }}
                        >
                            <span>{topic.name}</span>
                            <span className="topic-count">
                                {getTopicRoomCount(topic.id)}
                            </span>
                        </button>
                    ))}

                    {filteredTopics.length === 0 && (
                        <p className="topic-modal-empty">
                            No topics found.
                        </p>
                    )}
                </div>

                <div className="topic-modal-footer">
                    <span>{topics.length} topics available</span>
                    <button type="button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TopicBrowserModal;
