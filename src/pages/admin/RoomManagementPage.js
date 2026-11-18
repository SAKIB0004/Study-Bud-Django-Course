import { useCallback, useEffect, useRef, useState } from "react";
import { FaRegCommentDots, FaFileImport } from "react-icons/fa";

import AdminPageHeader from "../../components/admin/common/AdminPageHeader";
import AdminTable from "../../components/admin/common/AdminTable";
import AdminLoading from "../../components/admin/common/AdminLoading";
import AdminEmptyState from "../../components/admin/common/AdminEmptyState";
import AdminErrorState from "../../components/admin/common/AdminErrorState";
import AdminModal from "../../components/admin/common/AdminModal";
import AdminPagination from "../../components/admin/common/AdminPagination";
import AdminFilter from "../../components/admin/common/AdminFilter";

import BulkImportModal from "../../components/admin/common/BulkImportModal";
import AdminRoomForm from "../../components/admin/rooms/AdminRoomForm";
import AdminRoomMessages from "../../components/admin/rooms/AdminRoomMessages";

import roomService from "../../services/api/roomService";

import "../../assets/styles/admin/admin-common.css";

// import { FaRegCommentDots } from "react-icons/fa";

// Normalize different possible API response formats
const getListData = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.results)) return response.data.results;

    return [];
};

