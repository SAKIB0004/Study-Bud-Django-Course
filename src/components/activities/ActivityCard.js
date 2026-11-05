
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import formatRelativeTime from "../../utils/formatRelativeTime";


function ActivityCard({ activity, author, room, currentUserId }) {
    const isOwner =
        String(currentUserId) === String(activity.user);


    return (
        <div className="activities__box">

            <div className="activities__boxHeader">

                <div className="activities__author">
                    <span>{author?.name || "unknown"}</span>
                </div>

                <div className="activities__actions">

                    <span>{formatRelativeTime(activity.created)}</span>

                    {isOwner && room && (
                        <Link
                            to={`/room/${room.id}/messages/${activity.id}/delete`}
                            className="activity-delete"
                        >
                            <FaTrashAlt />
                        </Link>
                    )}

                </div>

            </div>

            <div className="activities__boxContent">

                <p>
                    replied to a discussion in{" "}
                    {room ? (
                        <Link to={`/room/${room.id}`}>
                            {room.name}
                        </Link>
                    ) : (
                        "an unavailable room"
                    )}
                </p>

                <div className="activities__boxRoomContent">
                    {activity.body}
                </div>

            </div>

        </div>
    );
}

export default ActivityCard;
