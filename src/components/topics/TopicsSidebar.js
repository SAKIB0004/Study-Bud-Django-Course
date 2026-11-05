import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";


import TopicBrowserModal from "./TopicBrowserModal";


function TopicsSidebar({
    topics = [],
    rooms = [],
    currentTopicId = null
}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use the selected URL topic, or the current room's topic
    const selectedTopicId = searchParams.get("topic") || currentTopicId;

    // Count rooms belonging to a topic
    const getTopicRoomCount = (topicId) => {
        return rooms.filter((room) => {
            const roomTopicId =
                typeof room.topic === "object"
                    ? room.topic?.id
                    : room.topic;

            return String(roomTopicId) === String(topicId);
        }).length;
    };

    // Sort topics by the number of rooms and display the top five.
    const popularTopics = useMemo(() => {
        return [...topics]
            .sort(
                (a, b) =>
                    getTopicRoomCount(b.id) - getTopicRoomCount(a.id)
            )
            .slice(0, 5);
    }, [topics, rooms]);

    return (
        <>
            <aside className="home-topics-column">
                <h3>Browse Topics</h3>

                <div className="topics-list">
                    <button
                        type="button"
                        className={`topic-item ${
                            !selectedTopicId ? "active" : ""
                        }`}
                        onClick={() => navigate("/")}
                    >
                        <span>All Topics</span>
                        <span>{topics.length}</span>
                    </button>

                    {popularTopics.map((topic) => (
                        <button
                            type="button"
                            key={topic.id}
                            className={`topic-item ${
                                String(selectedTopicId) === String(topic.id)
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                navigate(`/?topic=${topic.id}`)
                            }
                        >
                            <span>{topic.name}</span>
                            <span>{getTopicRoomCount(topic.id)}</span>
                        </button>
                    ))}

                    {topics.length > 5 && (
                        <button
                            type="button"
                            className="topics-more"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Browse all topics
                        </button>
                    )}
                </div>
            </aside>

            <TopicBrowserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                topics={topics}
                rooms={rooms}
                selectedTopicId={selectedTopicId}
            />
        </>
    );
}

export default TopicsSidebar;
