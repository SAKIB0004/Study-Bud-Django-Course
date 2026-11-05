import { Outlet, useLocation  } from "react-router-dom";

import Navbar from "./Navbar";


function MainLayout() {
    const location = useLocation();

    // HomePage has its own three-column layout
    // const isHomePage = location.pathname === "/";

    return (
        <div className="app-layout">

            <Navbar />

            <div className="main-container">

                <main className="page-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default MainLayout;