
import AdminDropdown from "../admin/AdminDropdown";
import TopicsSidebar from "../topics/TopicsSidebar";

function LeftSidebar({ topics = [], rooms = [], currentTopicId = null }) {
    return (
        <div className="home-left-column">
            <AdminDropdown />

            <TopicsSidebar
                topics={topics}
                rooms={rooms}
                currentTopicId={currentTopicId}
            />
        </div>
    );
}

export default LeftSidebar;
