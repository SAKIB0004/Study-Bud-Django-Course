
import ActivityCard from "./ActivityCard";

function ActivityList({
    activities = [],
    users = [],
    rooms = [],
    currentUserId,
    // compact = false,
    maxItems
}) {
    // Show only a limited number of activities when requested
    const displayedActivities = maxItems
        ? activities.slice(0, maxItems)
        : activities;

    if (displayedActivities.length === 0) {
        return <p>No recent activity.</p>;
    }

    return (
        <div className="activities">

            {displayedActivities.map((activity) => {

                // Resolve user ID into user object
                const author = users.find(
                    (user) =>
                        String(user.id) === String(activity.user)
                );

                // Resolve room ID into room object
                const room = rooms.find(
                    (room) =>
                        String(room.id) === String(activity.room)
                );

                return (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        author={author}
                        room={room}
                        currentUserId={currentUserId}
                        // compact={compact}
                    />
                );
            })}

        </div>
    );
}

export default ActivityList;
