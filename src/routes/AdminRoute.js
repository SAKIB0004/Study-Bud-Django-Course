
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function AdminRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Checking admin access...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role?.name !== "ROOT_ADMIN") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default AdminRoute;
