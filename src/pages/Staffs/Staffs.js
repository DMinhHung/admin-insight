import React, { useEffect, useState } from "react";
import axios from "axios";

const Staffs = () => {
    const [staffs, setStaffs] = useState([
        {
            id: 1,
            name: "Nguyên Văn A",
            img: "https://thanhnien.mediacdn.vn/Uploaded/thaobtn/2022_11_14/311934850-1418435365308695-2138519866807084175-n-6002.jpg",
            gender: "Nam",
            position: "Nhân Viên",
        },
        {
            id: 2,
            name: "Phan Thị B",
            img: "https://vapa.vn/wp-content/uploads/2022/12/anh-dep-nu-001.jpg",
            gender: "Nữ",
            position: "Nhân Viên",
        },
    ]);

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
                <div className="body-wrapper">
                    {/*  Header Start */}
                    {/* <HeaderAdmin /> */}
                    {/*  Header End */}
                    <div className="container-fluid">
                        <div className="container-fluid">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title fw-semibold mb-4">
                                        Nhân viên
                                    </h5>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Tên</th>
                                                <th scope="col">Ảnh</th>
                                                <th scope="col">Giới tính</th>
                                                <th scope="col">Chức vụ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffs.map((staff) => (
                                                <tr key={staff.id}>
                                                    <th scope="row">
                                                        {staff.id}
                                                    </th>
                                                    <td>{staff.name}</td>
                                                    <td>
                                                        <img
                                                            src={staff.img}
                                                            alt={staff.name}
                                                            style={{
                                                                width: "50px",
                                                                height: "50px",
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{staff.gender}</td>
                                                    <td>{staff.position}</td>
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

export default Staffs;
