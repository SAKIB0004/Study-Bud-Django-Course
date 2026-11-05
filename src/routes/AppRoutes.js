import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";

import CreateRoomPage from "../pages/CreateRoomPage";
import DeleteRoomPage from "../pages/DeleteRoomPage";
import RoomDetailPage from "../pages/RoomDetailPage";
import EditProfilePage from "../pages/EditProfilePage";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

function AppRoutes() {

    return (
        <Routes>

            {/* Public application pages */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
            </Route>

            {/* Guest-only pages */}
            <Route element={<GuestRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    {/* <Route path="/room/:id" element={<RoomDetailPage />} /> */}
                </Route>
            </Route>

            {/* Protected application pages */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                    <Route path="/create-room" element={<CreateRoomPage />} />
                    <Route path="/room/:id/edit" element={<CreateRoomPage />} />
                    <Route path="/room/:id/delete" element={<DeleteRoomPage />} />
                    <Route path="/room/:id/messages/:messageId/delete" element={<DeleteRoomPage type="message" />}/>
                    <Route path="/room/:id" element={<RoomDetailPage />} />
                    <Route path="/profile/edit" element={<EditProfilePage />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />

        </Routes>
    );
}

export default AppRoutes;