function RoomManagementPage() {

    // =====================================
    // Room data
    // =====================================

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================
    // Pagination
    // =====================================

    const [limit, setLimit] = useState(25);
    const [currentBatch, setCurrentBatch] = useState(1);

    const [pagination, setPagination] = useState({
        count: 0,
        next_cursor: null,
        prev_cursor: null,
        has_more: false,
        has_prev: false,
        next_url: null,
        prev_url: null,
    });

    const requestIdRef = useRef(0);

    // =====================================
    // Room filters
    // =====================================

    // The actual room filter sent to the backend
    const [selectedRoomFilter, setSelectedRoomFilter] = useState("");

    // The selected dropdown room ID
    const [selectedRoomOption, setSelectedRoomOption] = useState("");

    const [selectedTopicOption, setSelectedTopicOption] = useState("");
    const [topicSearchInput, setTopicSearchInput] = useState("");
    const [topicSearchFilter, setTopicSearchFilter] = useState("");

    const [selectedHostOption, setSelectedHostOption] = useState("");
    const [hostSearchInput, setHostSearchInput] = useState("");
    const [hostSearchFilter, setHostSearchFilter] = useState("");

    // Complete lists for dropdown options
    const [filterRooms, setFilterRooms] = useState([]);
    const [filterTopics, setFilterTopics] = useState([]);
    const [filterUsers, setFilterUsers] = useState([]);
    
    const [roomSearchInput, setRoomSearchInput] = useState("");

    // =====================================
    // Add Room modal and form
    // =====================================

    const [showAddRoom, setShowAddRoom] = useState(false);

    const [users, setUsers] = useState([]);
    const [topics, setTopics] = useState([]);

    const [roomName, setRoomName] = useState("");
    const [description, setDescription] = useState("");

    const [selectedHost, setSelectedHost] = useState("");
    const [selectedTopics, setSelectedTopics] = useState([]);

    const [formLoading, setFormLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [addingTopic, setAddingTopic] = useState(false);
    const [formError, setFormError] = useState("");

    // =====================================
    // Messages modal
    // =====================================

    const [showMessages, setShowMessages] = useState(false);
    const [selectedRoomForMessages, setSelectedRoomForMessages] =
        useState(null);

    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState("");

    // =====================================
    // Bulk Room Import
    // =====================================

    const [showBulkImport, setShowBulkImport] = useState(false);

    // =====================================
    // Dropdown options
    // =====================================

    // Use unique room IDs as dropdown values
    const uniqueRooms = Array.from(
        new Map(
            filterRooms.map((room) => [String(room.id), room])
        ).values()
    );

    const roomOptions = [
        {
            value: "",
            label: "All Rooms",
            searchText: "all rooms",
        },

        ...uniqueRooms.map((room) => ({
            value: String(room.id),
            label: room.name || `Room ${room.id}`,

            searchText: [
                room.name,
                room.host_name,
                room.host?.name,
                room.host?.username,
                ...(room.topic_names || []),
                ...(room.topics || []).map((topic) => topic.name),
                room.description,
            ]
                .filter(Boolean)
                .join(" "),
        })),
    ];

    const topicOptions = [
        {
            value: "",
            label: "All Topics",
        },

        ...filterTopics.map((topic) => ({
            value: String(topic.id),
            label: topic.name,
        })),
    ];

    const hostOptions = [
        {
            value: "",
            label: "All Hosts",
        },

        ...filterUsers.map((user) => ({
            value: String(user.id),
            label:
                user.name ||
                user.username ||
                user.email ||
                `User ${user.id}`,
        })),
    ];
    const handleTopicSelect = (topicId) => {
        setSelectedTopicOption(topicId);

        if (!topicId) {
            setTopicSearchInput("");
            setTopicSearchFilter("");
            return;
        }

        const selectedTopicItem = filterTopics.find(
            (topic) => String(topic.id) === String(topicId)
        );

        if (selectedTopicItem) {
            setTopicSearchInput(selectedTopicItem.name);
            setTopicSearchFilter(selectedTopicItem.name);
        }
    };

    const handleTopicSearch = (searchValue) => {
        const query = searchValue.trim();

        setSelectedTopicOption("");
        setTopicSearchInput(query);
        setTopicSearchFilter(query);
    };

    const handleHostSelect = (hostId) => {
        setSelectedHostOption(hostId);

        if (!hostId) {
            setHostSearchInput("");
            setHostSearchFilter("");
            return;
        }

        const selectedHostItem = filterUsers.find(
            (user) => String(user.id) === String(hostId)
        );

        if (selectedHostItem) {
            const hostName =
                selectedHostItem.name ||
                selectedHostItem.username ||
                selectedHostItem.email ||
                `User ${selectedHostItem.id}`;

            setHostSearchInput(hostName);
            setHostSearchFilter(hostName);
        }
    };

    const handleHostSearch = (searchValue) => {
        const query = searchValue.trim();

        setSelectedHostOption("");
        setHostSearchInput(query);
        setHostSearchFilter(query);
    };


    // =====================================
    // Fetch rooms
    // =====================================


    const fetchRooms = useCallback(async (cursor = null, batch = 1) => {

        const requestId = ++requestIdRef.current;

        try {

            setLoading(true);
            setError("");

            const filters = {
                room: selectedRoomFilter,
                topic: topicSearchFilter,
                host: hostSearchFilter,
            };

            console.log("Admin room filters:", filters);

            const response = await roomService.getAdminRooms(
                limit,
                cursor,
                filters
            );

            // Ignore outdated requests
            if (requestId !== requestIdRef.current) return;

            console.log("Admin room API response:", response);

            setRooms(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );

            setPagination(
                response?.pagination || {}
            );

            setCurrentBatch(batch);

        } catch (error) {

            console.error("Failed to fetch rooms:", error);

            if (requestId === requestIdRef.current) {
                setError(
                    error.response?.data?.detail ||
                    "Failed to load rooms."
                );
            }

        } finally {

            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }

    }, [
        limit,
        selectedRoomFilter,
        topicSearchFilter,
        hostSearchFilter,
    ]);

    // =====================================
    // Refresh rooms after bulk import
    // =====================================

    const handleRefreshRooms = async () => {
        // Refresh the room table
        await fetchRooms(null, 1);

        // Refresh Room dropdown options
        try {
            const roomsResponse = await roomService.getRooms();
            setFilterRooms(getListData(roomsResponse));
        } catch (error) {
            console.error(
                "Failed to refresh room dropdown options:",
                error
            );
        }
    };

    // Fetch first page whenever filters or page size change
    useEffect(() => {

        fetchRooms(null, 1);

        return () => {
            requestIdRef.current += 1;
        };

    }, [fetchRooms]);

    // =====================================
    // Load filter dropdown options
    // =====================================

    useEffect(() => {

        let isActive = true;

        const loadFilterOptions = async () => {

            try {

                const [
                    roomsResponse,
                    usersResponse,
                    topicsResponse,
                ] = await Promise.all([
                    roomService.getRooms(),
                    roomService.getUsers(),
                    roomService.getTopics(),
                ]);

                if (!isActive) return;

                setFilterRooms(getListData(roomsResponse));
                setFilterUsers(getListData(usersResponse));
                setFilterTopics(getListData(topicsResponse));

            } catch (error) {

                console.error(
                    "Failed to load room filter options:",
                    error
                );
            }
        };

        loadFilterOptions();

        return () => {
            isActive = false;
        };

    }, []);

    // =====================================
    // Handle Room dropdown selection
    // =====================================

    const handleRoomSelect = (roomId) => {

        setSelectedRoomOption(roomId);

        if (!roomId) {
            setSelectedRoomFilter("");
            setRoomSearchInput("");
            return;
        }

        const selectedRoom = uniqueRooms.find(
            (room) => String(room.id) === String(roomId)
        );

        if (selectedRoom) {
            setSelectedRoomFilter(selectedRoom.name);
            setRoomSearchInput(selectedRoom.name);
        }
    };

    // =====================================
    // Handle Room backend search
    // =====================================

    const handleRoomSearch = (searchValue) => {

        const query = searchValue.trim();

        // This is a text search, not a dropdown selection
        setRoomSearchInput(query);   
        setSelectedRoomOption("");

        // Backend receives room=django, for example
        setSelectedRoomFilter(query);
    };

    // =====================================
    // Clear filters
    // =====================================

    const handleClearFilters = () => {
        setSelectedRoomFilter("");
        setSelectedRoomOption("");
        setRoomSearchInput("");

        setSelectedTopicOption("");
        setTopicSearchInput("");
        setTopicSearchFilter("");

        // setSelectedHostFilter("");
        setSelectedHostOption("");
        setHostSearchInput("");
        setHostSearchFilter("");
    };

    const hasActiveFilters = Boolean(
        selectedRoomFilter ||
        selectedRoomOption ||
        topicSearchFilter ||
        selectedTopicOption ||
        hostSearchFilter ||
        selectedHostOption
    );

    // =====================================
    // Pagination handlers
    // =====================================

    const handleNext = () => {

        if (!pagination.next_cursor || loading) return;

        fetchRooms(
            pagination.next_cursor,
            currentBatch + 1
        );
    };

    const handlePrevious = () => {

        if (!pagination.prev_cursor || loading) return;

        fetchRooms(
            pagination.prev_cursor,
            Math.max(1, currentBatch - 1)
        );
    };

    const handleLimitChange = (newLimit) => {

        setLimit(Number(newLimit));
        setCurrentBatch(1);
    };

    // =====================================
    // Load Add Room form data
    // =====================================

    useEffect(() => {

        if (!showAddRoom) return;

        let isActive = true;

        const fetchFormData = async () => {

            try {

                setFormLoading(true);
                setFormError("");

                const [usersResponse, topicsResponse] =
                    await Promise.all([
                        roomService.getUsers(),
                        roomService.getTopics(),
                    ]);

                const usersData = getListData(usersResponse);
                const topicsData = getListData(topicsResponse);

                if (isActive) {

                    setUsers(
                        usersData.filter((user) => user.is_active)
                    );

                    setTopics(topicsData);
                }

            } catch (error) {

                console.error(
                    "Failed to load room form data:",
                    error
                );

                if (isActive) {
                    setFormError(
                        error.response?.data?.detail ||
                        "Failed to load users and topics."
                    );
                }

            } finally {

                if (isActive) {
                    setFormLoading(false);
                }
            }
        };

        fetchFormData();

        return () => {
            isActive = false;
        };

    }, [showAddRoom]);

    // =====================================
    // Create topic
    // =====================================

    const handleCreateTopic = async (topicName) => {

        try {

            setAddingTopic(true);
            setFormError("");

            const createdTopic = await roomService.createTopic({
                name: topicName,
            });

            setTopics((previousTopics) => [
                ...previousTopics,
                createdTopic,
            ]);

            // Update Topic filter dropdown too
            setFilterTopics((previousTopics) => [
                ...previousTopics,
                createdTopic,
            ]);

            return createdTopic;

        } catch (error) {

            console.error("Failed to create topic:", error);

            const responseData = error.response?.data;

            setFormError(
                responseData?.detail ||
                responseData?.name?.[0] ||
                "Unable to create topic."
            );

            return null;

        } finally {

            setAddingTopic(false);
        }
    };

    // =====================================
    // Reset room form
    // =====================================

    const resetRoomForm = () => {

        setRoomName("");
        setDescription("");
        setSelectedHost("");
        setSelectedTopics([]);
        setFormError("");
    };

    const handleCloseAddRoom = () => {

        if (submitting) return;

        setShowAddRoom(false);
        resetRoomForm();
    };

    // =====================================
    // Create room
    // =====================================

    const handleAddRoom = async (event) => {

        event.preventDefault();

        if (
            !roomName.trim() ||
            !selectedHost ||
            selectedTopics.length === 0
        ) {

            setFormError("Please complete all required fields.");
            return;
        }

        const roomData = {
            name: roomName.trim(),
            description: description.trim(),
            host: Number(selectedHost),
            topics: selectedTopics.map(Number),
        };

        try {

            setSubmitting(true);
            setFormError("");

            await roomService.createAdminRoom(roomData);

            resetRoomForm();
            setShowAddRoom(false);

            // Refresh room table
            await fetchRooms(null, 1);

            // Refresh Room dropdown options
            const roomsResponse = await roomService.getRooms();

            setFilterRooms(getListData(roomsResponse));

        } catch (error) {

            console.error("Failed to create room:", error);

            const errorData = error.response?.data;

            if (typeof errorData === "string") {

                setFormError(errorData);

            } else if (
                errorData &&
                typeof errorData === "object"
            ) {

                const errorMessages = Object.values(errorData)
                    .flat()
                    .join(" ");

                setFormError(
                    errorMessages || "Failed to create room."
                );

            } else {

                setFormError("Something went wrong. Please try again.");
            }

        } finally {

            setSubmitting(false);
        }
    };

    // =====================================
    // View room messages
    // =====================================

    const handleViewMessages = (room) => {

        setSelectedRoomForMessages(room);
        setMessages(room.messages || []);
        setMessagesError("");
        setMessagesLoading(false);
        setShowMessages(true);
    };

    const handleCloseMessages = () => {

        setShowMessages(false);
        setSelectedRoomForMessages(null);
        setMessages([]);
        setMessagesError("");
    };

    // =====================================
    // Row numbering
    // =====================================

    const firstRow = rooms.length > 0
        ? (currentBatch - 1) * limit + 1
        : 0;

    // =====================================
    // Table columns
    // =====================================

    const roomColumns = [

        {
            key: "serial",
            label: "SL",
            render: (room, index) => firstRow + index,
        },

        {
            key: "name",
            label: "Room",
        },

        {
            key: "topic_name",
            label: "Topic",
            render: (room) =>
                room.topic_names?.join(", ") || "No topic",
        },

        {
            key: "host_name",
            label: "Host",
            render: (room) => room.host_name || "No host",
        },

        {
            key: "participants_count",
            label: "Participant Count",
        },

        {
            key: "participant_details",
            label: "Participants",

            render: (room) => {

                const participants = room.participant_details || [];

                if (participants.length === 0) {
                    return "No participants";
                }

                const visibleNames = participants
                    .slice(0, 3)
                    .map((user) => user.username);

                const remaining =
                    participants.length - visibleNames.length;

                return (
                    <span
                        title={participants
                            .map((user) => user.username)
                            .join(", ")}
                    >
                        {visibleNames.join(", ")}
                        {remaining > 0 && ` +${remaining}`}
                    </span>
                );
            },
        },

        {
            key: "messages_count",
            label: "Messages",

            render: (room) => (

                <button
                    type="button"
                    className="admin-message-icon-btn"
                    onClick={() => handleViewMessages(room)}
                    aria-label={`View ${room.messages_count} messages`}
                    title="View messages"
                >
                    <FaRegCommentDots />

                    {room.messages_count > 0 && (
                        <span className="admin-message-count">
                            {room.messages_count}
                        </span>
                    )}

                </button>
            ),
        },
    ];

    // =====================================
    // Render
    // =====================================

    return (

        <div className="admin-section-page">

            <AdminPageHeader
                title="Room Management"
                description="Manage all StudyBuddy rooms."
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    {
                        label: "Administration",
                        to: "/admin/dashboard",
                    },
                    { label: "Room Management" },
                ]}
                actions={[
                    {
                        label: "Import Rooms",
                        className: "admin-btn-secondary",
                        onClick: () => setShowBulkImport(true),
                        icon: <FaFileImport />,
                    },
                    {
                        label: "Add Room",
                        className: "admin-btn-primary",
                        onClick: () => setShowAddRoom(true),
                        icon: <span>+</span>,
                    },
                ]}
            />

            <div className="admin-section-content">

                

                {/* Searchable filters */}

                <div className="admin-filters">

                    {/* Room dropdown + backend search */}

                    <AdminFilter
                        label="Room"
                        value={selectedRoomOption}
                        displayValue={roomSearchInput}
                        emptyLabel="All Rooms"
                        onChange={handleRoomSelect}
                        options={roomOptions}
                        searchPlaceholder="Search rooms..."
                        onSearch={handleRoomSearch}
                    />

                    {/* Topic dropdown */}

                    <AdminFilter
                        label="Topic"
                        value={selectedTopicOption}
                        displayValue={topicSearchInput}
                        emptyLabel="All Topics"
                        onChange={handleTopicSelect}
                        options={topicOptions}
                        searchPlaceholder="Search topics..."
                        onSearch={handleTopicSearch}
                    />

                    {/* Host dropdown */}

                    <AdminFilter
                        label="Host"
                        value={selectedHostOption}
                        displayValue={hostSearchInput}
                        emptyLabel="All Hosts"
                        onChange={handleHostSelect}
                        options={hostOptions}
                        searchPlaceholder="Search hosts..."
                        onSearch={handleHostSearch}
                    />

                    {/* Clear filters */}

                    <button
                        type="button"
                        className="admin-clear-filters"
                        onClick={handleClearFilters}
                        disabled={!hasActiveFilters}
                    >
                        Clear filters
                    </button>

                </div>

                {/* Room count */}

                <div className="admin-room-count">
                    <p>Total Rooms: {pagination.count ?? 0}</p>
                </div>

                {/* Room table */}

                {loading ? (

                    <AdminLoading message="Loading rooms..." />

                ) : error ? (

                    <AdminErrorState
                        message={error}
                        onRetry={() => fetchRooms(null, 1)}
                    />

                ) : rooms.length === 0 ? (

                    <AdminEmptyState
                        title={
                            hasActiveFilters
                                ? "No matching rooms found"
                                : "No rooms found"
                        }
                        message={
                            hasActiveFilters
                                ? "Try changing your filters."
                                : "There are currently no rooms to display."
                        }
                        action={
                            hasActiveFilters
                                ? handleClearFilters
                                : () => setShowAddRoom(true)
                        }
                        actionLabel={
                            hasActiveFilters
                                ? "Clear filters"
                                : "Create Room"
                        }
                    />

                ) : (

                    <AdminTable
                        columns={roomColumns}
                        data={rooms}
                        emptyMessage="No rooms available."
                    />

                )}

            </div>

            {/* Pagination */}

            <AdminPagination
                pageSize={limit}
                onPageSizeChange={handleLimitChange}
                hasPrevious={pagination.has_prev}
                hasNext={pagination.has_more}
                onPrevious={handlePrevious}
                onNext={handleNext}
                loading={loading}
            />

            {/* Messages Modal */}

            <AdminModal
                isOpen={
                    showMessages &&
                    Boolean(selectedRoomForMessages)
                }
                onClose={handleCloseMessages}
                title={`${selectedRoomForMessages?.name || "Room"} - Messages`}
            >

                <p>{messages.length} messages</p>

                <AdminRoomMessages
                    messages={messages}
                    loading={messagesLoading}
                    error={messagesError}
                />

            </AdminModal>

            {/* Add Room Modal */}

            <AdminModal
                isOpen={showAddRoom}
                onClose={handleCloseAddRoom}
                title="Add New Room"
                closeDisabled={submitting}
            >

                <AdminRoomForm
                    roomName={roomName}
                    setRoomName={setRoomName}
                    description={description}
                    setDescription={setDescription}
                    users={users}
                    topics={topics}
                    selectedHost={selectedHost}
                    setSelectedHost={setSelectedHost}
                    selectedTopics={selectedTopics}
                    setSelectedTopics={setSelectedTopics}
                    onCreateTopic={handleCreateTopic}
                    formLoading={formLoading}
                    submitting={submitting}
                    addingTopic={addingTopic}
                    formError={formError}
                    onSubmit={handleAddRoom}
                    onCancel={handleCloseAddRoom}
                />

            </AdminModal>

            {/* Bulk Room Import Modal */}

            {showBulkImport && (
                <BulkImportModal
                    entity="rooms"
                    onClose={() => setShowBulkImport(false)}
                    onSuccess={handleRefreshRooms}
                />
            )}

        </div>
    );
}

export default RoomManagementPage;
