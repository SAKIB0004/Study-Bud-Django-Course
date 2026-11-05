import { Link } from "react-router-dom";
import formatRelativeTime from "../../utils/formatRelativeTime";

function RoomCard({ room, topicName, host }) {

    // Calculate the number of participants
    const participantCount = Array.isArray(room.participants)
        ? room.participants.length
        : 0;
    
    return (
        <div className="room-card">

            {/* Host and creation time */}
            <div className="room-card-header">

                <Link to={`/profile/${host?.id || room.host}/`}>
                    <strong>
                        @{host?.username || "Unknown User"}
                    </strong>
                </Link>

                <span>{formatRelativeTime(room.created)}</span>

            </div>

            {/* Room name */}
            <h3>
                <Link to={`/room/${room.id}/`}>
                    {room.name}
                </Link>
            </h3>

            {/* Participant count and topic */}
            <div className="room-card-footer">

                <Link to={`/room/${room.id}/`}>
                    {participantCount} Joined
                </Link>

                <span>{topicName}</span>

            </div>

        </div>
    );
}

export default RoomCard;