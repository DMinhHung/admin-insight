import React from "react";
import Navbar from "../../components/admin/Navbar";
import HeaderAdmin from "../../components/admin/HeaderAdmin";

const Dashboard = () => {
    return (
        <>
            <div
                className="page-wrapper"
                id="main-wrapper"
                data-layout="vertical"
                data-navbarbg="skin6"
                data-sidebartype="full"
                data-sidebar-position="fixed"
                data-header-position="fixed"
            >
                {/* Sidebar Start */}
                <aside
                    className="left-sidebar"
                    style={{ backgroundColor: "darkgray" }}
                >
                    {/* Sidebar scroll*/}
                    <div>
                        {/* Sidebar navigation*/}
                        <Navbar />
                        {/* End Sidebar navigation */}
                    </div>
                    {/* End Sidebar scroll*/}
                </aside>
                {/*  Sidebar End */}
                {/*  Main wrapper */}
                <div className="body-wrapper">
                    {/*  Header Start */}
                    <HeaderAdmin />
                    {/*  Header End */}
                    <div className="container-fluid">
                        {/*  Row 1 */}
                        <h6>Xin chào quản trị viên</h6>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
