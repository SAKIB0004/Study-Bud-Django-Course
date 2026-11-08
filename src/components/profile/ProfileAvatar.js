import getImageUrl from "../../utils/getImageUrl";
import "./ProfileAvatar.css";

function ProfileAvatar({ user, size = "large" }) {

    const avatarUrl = getImageUrl(user?.avatar);

    return (
        <div className={`profile-avatar profile-avatar--${size}`}>

            <img
                src={avatarUrl}
                alt={`${user?.username || "User"} avatar`}
                onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                        getImageUrl("/images/avatar.svg");
                }}
            />

        </div>
    );
}

export default ProfileAvatar;