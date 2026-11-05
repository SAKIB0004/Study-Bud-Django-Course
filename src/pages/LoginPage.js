import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import Input from "../components/common/Input";
import Button from "../components/common/Button";

import useAuth from "../hooks/useAuth";

function LoginPage() {

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        setError("");
        setLoading(true);

        try{
            await login(formData);
            const destination = location.state?.from?.pathname || "/";
            navigate(destination, {replace:true});
        }catch (error){
            const message =
                error.response?.data?.detail ||
                error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.message ||
                "Login failed. Please check your credentials.";

            setError(message);


        }finally{
            setLoading(false);
        }
    };


    return (
        <div className="auth-form">

            <h2>Welcome Back!</h2>
            <p>Login to continue learning together.</p>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                />

                <Button type="submit" disabled={loading} >
                    {loading ? "Logging in..." : "Login"}
                </Button>

            </form>

            <p className="auth-footer">
                Don't have an account?{" "}
                <Link to="/register">Register</Link>
            </p>

        </div>
    );
}

export default LoginPage;