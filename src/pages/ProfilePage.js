
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import userService from "../services/api/userService";
import roomService from "../services/api/roomService";
import activityService from "../services/api/activityService";

import useAuth from "../hooks/useAuth";

import TopicsSidebar from "../components/topics/TopicsSidebar";
import RightSidebar from "../components/layout/RightSidebar";
import ActivityList from "../components/activities/ActivityList";
import RoomCard from "../components/rooms/RoomCard";

function ProfilePage() {

    const navigate = useNavigate();

    const { id } = useParams();
    const { user } = useAuth();

    // Profile ID from URL or logged-in user
    const profileId = id || user?.id;

    // Profile data
    const [profile, setProfile] = useState(null);

    // All rooms and hosted rooms
    const [allRooms, setAllRooms] = useState([]);
    const [rooms, setRooms] = useState([]);

    // Sidebar data
    const [topics, setTopics] = useState([]);
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Check profile ownership
    const isOwnProfile =
        String(user?.id) === String(profileId);

    // Fetch ProfilePage data
    useEffect(() => {

        if (!profileId) return;

        let isMounted = true;

        const fetchProfileData = async () => {

            try {

                setLoading(true);
                setError("");

                // Fetch all required data
                const results = await Promise.allSettled([
                    userService.getUserById(profileId),
                    roomService.getRooms(),
                    roomService.getTopics(),
                    roomService.getUsers(),
                    activityService.getActivity()
                ]);

                // Check required API requests
                const coreErrors = results
                    .slice(0, 4)
                    .filter((result) => result.status === "rejected");

                if (coreErrors.length > 0) {
                    throw coreErrors[0].reason;
                }

                // Extract API responses
                const [
                    profileResponse,
                    roomsResponse,
                    topicsResponse,
                    usersResponse,
                    activityResponse
                ] = results.map((result) =>
                    result.status === "fulfilled"
                        ? result.value
                        : null
                );

                if (!isMounted) return;

                // Normalize rooms response
                const roomList = Array.isArray(roomsResponse)
                    ? roomsResponse
                    : roomsResponse?.results ||
                      roomsResponse?.rooms ||
                      [];

                // Normalize topics response
                const topicList = Array.isArray(topicsResponse)
                    ? topicsResponse
                    : topicsResponse?.results || [];

                // Normalize users response
                const userList = Array.isArray(usersResponse)
                    ? usersResponse
                    : usersResponse?.results || [];

                // Normalize activities response
                const activityList = Array.isArray(activityResponse)
                    ? activityResponse
                    : activityResponse?.results || [];

                // Filter activities belonging to this profile
                const userActivities = activityList.filter(
                    (activity) => {
                        const activityUserId =
                            typeof activity.user === "object"
                                ? activity.user?.id
                                : activity.user;

                        return (
                            String(activityUserId) ===
                            String(profileId)
                        );
                    }
                );

                // Filter rooms hosted by this profile
                const hostedRooms = roomList.filter((room) => {

                    const hostId =
                        typeof room.host === "object"
                            ? room.host?.id
                            : room.host;

                    return (
                        String(hostId) === String(profileId)
                    );
                });

                // Update profile and sidebar data
                setProfile(profileResponse);

                // Keep all rooms for ActivityList lookups
                setAllRooms(roomList);

                // Keep only hosted rooms for the main feed
                setRooms(hostedRooms);

                setTopics(topicList);
                setUsers(userList);
                setActivities(userActivities);

                // Activity is optional
                if (results[4].status === "rejected") {
                    console.error(
                        "Failed to fetch activities:",
                        results[4].reason
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to fetch ProfilePage data:",
                    error
                );

                if (isMounted) {
                    setError(
                        error.response?.data?.detail ||
                        "Unable to load profile. Please try again."
                    );
                }

            } finally {

                if (isMounted) {
                    setLoading(false);
                }

            }
        };

        fetchProfileData();

        return () => {
            isMounted = false;
        };

    }, [profileId]);

    // Loading state
    if (loading) {
        return <p>Loading profile...</p>;
    }

    // Error state
    if (error) {
        return <p className="error-message">{error}</p>;
    }

    // Profile not found
    if (!profile) {
        return <p>Profile not found.</p>;
    }

    return (

        <div className="home-page">

            <div className="home-page-layout">

                {/* LEFT COLUMN: TOPICS */}
                <TopicsSidebar
                    topics={topics}
                    rooms={allRooms}
                />

                {/* MIDDLE COLUMN: PROFILE */}
                <section className="home-feed-column">

                    {/* Profile information */}
                    <div className="profile">

                        <div className="profile__info">

                            <h3>
                                {profile.name || profile.username}
                            </h3>

                            <p>@{profile.username}</p>

                            {isOwnProfile && (
                                <button
                                    className="btn btn--main btn--pill"
                                    onClick={() => navigate("/profile/edit")}
                                    title="Profile editing will be implemented next."
                                >
                                    Edit Profile
                                </button>
                            )}

                        </div>

                        <div className="profile__about">

                            <h3>About</h3>

                            <p>
                                {profile.bio || "No bio available."}
                            </p>

                            {isOwnProfile && (
                                <p>Email: {profile.email}</p>
                            )}

                        </div>

                    </div>

                    {/* Hosted rooms heading */}
                    <div className="roomList__header">

                        <div>
                            <h2>
                                Study Rooms Hosted by {profile.username}
                            </h2>
                        </div>

                    </div>

                    {/* Hosted rooms */}
                    <div className="room-list">

                        {rooms.length > 0 ? (

                            rooms.map((room) => {

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
                                            selectedTopic?.name ||
                                            "Unknown Topic"
                                        }
                                        host={selectedHost || profile}
                                    />
                                );

                            })

                        ) : (

                            <p>
                                This user hasn't hosted any rooms yet.
                            </p>

                        )}

                    </div>

                </section>

                {/* RIGHT COLUMN: USER RECENT ACTIVITY */}
                <RightSidebar
                    className="home-activity-column"
                    title="Recent Activity"
                >

                    <ActivityList
                        activities={activities}
                        users={users}
                        rooms={allRooms}
                        currentUserId={user?.id}
                        maxItems={5}
                    />

                </RightSidebar>

            </div>

        </div>

    );

}

export default ProfilePage;
