import React, { useEffect, useState } from "react";
import axios from "axios";

const Customers = () => {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/users"
                );
                setCustomers(response.data);
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
        };
        fetchData();
    }, []);
    console.log(customers);
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
                        {/* <Navbar /> */}
                        {/* End Sidebar navigation */}
                    </div>
                    {/* End Sidebar scroll*/}
                </aside>
                {/*  Sidebar End */}
                {/*  Main wrapper */}
                <div className="body-wrapper">
                    {/*  Header Start */}
                    {/* <HeaderAdmin /> */}
                    {/*  Header End */}
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title fw-semibold mb-4">
                                        Khách hàng
                                    </h5>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th scope="col">
                                                    Tên khách hàng
                                                </th>
                                                <th scope="col">
                                                    Email khách hàng
                                                </th>
                                                <th scope="col">
                                                    Số điện thoại
                                                </th>
                                                <th scope="col">Địa chỉ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers.map((customer) => (
                                                <tr key={customer.id}>
                                                    <td>{customer.name}</td>
                                                    <td>{customer.email}</td>
                                                    <td>{customer.phone}</td>
                                                    <td>{customer.address}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Customers;
