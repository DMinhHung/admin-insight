import axios from "axios";
import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const HeaderHome = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const Navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      Navigate(`/search?term=${searchTerm.trim()}`);
    }
    else {
      toast.error("Vui lý nhập từ khóa");
    }
  };

  useEffect(() => {
    const userid = localStorage.getItem("userid");
    const username = localStorage.getItem("username");
    if (userid) {
      setIsLoggedIn(true);
      setUserName(username);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("usertoken");
      const response = await axios.post(
        "http://localhost:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem("userid");
      localStorage.removeItem("username");
      localStorage.removeItem("usertoken");
      setIsLoggedIn(false);
      toast.success("Đăng xuất thành công", response.data);
      Navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header>
        {/* Jumbotron */}
        <div className="p-3 text-center bg-white border-bottom">
          <div className="container">
            <div className="row gy-3">
              {/* Left elements */}
              <div className="col-lg-2 col-sm-4 col-4">
                <a href="/" className="float-start">
                  <img
                    src="https://mdbootstrap.com/img/logo/mdb-transaprent-noshadows.png"
                    height={35}
                  />
                </a>
              </div>
              {/* Left elements */}
              {/* Center elements */}
              <div className="order-lg-last col-lg-5 col-sm-8 col-8">
                <div className="d-flex float-end">
                  {isLoggedIn ? (
                    <Dropdown>
                      <Dropdown.Toggle
                        className="border rounded py-1 px-3 nav-link d-flex align-items-center me-1"
                        id="dropdown-basic"
                        style={{ background: "none" }}
                      >
                        <i className="fas fa-user-alt m-1 me-md-2" />
                        <p className="d-none d-md-block mb-0">{userName}</p>
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>
                          Logout
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <>
                      <a
                        href="/login"
                        className="me-1 border rounded py-1 px-3 nav-link d-flex align-items-center"
                      >
                        {" "}
                        <i className="fas fa-user-alt m-1 me-md-2" />
                        <p className="d-none d-md-block mb-0">Login</p>{" "}
                      </a>
                    </>
                  )}
                  <a
                    href="/shopping_cart"
                    className="border rounded py-1 px-3 nav-link d-flex align-items-center"
                  >
                    {" "}
                    <i className="fas fa-shopping-cart m-1 me-md-2" />
                    <p className="d-none d-md-block mb-0">My cart</p>{" "}
                  </a>
                </div>
              </div>
              {/* Center elements */}
              {/* Right elements */}
              <div className="col-lg-5 col-md-12 col-12">
                <form onSubmit={handleSearch}>
                  <div className="input-group float-center">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary shadow-0">
                      <i className="fas fa-search" />
                    </button>
                  </div>
                </form>
              </div>
              {/* Right elements */}
            </div>
          </div>
        </div>
        {/* Jumbotron */}
        {/* Navbar */}
        <nav
          className="navbar navbar-expand-lg navbar-light"
          style={{ backgroundColor: "lightgray" }}
        >
          {/* Container wrapper */}
          <div className="container justify-content-center justify-content-md-between">
            {/* Toggle button */}
            <button
              className="navbar-toggler border py-2 text-dark"
              type="button"
              data-mdb-toggle="collapse"
              data-mdb-target="#navbarLeftAlignExample"
              aria-controls="navbarLeftAlignExample"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <i className="fas fa-bars" />
            </button>
            {/* Collapsible wrapper */}
            <div
              className="collapse navbar-collapse"
              id="navbarLeftAlignExample"
            >
              {/* Left links */}
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a
                    className="nav-link text-dark fw-bold"
                    aria-current="page"
                    href="/"
                  >
                    Trang chủ
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-dark fw-bold" href="/about">
                    Giới thiệu
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-dark fw-bold" href="/product">
                    Sản phẩm
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-dark fw-bold" href="/contact">
                    Liên Hệ
                  </a>
                </li>
              </ul>
              {/* Left links */}
            </div>
          </div>
          {/* Container wrapper */}
        </nav>
        {/* Navbar */}
        {/* Jumbotron */}
      </header>
    </>
  );
};

export default HeaderHome;
