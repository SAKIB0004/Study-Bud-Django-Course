
import AdminPageHeader from "../../components/admin/common/AdminPageHeader";

import "../../assets/styles/admin/admin-common.css";

function AdminSectionPage({ title = "Dashboard Overview" }) {
    return (
        <div className="admin-section-page">

            <AdminPageHeader
                title={title}
                description="Monitor and manage your StudyBuddy platform."
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    {
                        label: "Administration",
                        to: "/admin/dashboard",
                    },
                    { label: title },
                ]}
            />

            {/* <div className="admin-section-content">

                <div className="admin-dashboard-welcome">
                    <h2>Welcome to StudyBuddy Administration</h2>

                    <p>
                        Select a management section from the sidebar
                        to manage rooms, topics, and users.
                    </p>
                </div>

            </div> */}

        </div>
    );
}

export default AdminSectionPage;
