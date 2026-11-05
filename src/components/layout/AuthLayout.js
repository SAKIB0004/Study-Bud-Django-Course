import { Outlet } from "react-router-dom";

function AuthLayout() {
    return (
        <div className="auth-layout">
            <div className="auth-container">
                <div className="auth-brand">
                    <h1>StudyBud</h1>
                    <p>Connect. Learn. Grow Together.</p>
                </div>

                <Outlet />
            </div>
        </div>
    );
}

export default AuthLayout;