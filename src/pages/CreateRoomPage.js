import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import roomService from "../services/api/roomService";

function CreateRoomPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [topics, setTopics] = useState([]);
    const [selectedTopicIds, setSelectedTopicIds] = useState([]);
    const [newTopicName, setNewTopicName] = useState("");

    const [loadingTopics, setLoadingTopics] = useState(true);
    const [loadingRoom, setLoadingRoom] = useState(isEditMode);
    const [loading, setLoading] = useState(false);
    const [addingTopic, setAddingTopic] = useState(false);

    const [topicQuery, setTopicQuery] = useState("");
    const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);

    const topicFieldRef = useRef(null);

    const [error, setError] = useState("");

    // Fetch topics and existing room details in edit mode
    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const topicsResponse = await roomService.getTopics();

                setTopics(topicsResponse);

                if (isEditMode) {
                    const room = await roomService.getRoomById(id);

                    const topicIds = (room.topics || []).map((topic) =>
                        typeof topic === "object" ? topic.id : topic
                    );

                    setSelectedTopicIds(topicIds.map(String));

                    setFormData({
                        name: room.name || "",
                        description: room.description || "",
                    });
                }
            } catch (error) {
                console.error("Failed to load form data:", error);

                setError(
                    isEditMode
                        ? "Unable to load room details."
                        : "Unable to load topics."
                );
            } finally {
                setLoadingTopics(false);
                setLoadingRoom(false);
            }
        };

        fetchFormData();
    }, [id, isEditMode]);

    // Handle room input changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                topicFieldRef.current &&
                !topicFieldRef.current.contains(event.target)
            ) {
                setIsTopicDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Get selected topic objects
    const selectedTopics = topics.filter((topic) =>
        selectedTopicIds.includes(String(topic.id))
    );

    // Filter topics based on search input
    const filteredTopics = topics.filter((topic) =>
        topic.name.toLowerCase().includes(topicQuery.trim().toLowerCase())
    );

    // Add or remove a topic from selection
    const toggleTopic = (topicId) => {
        const topicIdString = String(topicId);

        setSelectedTopicIds((prevIds) =>
            prevIds.includes(topicIdString)
                ? prevIds.filter((id) => id !== topicIdString)
                : [...prevIds, topicIdString]
        );
    };

    // Remove selected topic
    const removeTopic = (topicId) => {
        setSelectedTopicIds((prevIds) =>
            prevIds.filter((id) => id !== String(topicId))
        );
    };

    // Create a new topic and select it automatically
    const handleAddTopic = async () => {
        const topicName = topicQuery.trim();

        if (!topicName) return;

        // Check whether the topic already exists
        const existingTopic = topics.find(
            (topic) =>
                topic.name.toLowerCase() === topicName.toLowerCase()
        );

        if (existingTopic) {
            setSelectedTopicIds((prevIds) =>
                prevIds.includes(String(existingTopic.id))
                    ? prevIds
                    : [...prevIds, String(existingTopic.id)]
            );

            setTopicQuery("");
            return;
        }

        setAddingTopic(true);
        setError("");

        try {
            const createdTopic = await roomService.createTopic({
                name: topicName,
            });

            setTopics((prevTopics) => [
                ...prevTopics,
                createdTopic,
            ]);

            setSelectedTopicIds((prevIds) => [
                ...prevIds,
                String(createdTopic.id),
            ]);

            setTopicQuery("");
        } catch (error) {
            console.error(
                "Failed to create topic:",
                error.response?.data
            );

            const responseData = error.response?.data;

            setError(
                responseData?.detail ||
                responseData?.name?.[0] ||
                "Unable to create topic."
            );
        } finally {
            setAddingTopic(false);
        }
    };

    // Create or update room
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!formData.name.trim()) {
            setError("Please enter a room name.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Please enter a room description.");
            return;
        }

        if (selectedTopicIds.length === 0) {
            setError("Please select at least one topic.");
            return;
        }

        setLoading(true);

        try {
            const roomData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                topics: selectedTopicIds.map(Number),
            };

            let savedRoom;

            if (isEditMode) {
                savedRoom = await roomService.updateRoom(id, roomData);
            } else {
                savedRoom = await roomService.createRoom(roomData);
            }

            console.log(
                isEditMode ? "Room updated:" : "Room created:",
                savedRoom
            );

            navigate(isEditMode ? `/room/${id}` : "/");
        } catch (error) {
            const responseData = error.response?.data;

            console.error("Room submission failed:", responseData);

            setError(
                responseData?.detail ||
                responseData?.name?.[0] ||
                responseData?.topics?.[0] ||
                responseData?.description?.[0] ||
                responseData?.non_field_errors?.[0] ||
                "Failed to save room."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingTopics || loadingRoom) {
        return <p>Loading room form...</p>;
    }

    return (
        <div className="create-room-page">
            <div className="create-room-card">

                <h1>
                    {isEditMode
                        ? "Update Study Room"
                        : "Create a Study Room"}
                </h1>

                {error && (
                    <p className="error-message">{error}</p>
                )}

                {/* IMPORTANT: Form starts here */}
                <form onSubmit={handleSubmit}>

                    {/* Multiple Topic Selection */}
                    <div className="form-group">
                        <label>Topics</label>

                        <div
                            className="topic-select-container"
                            ref={topicFieldRef}
                        >
                            <div
                                className={`topic-select-field ${
                                    isTopicDropdownOpen ? "active" : ""
                                }`}
                                onClick={() =>
                                    setIsTopicDropdownOpen(true)
                                }
                            >
                                <div className="selected-topic-list">

                                    {selectedTopics.map((topic) => (
                                        <span
                                            className="selected-topic-chip"
                                            key={topic.id}
                                        >
                                            {topic.name}

                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    removeTopic(topic.id);
                                                }}
                                                aria-label={`Remove ${topic.name}`}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}

                                    <input
                                        type="text"
                                        value={topicQuery}
                                        onFocus={() =>
                                            setIsTopicDropdownOpen(true)
                                        }
                                        onChange={(event) => {
                                            setTopicQuery(event.target.value);
                                            setIsTopicDropdownOpen(true);
                                        }}
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        placeholder={
                                            selectedTopics.length
                                                ? "Add another topic..."
                                                : "Select or create topics..."
                                        }
                                        disabled={addingTopic || loading}
                                    />
                                </div>

                                <span className="topic-dropdown-arrow">
                                    {isTopicDropdownOpen ? "▲" : "▼"}
                                </span>
                            </div>

                            {isTopicDropdownOpen && (
                                <div className="topic-dropdown">

                                    {filteredTopics.length > 0 ? (
                                        filteredTopics.map((topic) => {
                                            const isSelected =
                                                selectedTopicIds.includes(
                                                    String(topic.id)
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    key={topic.id}
                                                    className={`topic-dropdown-option ${
                                                        isSelected
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        toggleTopic(topic.id)
                                                    }
                                                >
                                                    <span>{topic.name}</span>

                                                    {isSelected && (
                                                        <span>✓</span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <p className="topic-no-results">
                                            No matching topics found.
                                        </p>
                                    )}

                                    {topicQuery.trim() &&
                                        !topics.some(
                                            (topic) =>
                                                topic.name.toLowerCase() ===
                                                topicQuery.trim().toLowerCase()
                                        ) && (
                                            <button
                                                type="button"
                                                className="topic-create-option"
                                                onClick={handleAddTopic}
                                                disabled={addingTopic}
                                            >
                                                {addingTopic
                                                    ? "Creating topic..."
                                                    : `+ Create "${topicQuery.trim()}"`}
                                            </button>
                                        )}
                                </div>
                            )}
                        </div>

                        <small>
                            Select multiple topics or type to create a new one.
                            Click × to remove a selected topic.
                        </small>
                    </div>

                    {/* Room Name */}
                    <div className="form-group">
                        <label htmlFor="name">
                            Room Name
                        </label>

                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter room name"
                            required
                        />
                    </div>

                    {/* Room Description */}
                    <div className="form-group">
                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your study room"
                            required
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="edit-profile-actions">

                        <button
                            type="submit"
                            className="btn btn--main"
                            disabled={
                                loading ||
                                addingTopic ||
                                selectedTopicIds.length === 0
                            }
                        >
                            {loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Room"
                                    : "Create Room"}
                        </button>

                        <button
                            type="button"
                            className="btn btn--dark"
                            onClick={() =>
                                navigate(
                                    isEditMode ? `/room/${id}` : "/"
                                )
                            }
                            disabled={loading || addingTopic}
                        >
                            Cancel
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default CreateRoomPage;
