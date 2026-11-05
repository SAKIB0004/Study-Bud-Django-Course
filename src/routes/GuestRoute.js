import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";

function GuestRoute() {

    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default GuestRoute;