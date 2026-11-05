import { Link, useNavigate } from "react-router-dom";
// import { FaSearch, FaUserCircle } from "react-icons/fa";

import useAuth from "../../hooks/useAuth";

function Navbar() {

    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };
    
    return (
        <header className="navbar">

            <Link to="/" className="brand">
                StudyBud
            </Link>

            <div className="navbar-actions">

                {isAuthenticated ? (
                    <div className="navbar-user-menu">

                        {/* Username link */}
                        <Link to="/profile" className="user-link">
                            {user?.username}
                        </Link>

                        {/* Dropdown menu */}
                        <details className="user-dropdown">

                            <summary className="dropdown-toggle">
                                <span className="dropdown-arrow"></span>
                            </summary>

                            <div className="dropdown-menu">

                                <Link to="/profile/edit">
                                    Update
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>

                            </div>

                        </details>

                    </div>
                ) : (
                    <>
                        <Link to="/login" className="nav-login">
                            Login
                        </Link>
                    </>
                )}

            </div>

        </header>
    );
}

export default Navbar;