import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginHome = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });
      toast.success("Đăng nhập thành công!");
      const { access_token, user } = response.data;
      // Lưu token và thông tin người dùng vào localStorage
      localStorage.setItem("userid", user.id);
      localStorage.setItem("username", user.name);
      localStorage.setItem("usertoken", access_token);
      // localStorage.setItem("userrole", user.role);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error.response.data);
      setError("Tên đăng nhập hoặc mật khẩu không hợp lệ");
      toast.error("Tên đăng nhập hoặc mật khẩu không hợp lệ");
    }
  };

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
        <div className="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center">
          <div className="d-flex align-items-center justify-content-center w-100">
            <div className="row justify-content-center w-100">
              <div className="col-md-8 col-lg-6 col-xxl-3">
                <div className="card mb-0">
                  <div className="card-body">
                    <a
                      href="./index.html"
                      className="text-nowrap logo-img text-center d-block py-3 w-100"
                    >
                      <img
                        src="https://png.pngtree.com/png-vector/20190729/ourlarge/pngtree-lock-security-locked-login-business-flat-line-filled-icon-ve-png-image_1622471.jpg"
                        width={180}
                        alt=""
                      />
                    </a>
                    <p style={{ marginTop: -50 }} className="text-center">
                      Đăng nhập
                    </p>
                    <Form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">
                          Email
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="exampleInputPassword1" className="form-label">
                          Mật khẩu
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="exampleInputPassword1"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="form-check">
                          <input
                            className="form-check-input primary"
                            type="checkbox"
                            id="flexCheckChecked"
                            defaultChecked
                          />
                          <label className="form-check-label text-dark" htmlFor="flexCheckChecked">
                            Nhớ tài khoản
                          </label>
                        </div>
                        <a className="text-primary fw-bold" href="./index.html">
                          Quên mật khẩu?
                        </a>
                      </div>
                      {error && <div className="alert alert-danger">{error}</div>}
                      <Button type="submit" className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2">
                        Đăng nhập
                      </Button>
                      <div className="d-flex align-items-center justify-content-center">
                        <a className="text-primary fw-bold ms-2" href="/register">
                          Tạo tài khoản
                        </a>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginHome;
