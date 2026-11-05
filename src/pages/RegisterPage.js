import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../components/common/Input";
import Button from "../components/common/Button";

import useAuth from "../hooks/useAuth";


function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        if(formData.password !== formData.confirmPassword){
            setError("Passwords do not match.");
            return;
        }

        setError("");
        setLoading(true);

        try {

            const { confirmPassword, ...userData } = formData;

            await register(userData);

            navigate("/login", {
                replace: true,
                state: {
                    registered: true
                }
            });

        } catch (error) {

            const responseData = error.response?.data;

            if (responseData && typeof responseData === "object") {
                const firstError = Object.values(responseData)[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : "Registration failed."
                );
            } else {
                setError("Registration failed. Please try again.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">

            <h2>Create an Account</h2>
            <p>Join the StudyBud community.</p>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                />

                <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    required
                />

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />

                {/* Backend / submission error */}
                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                />

                <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                />

                {/* Real-time password validation */}
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="error-message"> Passwords do not match! </p>
                    )
                }

                <Button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </Button>

            </form>

            <p className="auth-footer">
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </p>

        </div>
    );
}

export default RegisterPage;