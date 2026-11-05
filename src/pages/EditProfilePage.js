
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

function EditProfilePage() {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        bio: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                bio: user.bio || "",
            });
        }
    }, [user]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const updatedData = {};

            Object.keys(formData).forEach((key) => {
                if (formData[key] !== (user[key] || "")) {
                    updatedData[key] = formData[key].trim();
                }
            });

            if (Object.keys(updatedData).length === 0) {
                setError("You haven't made any changes.");
                return;
            }

            await updateProfile(updatedData);

            setSuccess("Profile updated successfully!");

            navigate("/profile", {
                replace: true,
                state: { profileUpdated: true },
            });

        } catch (error) {
            console.error("Profile update failed:", error);

            const responseData = error.response?.data;

            if (responseData && typeof responseData === "object") {
                const messages = Object.entries(responseData)
                    .map(([field, messages]) => {
                        const message = Array.isArray(messages)
                            ? messages.join(" ")
                            : messages;

                        return `${field}: ${message}`;
                    });

                setError(messages.join(" "));
            } else {
                setError("Unable to update profile. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="edit-profile-page">
            <div className="edit-profile-container">

                <div className="edit-profile-header">
                    <h1>Edit Profile</h1>
                    <p>Update your personal information.</p>
                </div>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="form-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">About</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            rows={5}
                        />
                    </div>

                    <div className="edit-profile-actions">
                        <button
                            type="button"
                            className="btn btn--dark"
                            onClick={() => navigate("/profile")}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn--main"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default EditProfilePage;
