import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const RegisterAdmin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [rememberToken, setRememberToken] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra từng trường dữ liệu
    const errors = {};
    if (!/^[a-zA-Z ]+$/.test(name.trim())) {
      errors.name = "Tên không được chứa kí tự đặc biệt.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email address.";
    }
    if (password.length < 8) {
      errors.password = "Mật khẩu 8 kí tự trở lên.";
    }
    if (password === "") {
      errors.confirmPassword = "Hãy nhập mật khẩu.";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu không hợp lệ.";
    }
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    axios
      .post("http://localhost:8000/api/registeradmin", {
        name: name,
        email: email,
        password: password,
      })
      .then((response) => {
        toast.success("Registration successful:", response.data);
        navigate("/loginadmin");
      })
      .catch((error) => {
        console.error("Registration failed:", error);
      });
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
                        alt
                      />
                    </a>
                    <p style={{ marginTop: -50 }} className="text-center">
                      Register
                    </p>
                    <Form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputtext1"
                          className="form-label"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputtext1"
                          aria-describedby="textHelp"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && (
                          <p className="text-danger">{errors.name}</p>
                        )}
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && (
                          <small className="text-danger">{errors.email}</small>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="exampleInputPassword1"
                          className="form-label"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="exampleInputPassword1"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && (
                          <small className="text-danger">
                            {errors.password}
                          </small>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="exampleInputConfirmPassword1"
                          className="form-label"
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="exampleInputConfirmPassword1"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {errors.confirmPassword && (
                          <small className="text-danger">
                            {errors.confirmPassword}
                          </small>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2"
                      >
                        Sign Up
                      </Button>
                      <div className="d-flex align-items-center justify-content-center">
                        <a className="text-primary fw-bold ms-2" href="/login">
                          Sign In
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

export default RegisterAdmin;
