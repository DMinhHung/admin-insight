import React, { useEffect, useState } from "react";
import HeaderHome from "../../components/home/HeaderHome";
import FootterHome from "../../components/home/FootterHome";
import axios from "axios";
import { toast } from "react-toastify";

const Checkout = () => {
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const calculateTotalPrice = () => {
        const total = cart.reduce((acc, item) => acc + item.price, 0);
        setTotalPrice(total);
    };

    const userId = localStorage.getItem("userid");
    console.log("User ID:", userId);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/getusers/${userId}`
                );
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching cart:", error);
            }
        };
        fetchData();
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/add-to-cart-get-products"
                );
                const initialCart = response.data.map((item) => ({
                    ...item,
                    quantity: item.quantity,
                    price: item.total_price,
                }));
                setCart(initialCart);
            } catch (error) {
                console.error("Error fetching cart:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        calculateTotalPrice();
    }, [cart]);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("userid"));
    }, []);

    const handleCheckout = async () => {
        try {
            const userId = localStorage.getItem("userid");
            const response = await axios.post(
                "http://localhost:8000/api/checkout",
                {
                    user_id: userId,
                    cart: cart,
                }
            );
            toast.success("Thanh toán thành công");
        } catch (error) {
            toast.error("Thanh toán thất bại");
            console.error("Error during checkout:", error);
        }
    };

    return (
        <>
            <HeaderHome />
            <div className="bg-primary"></div>

            <section className="bg-light py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-8 col-lg-8 mb-4">
                            {!isLoggedIn && (
                                <div className="card mb-4 border shadow-0">
                                    <div className="p-4 d-flex justify-content-between">
                                        <div>
                                            <h5>Have an account?</h5>
                                            <p className="mb-0 text-wrap ">
                                                Lorem ipsum dolor sit amet,
                                                consectetur adipisicing elit
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center flex-column flex-md-row">
                                            <a
                                                href="#"
                                                className="btn btn-outline-primary me-0 me-md-2 mb-2 mb-md-0 w-100"
                                            >
                                                Register
                                            </a>
                                            <a
                                                href="#"
                                                className="btn btn-primary shadow-0 text-nowrap w-100"
                                            >
                                                Sign in
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Checkout */}
                            <div className="card shadow-0 border">
                                <div className="p-4">
                                    <h5 className="card-title mb-3">
                                        Thông tin người mua
                                    </h5>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <p className="mb-0">First name</p>
                                            <div className="form-outline">
                                                <input
                                                    type="text"
                                                    id="typeText"
                                                    placeholder="Type here"
                                                    className="form-control"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <p className="mb-0">Last name</p>
                                            <div className="form-outline">
                                                <input
                                                    type="text"
                                                    id="typeText"
                                                    placeholder="Type here"
                                                    className="form-control"
                                                    value={user.name}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <p className="mb-0">Phone</p>
                                            <div className="form-outline">
                                                <input
                                                    type="tel"
                                                    id="typePhone"
                                                    defaultValue={+48}
                                                    className="form-control"
                                                    value={user.phone}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <p className="mb-0">Email</p>
                                            <div className="form-outline">
                                                <input
                                                    type="email"
                                                    id="typeEmail"
                                                    placeholder="example@gmail.com"
                                                    className="form-control"
                                                    value={user.email}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12 mb-3">
                                            <p className="mb-0">Address</p>
                                            <div className="form-outline">
                                                <input
                                                    type="text"
                                                    id="typeText"
                                                    placeholder="Type here"
                                                    className="form-control"
                                                    value={user.address}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="float-end">
                                        <button className="btn btn-light border">
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-success shadow-0 border"
                                            onClick={handleCheckout}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout */}
                        </div>
                        <div className="col-xl-4 col-lg-4 d-flex justify-content-center justify-content-lg-end">
                            <div
                                className="ms-lg-4 mt-4 mt-lg-0"
                                style={{ maxWidth: 320 }}
                            >
                                <h6 className="mb-3">Hóa đơn</h6>
                                <div className="d-flex justify-content-between">
                                    <p className="mb-2">Total price:</p>
                                    <p className="mb-2">{totalPrice}</p>
                                </div>
                                {/* <div className="d-flex justify-content-between">
                  <p className="mb-2">Discount:</p>
                  <p className="mb-2 text-danger">- $60.00</p>
                </div> */}
                                <div className="d-flex justify-content-between">
                                    <p className="mb-2">Shipping cost:</p>
                                    <p className="mb-2">+ 15.000</p>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <p className="mb-2">Total price:</p>
                                    <p className="mb-2 fw-bold">{totalPrice}</p>
                                </div>
                                {/* <div className="input-group mt-3 mb-4">
                    <input
                      type="text"
                      className="form-control border"
                      name
                      placeholder="Promo code"
                    />
                    <button className="btn btn-light text-primary border">
                      Apply
                    </button>
                  </div> */}
                                <hr />
                                <h6 className="text-dark my-4">Sản phẩm</h6>
                                {cart.map((item) => (
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="me-3 position-relative">
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-secondary">
                                                1
                                            </span>
                                            <img
                                                src={`http://localhost:8000/${
                                                    JSON.parse(
                                                        item.product.img
                                                    )[0]
                                                }`}
                                                style={{
                                                    height: 96,
                                                    width: "96x",
                                                }}
                                                className="img-sm rounded border"
                                            />
                                        </div>
                                        <div className>
                                            <a href="#" className="nav-link">
                                                Tên: {item.product.name} <br />
                                                Màu: {item.product.color}
                                            </a>
                                            <div className="price text-muted">
                                                Tiền: {item.product.price}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <FootterHome />
        </>
    );
};

export default Checkout;
