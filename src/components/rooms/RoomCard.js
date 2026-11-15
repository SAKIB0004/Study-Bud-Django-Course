
import { Link } from "react-router-dom";
import formatRelativeTime from "../../utils/formatRelativeTime";
import ProfileAvatar from "../profile/ProfileAvatar";

function RoomCard({ room, host }) {

    // Calculate the number of participants
    const participantCount = Array.isArray(room.participants)
        ? room.participants.length
        : 0;

    // Get all topic names associated with this room
    const topicNames = Array.isArray(room.topic_names)
        ? room.topic_names
        : [];

    return (
        <div className="room-card">

            {/* Host and creation time */}
            <div className="room-card-header">

                <div className="room-card-host">

                    <Link to={`/profile/${host?.id || room.host}/`}>
                        <ProfileAvatar
                            user={host}
                            size="small"
                        />
                    </Link>

                    <Link to={`/profile/${host?.id || room.host}/`}>
                        <strong>
                            @{host?.username || "Unknown User"}
                        </strong>
                    </Link>

                </div>

                <span>{formatRelativeTime(room.created)}</span>

            </div>

            {/* Room name */}
            <h3>
                <Link to={`/room/${room.id}/`}>
                    {room.name}
                </Link>
            </h3>

            {/* Participant count and topics */}
            <div className="room-card-footer">

                <Link to={`/room/${room.id}/`}>
                    {participantCount} Joined
                </Link>

                <span>
                    {topicNames.length > 0
                        ? topicNames.join(", ")
                        : "No topics"}
                </span>

            </div>

        </div>
    );
}

export default RoomCard;
