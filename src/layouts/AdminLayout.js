
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import roomService from "../services/api/roomService";
import activityService from "../services/api/activityService";

import LeftSidebar from "../components/layout/LeftSidebar";
import RightSidebar from "../components/layout/RightSidebar";
import ActivityList from "../components/activities/ActivityList";

import useAuth from "../hooks/useAuth";

function getList(response, keys = []) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    for (const key of keys) {
        if (Array.isArray(response?.[key])) {
            return response[key];
        }
    }

    return [];
}

function AdminLayout() {
    const { user } = useAuth();

    const [rooms, setRooms] = useState([]);
    const [topics, setTopics] = useState([]);
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchSidebarData = async () => {
            try {
                setLoading(true);
                setError("");

                const results = await Promise.allSettled([
                    roomService.getRooms(),
                    roomService.getTopics(),
                    roomService.getUsers(),
                    activityService.getActivity()
                ]);

                const requiredErrors = results.slice(0, 3)
                    .filter((result) => result.status === "rejected");

                if (requiredErrors.length > 0) {
                    throw requiredErrors[0].reason;
                }

                if (!isMounted) return;

                setRooms(getList(results[0].value, ["rooms"]));
                setTopics(getList(results[1].value));
                setUsers(getList(results[2].value));

                if (results[3].status === "fulfilled") {
                    setActivities(getList(results[3].value));
                } else {
                    console.error(
                        "Failed to load admin sidebar activities:",
                        results[3].reason
                    );
                }

            } catch (err) {
                if (isMounted) {
                    setError(
                        err.response?.data?.detail ||
                        "Unable to load admin workspace."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchSidebarData();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return <p>Loading admin workspace...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="home-page-layout admin-page-layout">

            {/* LEFT: ADMIN NAVIGATION + TOPICS */}
            <LeftSidebar
                topics={topics}
                rooms={rooms}
            />

            {/* CENTER: SELECTED ADMIN PAGE */}
            <section className="home-feed-column admin-feed-column">
                <Outlet />
            </section>

            {/* RIGHT: RECENT ACTIVITIES */}
            <RightSidebar
                className="home-activity-column"
                title="Recent Activity"
            >
                <ActivityList
                    activities={activities}
                    users={users}
                    rooms={rooms}
                    currentUserId={user?.id}
                    maxItems={5}
                />
            </RightSidebar>

        </div>
    );
}

export default AdminLayout;
