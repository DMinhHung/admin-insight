import React, { useEffect, useState } from "react";
import HeaderHome from "../../components/home/HeaderHome";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Shopping_cart = () => {
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("direct");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/add-to-cart-get-products"
                );
                const initialCart = response.data.map((item) => ({
                    ...item,
                    quantity: item.quantity,
                    unitPrice: item.total_price / item.quantity,
                }));
                setCart(initialCart);
                calculateTotalPrice(initialCart);
            } catch (error) {
                console.error("Error fetching cart:", error);
            }
        };
        fetchData();
    }, []);

    const handleQuantityChange = (id, newQuantity) => {
        const updatedCart = cart.map((item) =>
            item.id === id
                ? {
                      ...item,
                      quantity: newQuantity,
                  }
                : item
        );
        setCart(updatedCart);
        calculateTotalPrice(updatedCart);

        try {
            axios.post("http://localhost:8000/api/updatecart", {
                cartItems: updatedCart.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.unitPrice * item.quantity,
                })),
            });
            console.log("Updated cart:", updatedCart);
        } catch (error) {
            console.error("Error updating cart:", error);
        }
    };

    const handleDeleteCartItem = async (deleteid) => {
        try {
            await axios.delete(
                `http://localhost:8000/api/add-to-cartdelete/${deleteid}`
            );
            console.log("Deleted item with id:", deleteid);
            const updatedCart = cart.filter((item) => item.id !== deleteid);
            setCart(updatedCart);
            calculateTotalPrice(updatedCart);
        } catch (error) {
            console.error("Error deleting item from cart:", error);
        }
    };

    const calculateTotalPrice = (cart) => {
        const total = cart.reduce(
            (acc, item) => acc + item.unitPrice * item.quantity,
            0
        );
        setTotalPrice(total);
    };

    const handlePayment = async () => {
        if (paymentMethod === "direct") {
            navigate("/checkout");
        } else if (paymentMethod === "vnpay") {
            console.log("VNPAY payment selected");
            try {
                const userId = localStorage.getItem("userid");
                const response = await axios.post(
                    "http://localhost:8000/api/payment",
                    {
                        cartItems: cart.map((item) => ({
                            id: item.id,
                            quantity: item.quantity,
                            price: item.unitPrice * item.quantity,
                        })),
                        totalPrice: totalPrice + 14000,
                        user_id: userId,
                    }
                );
                console.log("Payment response:", response.data);
                if (response.data.code === "00") {
                    window.location.href = response.data.data; // Redirect to VNPAY payment page
                } else {
                    console.error(
                        "Error in payment response:",
                        response.data.message
                    );
                }
            } catch (error) {
                console.error("Error processing VNPAY payment:", error);
            }
        }
    };

    console.log(cart);

    return (
        <>
            <div>
                <HeaderHome />
                <div className="bg-primary">
                    <div className="container py-4">
                        {/* Breadcrumb */}
                        <nav className="d-flex">
                            <h6 className="mb-0">
                                <a href className="text-white-50">
                                    Home
                                </a>
                                <span className="text-white-50 mx-2">
                                    {" "}
                                    &gt;{" "}
                                </span>
                                <a href className="text-white">
                                    <u>Shopping cart</u>
                                </a>
                            </h6>
                        </nav>
                        {/* Breadcrumb */}
                    </div>
                </div>

                <section className="bg-light my-5">
                    <div className="container">
                        <div className="row">
                            {/* cart */}
                            <div className="col-lg-9">
                                <div className="card border shadow-0">
                                    <div className="m-4">
                                        <h4 className="card-title mb-4">
                                            Your shopping cart
                                        </h4>
                                        {cart.map((item) => (
                                            <div
                                                className="row gy-3 mb-4"
                                                key={item.id}
                                            >
                                                <div className="col-lg-5">
                                                    <div className="me-lg-5">
                                                        <div className="d-flex">
                                                            <img
                                                                src={`http://localhost:8000/${
                                                                    JSON.parse(
                                                                        item
                                                                            .product
                                                                            .img
                                                                    )[0]
                                                                }`}
                                                                className="border rounded me-3"
                                                                style={{
                                                                    width: 96,
                                                                    height: 96,
                                                                }}
                                                            />
                                                            <div>
                                                                <a
                                                                    href="#"
                                                                    className="nav-link"
                                                                >
                                                                    {
                                                                        item
                                                                            .product
                                                                            .name
                                                                    }
                                                                </a>
                                                                <p className="text-muted">
                                                                    {
                                                                        item
                                                                            .product
                                                                            .color
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-2 col-sm-6 col-6 d-flex flex-row flex-lg-column flex-xl-row text-nowrap">
                                                    <div className="d-flex align-items-center">
                                                        <div className="d-flex align-items-center">
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        item.id,
                                                                        Math.max(
                                                                            item.quantity -
                                                                                1,
                                                                            1
                                                                        )
                                                                    )
                                                                }
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    item.quantity
                                                                }
                                                                className="form-control mx-2"
                                                                style={{
                                                                    width: 50,
                                                                    textAlign:
                                                                        "center",
                                                                }}
                                                                readOnly
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        item.id,
                                                                        item.quantity +
                                                                            1
                                                                    )
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            marginTop: 35,
                                                        }}
                                                        className="ms-5"
                                                    >
                                                        <text className="h6">
                                                            {" "}
                                                            {new Intl.NumberFormat(
                                                                "vi-VN",
                                                                {
                                                                    style: "currency",
                                                                    currency:
                                                                        "VND",
                                                                }
                                                            ).format(
                                                                item.unitPrice *
                                                                    item.quantity
                                                            )}
                                                        </text>{" "}
                                                        <br />
                                                    </div>
                                                </div>
                                                <div className="col-lg col-sm-6 d-flex justify-content-sm-center justify-content-md-start justify-content-lg-center justify-content-xl-end mb-2 mt-5">
                                                    <div className="float-md-end">
                                                        <button
                                                            className="btn btn-light border text-danger icon-hover-danger ms-3"
                                                            onClick={() =>
                                                                handleDeleteCartItem(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-top pt-4 mx-4 mb-4">
                                        <p>
                                            <i className="fas fa-truck text-muted fa-lg" />{" "}
                                            Free Delivery within 1-2 weeks
                                        </p>
                                        <p className="text-muted">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipisicing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magna aliqua. Ut enim ad
                                            minim veniam, quis nostrud
                                            exercitation ullamco laboris nisi ut
                                            aliquip
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* cart */}
                            {/* summary */}
                            <div className="col-lg-3">
                                <div className="card shadow-0 border">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <p className="mb-2">Tổng tiền:</p>
                                            <p className="mb-2">
                                                {" "}
                                                {new Intl.NumberFormat(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                ).format(totalPrice)}
                                            </p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="mb-2">Giảm giá:</p>
                                            <p className="mb-2 text-success">
                                                {" "}
                                                {new Intl.NumberFormat(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                ).format(0)}
                                            </p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="mb-2">Phí ship:</p>
                                            <p className="mb-2">
                                                {" "}
                                                {new Intl.NumberFormat(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                ).format(14000)}
                                            </p>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between">
                                            <p className="mb-2">Total price:</p>
                                            <p className="mb-2 fw-bold">
                                                {" "}
                                                {new Intl.NumberFormat(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                ).format(totalPrice + 14000)}
                                            </p>
                                        </div>
                                        <div className="mt-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="paymentMethod"
                                                    id="directPayment"
                                                    value="direct"
                                                    checked={
                                                        paymentMethod ===
                                                        "direct"
                                                    }
                                                    onChange={(e) =>
                                                        setPaymentMethod(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="directPayment"
                                                >
                                                    Thanh Toán Trực Tiếp
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="paymentMethod"
                                                    id="vnpayPayment"
                                                    value="vnpay"
                                                    checked={
                                                        paymentMethod ===
                                                        "vnpay"
                                                    }
                                                    onChange={(e) =>
                                                        setPaymentMethod(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <label
                                                    className="form-check-label d-flex align-items-center"
                                                    htmlFor="vnpayPayment"
                                                >
                                                    <img
                                                        src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png"
                                                        alt="VNPAY"
                                                        style={{
                                                            width: 24,
                                                            height: 24,
                                                            marginRight: 8,
                                                        }}
                                                    />
                                                    VNPAY
                                                </label>
                                            </div>
                                            <button
                                                className="btn btn-success w-100 shadow-0 mb-2 mt-5"
                                                onClick={handlePayment}
                                            >
                                                Thanh Toán
                                            </button>
                                            <a
                                                href="/product"
                                                className="btn btn-light w-100 border mt-2"
                                            >
                                                Tiếp tục mua sắm
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* summary */}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Shopping_cart;
