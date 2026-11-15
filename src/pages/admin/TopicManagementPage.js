
import { useEffect, useState } from "react";

import AdminPageHeader from "../../components/admin/common/AdminPageHeader";
import AdminTable from "../../components/admin/common/AdminTable";
import roomService from "../../services/api/roomService";

import "../../assets/styles/admin/admin-common.css";

function TopicManagementPage() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAddTopic, setShowAddTopic] = useState(false);

    useEffect(() => {
        let isActive = true;

        const fetchTopics = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await roomService.getTopics();

                const data = Array.isArray(response)
                    ? response
                    : response?.results || [];

                if (isActive) {
                    setTopics(data);
                }
            } catch (error) {
                console.error("Failed to fetch topics:", error);

                if (isActive) {
                    setError(
                        error.response?.data?.detail ||
                        "Failed to load topics."
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchTopics();

        return () => {
            isActive = false;
        };
    }, []);

    const topicColumns = [
        { key: "serial", label: "SL", render: (room, index) => index + 1 },
        { key: "name", label: "Topic Name" },
        {
            key: "hosts",
            label: "Hosts",
            render: (topic) =>
                topic.hosts?.length
                    ? topic.hosts.map((host) => host.name).join(", ")
                    : "No hosts",
        },
    ];

    return (
        <div className="admin-section-page">
            <AdminPageHeader
                title="Topic Management"
                description="Manage all StudyBuddy topics."
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    { label: "Administration", to: "/admin/dashboard" },
                    { label: "Topic Management" },
                ]}
                actions={[
                    {
                        label: "Add Topic",
                        className: "admin-btn-primary",
                        onClick: () => setShowAddTopic(true),
                        icon: <span>+</span>,
                    },
                ]}
            />

            <div className="admin-section-content">
                {loading ? (
                    <p>Loading topics...</p>
                ) : error ? (
                    <p className="admin-error">{error}</p>
                ) : (
                    <AdminTable
                        columns={topicColumns}
                        data={topics}
                        emptyMessage="No topics available."
                    />
                )}
            </div>

            {showAddTopic && (
                <div className="admin-modal-backdrop">
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-topic-title"
                    >
                        <h2 id="add-topic-title">Add Topic</h2>
                        <p>Topic creation form will be added next.</p>

                        <button
                            type="button"
                            onClick={() => setShowAddTopic(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TopicManagementPage;
