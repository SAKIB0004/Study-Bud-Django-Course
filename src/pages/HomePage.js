import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import roomService from "../services/api/roomService";
import activityService from "../services/api/activityService";

import RoomCard from "../components/rooms/RoomCard";
import ActivityList from "../components/activities/ActivityList";
import TopicsSidebar from "../components/topics/TopicsSidebar";
import RightSidebar from "../components/layout/RightSidebar";

import useAuth from "../hooks/useAuth";

function HomePage() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const selectedTopicId = searchParams.get("topic");
    const { user } = useAuth();

    // Stores rooms, users, and topics received from Django
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [topics, setTopics] = useState([]);
    const [activities, setActivities] = useState([]);

    // Tracks whether the API request is running
    const [loading, setLoading] = useState(true);

    // Stores API errors
    const [error, setError] = useState("");

    // Search query state
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRooms = rooms.filter((room) => {
        const search = searchTerm.toLowerCase();

        const roomName = room.name?.toLowerCase() || "";
        const description = room.description?.toLowerCase() || "";

        // Handle both topic ID and nested topic object
        const roomTopicId =
            typeof room.topic === "object"
                ? room.topic?.id
                : room.topic;

        // Find the topic name
        const selectedTopic = topics.find(
            (topic) => String(topic.id) === String(roomTopicId)
        );

        const topicName = selectedTopic?.name?.toLowerCase() || "";

        // Search matching
        const matchesSearch =
            roomName.includes(search) ||
            description.includes(search) ||
            topicName.includes(search);

        // Topic matching
        const matchesTopic =
            !selectedTopicId ||
            String(roomTopicId) === String(selectedTopicId);

        return matchesSearch && matchesTopic;
    });

    // Fetch HomePage data
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                setError("");

                const results = await Promise.allSettled([
                    roomService.getRooms(),
                    roomService.getTopics(),
                    roomService.getUsers(),
                    activityService.getActivity()
                ]);

                // Rooms, topics and users are required for the HomePage
                const coreErrors = results.slice(0, 3)
                    .filter((result) => result.status === "rejected");

                if (coreErrors.length > 0) {
                    throw coreErrors[0].reason;
                }

                const [
                    roomsResponse,
                    topicsResponse,
                    usersResponse,
                    activityResponse
                ] = results.map((result) =>
                    result.status === "fulfilled" ? result.value : null
                );

                // Support normal and paginated DRF responses
                const roomList = Array.isArray(roomsResponse)
                    ? roomsResponse
                    : roomsResponse.results || roomsResponse.rooms || [];

                const topicList = Array.isArray(topicsResponse)
                    ? topicsResponse
                    : topicsResponse.results || [];

                const userList = Array.isArray(usersResponse)
                    ? usersResponse
                    : usersResponse.results || [];

                const activityList = Array.isArray(activityResponse)
                    ? activityResponse
                    : activityResponse?.results || [];

                setRooms(roomList);
                setTopics(topicList);
                setUsers(userList);
                setActivities(activityList);

                if (results[3].status === "rejected") {
                    console.error(
                        "Failed to fetch activities:",
                        results[3].reason
                    );
                }

            } catch (error) {
                console.error("Failed to fetch HomePage data:", error);

                setError(
                    error.response?.data?.detail ||
                    "Unable to load rooms. Please try again."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    // Loading state
    if (loading) {
        return <p>Loading rooms...</p>;
    }

    // Error state
    if (error) {
        return <p className="error-message">{error}</p>;
    }

    // Display rooms
    
    return (
        <div className="home-page">

            <div className="home-page-layout">

                {/* LEFT COLUMN: TOPICS */}
                <TopicsSidebar topics={topics} rooms={rooms}/>


                {/* MIDDLE COLUMN: ROOM FEED */}
                <section className="home-feed-column">

                    <div className="home-header">

                        <h1>Study Rooms</h1>

                        <button onClick={() => navigate("/create-room")}>
                            + Create Room
                        </button>

                    </div>

                    <div className="room-search">

                        <input
                            type="text"
                            placeholder="Search rooms by name, description or topic..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />

                    </div>

                    <div className="room-list">

                        {filteredRooms.length > 0 ? (

                            filteredRooms.map((room) => {

                                const topicId =
                                    typeof room.topic === "object"
                                        ? room.topic?.id
                                        : room.topic;

                                const hostId =
                                    typeof room.host === "object"
                                        ? room.host?.id
                                        : room.host;

                                const selectedTopic = topics.find(
                                    (topic) =>
                                        String(topic.id) === String(topicId)
                                );

                                const selectedHost = users.find(
                                    (user) =>
                                        String(user.id) === String(hostId)
                                );

                                return (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        topicName={
                                            selectedTopic?.name || "Unknown Topic"
                                        }
                                        host={selectedHost}
                                    />
                                );
                            })

                        ) : (

                            <p>
                                {rooms.length === 0
                                    ? "No rooms available yet."
                                    : selectedTopicId
                                        ? "No rooms found for this topic."
                                        : "No matching rooms found."}
                            </p>

                        )}

                    </div>

                </section>
                
                {/* RIGHT COLUMN: RECENT ACTIVITY */}
                <RightSidebar className="home-activity-column" title="Recent Activity">
                    <ActivityList
                        activities={activities}
                        users={users}
                        rooms={rooms}
                        currentUserId={user?.id}
                        maxItems={5}
                    />

                    {/* <button className="activity-more" onClick={() => navigate("/activity")}>
                        See All Activity
                    </button> */}
                </RightSidebar>


            </div>

        </div>
    );

}

export default HomePage;