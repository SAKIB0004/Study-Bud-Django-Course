
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import roomService from "../services/api/roomService";

function CreateRoomPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        topic: "",
        name: "",
        description: "",
    });

    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [loadingRoom, setLoadingRoom] = useState(isEditMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch topics and, in edit mode, the existing room
    // Fetch topics and existing room concurrently in edit mode
    useEffect(() => {
        const fetchFormData = async () => {
            try {
                if (isEditMode) {
                    const [topicsResponse, room] = await Promise.all([
                        roomService.getTopics(),
                        roomService.getRoomById(id)
                    ]);

                    setTopics(topicsResponse);

                    const topicId =
                        typeof room.topic === "object"
                            ? room.topic?.id
                            : room.topic;

                    const selectedTopic = topicsResponse.find(
                        (topic) => String(topic.id) === String(topicId)
                    );

                    setFormData({
                        topic: selectedTopic?.name || "",
                        name: room.name || "",
                        description: room.description || "",
                    });

                } else {
                    const topicsResponse = await roomService.getTopics();
                    setTopics(topicsResponse);
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

    // Handle input changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Create or update room
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const topicName = formData.topic.trim();

            if (!topicName) {
                setError("Please enter a topic.");
                return;
            }

            // Find an existing topic by name
            let selectedTopic = topics.find(
                (topic) =>
                    topic.name.toLowerCase() === topicName.toLowerCase()
            );

            // Create a new topic if it doesn't exist
            if (!selectedTopic) {
                selectedTopic = await roomService.createTopic({
                    name: topicName,
                });

                setTopics((prevTopics) => [
                    ...prevTopics,
                    selectedTopic,
                ]);
            }

            // Prepare room data using the topic ID
            const roomData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                topic: selectedTopic.id,
            };

            let savedRoom;

            if (isEditMode) {
                // Update existing room
                savedRoom = await roomService.updateRoom(id, roomData);
            } else {
                // Create new room
                savedRoom = await roomService.createRoom(roomData);
            }

            console.log(
                isEditMode ? "Room updated:" : "Room created:",
                savedRoom
            );

            navigate(isEditMode ? `/room/${id}` : "/");

        } catch (error) {
            console.error("Room submission failed:", error);

            const responseData = error.response?.data;

            setError(
                responseData?.detail ||
                responseData?.name?.[0] ||
                responseData?.topic?.[0] ||
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
                    {isEditMode ? "Update Study Room" : "Create a Study Room"}
                </h1>

                {error && (
                    <p className="error-message">{error}</p>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Topic</label>

                        <input
                            type="text"
                            name="topic"
                            list="topic-options"
                            value={formData.topic}
                            onChange={handleChange}
                            placeholder="Select or type a topic..."
                            autoComplete="off"
                            required
                        />

                        <datalist id="topic-options">
                            {topics.map((topic) => (
                                <option
                                    key={topic.id}
                                    value={topic.name}
                                />
                            ))}
                        </datalist>
                    </div>

                    <div className="form-group">
                        <label>Room Name</label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter room name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your study room"
                            required
                        />
                    </div>

                    <div className="edit-profile-actions">
                        <button
                            type="submit"
                            className="btn btn--main"
                            disabled={loading || loadingTopics}
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
                            onClick={() => navigate(isEditMode ? `/room/${id}` : "/")}
                            disabled={loading}
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
