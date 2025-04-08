import React, { useEffect, useState } from "react";
import HeaderAdmin from "../../components/admin/HeaderAdmin";
import Navbar from "../../components/admin/Navbar";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import BillDetail from "./BillDetail"; // Import BillDetail component

const Bills = () => {
    const [bills, setBills] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBillId, setSelectedBillId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/bills"
                );
                setBills(response.data);
            } catch (error) {
                console.error("Error fetching bills:", error);
            }
        };

        fetchData();
    }, []);

    const handleShowModal = (billId) => {
        setSelectedBillId(billId);
        setShowModal(true);

        console.log(billId);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBillId(null);
    };

    console.log(bills);

    return (
        <div
            className="page-wrapper"
            id="main-wrapper"
            data-layout="vertical"
            data-navbarbg="skin6"
            data-sidebartype="full"
            data-sidebar-position="fixed"
            data-header-position="fixed"
        >
            <aside
                className="left-sidebar"
                style={{ backgroundColor: "darkgray" }}
            >
                <div>
                    <Navbar />
                </div>
            </aside>
            <div className="body-wrapper">
                <HeaderAdmin />
                <div className="container-fluid">
                    <div className="container-fluid">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title fw-semibold mb-4">
                                    Hóa đơn
                                </h5>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Mã hóa đơn</th>
                                            <th scope="col">Tên người mua</th>
                                            <th scope="col">Địa chỉ</th>
                                            <th scope="col">Giá</th>
                                            <th scope="col">Ngày mua</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bills.map((bill) => (
                                            <tr key={bill.order[0]?.code}>
                                                <th scope="row">
                                                    {bill.order[0]?.code}
                                                </th>
                                                <td>{bill.user.name}</td>
                                                <td>{bill.user.address}</td>
                                                <td>{bill.total_price}</td>
                                                <td>{bill.created_at}</td>
                                                <td>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-eye"
                                                        viewBox="0 0 16 16"
                                                        onClick={() =>
                                                            handleShowModal(
                                                                bill.id
                                                            )
                                                        }
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                                    </svg>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal size="xl" show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết hóa đơn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBillId && <BillDetail billId={selectedBillId} />}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Bills;
