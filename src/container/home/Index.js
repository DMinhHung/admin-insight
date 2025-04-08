import React, { useEffect, useState } from "react";
import HeaderHome from "../../components/home/HeaderHome";
import FootterHome from "../../components/home/FootterHome";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import CarouselComponent from "../../components/home/CarouselComponent";

const Indexs = () => {
    const [products, setProducts] = useState([]);

    const userid = localStorage.getItem("userid");
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/getproducts"
                );
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchData();
    }, []);

    const addToCart = async (productId, userId, price) => {
        try {
            const quantity = 1;
            const response = await axios.post(
                "http://localhost:8000/api/add-to-cart",
                {
                    productId,
                    userId,
                    quantity,
                    price,
                }
            );
            if (response.status === 200) {
                toast.success("Thêm sản phẩm thành công!");
            }
        } catch (error) {
            if (
                error.response &&
                error.response.status === 400 &&
                error.response.data.message === "Product already in cart"
            ) {
                toast.error("Sản phẩm đã có trong giỏ hàng rồi");
            } else {
                console.error("Error adding product to cart:", error);
                toast.error("Thêm sản phẩm thất bại");
            }
        }
    };

    const addToWishlist = async (productId, userId) => {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/addwishlist",
                {
                    productId,
                    userId,
                }
            );
            if (response.status === 200) {
                toast.success("Them san pham vao wishlist thanh cong!");
            }
        } catch (error) {
            console.error("Error adding product to wishlist:", error);
            toast.error("Them san pham vao wishlist that bai!");
        }
    };
    return (
        <>
            <div>
                <HeaderHome />
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <CarouselComponent />
                        </div>
                    </div>
                </div>
                <section
                    className="mt-5"
                    style={{ backgroundColor: "#f5f5f5" }}
                >
                    <div className="container text-dark pt-3">
                        <div className="row mb-4">
                            <div className="col-lg-3 col-md-6">
                                <figure
                                    className="d-flex align-items-center mb-4"
                                    style={{ paddingTop: "25px" }}
                                >
                                    <span className="rounded-circle bg-white p-3 d-flex me-2 mb-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-airplane"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849m.894.448C7.111 2.02 7 2.569 7 3v4a.5.5 0 0 1-.276.447l-5.448 2.724a.5.5 0 0 0-.276.447v.792l5.418-.903a.5.5 0 0 1 .575.41l.5 3a.5.5 0 0 1-.14.437L6.708 15h2.586l-.647-.646a.5.5 0 0 1-.14-.436l.5-3a.5.5 0 0 1 .576-.411L15 11.41v-.792a.5.5 0 0 0-.276-.447L9.276 7.447A.5.5 0 0 1 9 7V3c0-.432-.11-.979-.322-1.401C8.458 1.159 8.213 1 8 1s-.458.158-.678.599" />
                                        </svg>
                                    </span>
                                    <figcaption className="info">
                                        <h6 className="title">
                                            Vận chuyển miễn phí
                                        </h6>
                                        <p>Freeship cho mọi đơn hàng ở TPHCM</p>
                                    </figcaption>
                                </figure>
                                {/* itemside // */}
                            </div>
                            {/* col // */}
                            <div className="col-lg-3 col-md-6">
                                <figure
                                    className="d-flex align-items-center mb-4"
                                    style={{ paddingTop: "25px" }}
                                >
                                    <span className="rounded-circle bg-white p-3 d-flex me-2 mb-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-geo-alt"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
                                            <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                                        </svg>
                                    </span>
                                    <figcaption className="info">
                                        <h6 className="title">
                                            Hầng hiệu 100%
                                        </h6>
                                        <p>Cam kết chính hãng</p>
                                    </figcaption>
                                </figure>
                                {/* itemside // */}
                            </div>
                            {/* col // */}
                            <div className="col-lg-3 col-md-6">
                                <figure
                                    className="d-flex align-items-center mb-4"
                                    style={{ paddingTop: "25px" }}
                                >
                                    <span className="rounded-circle bg-white p-3 d-flex me-2 mb-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-tag"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0" />
                                            <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1m0 5.586 7 7L13.586 9l-7-7H2z" />
                                        </svg>
                                    </span>
                                    <figcaption className="info">
                                        <h6 className="title">Bảo hành tốt</h6>
                                        <p>Trọn đời miễn phí</p>
                                    </figcaption>
                                </figure>
                                {/* itemside // */}
                            </div>
                            {/* col // */}
                            <div className="col-lg-3 col-md-6">
                                <figure
                                    className="d-flex align-items-center mb-4"
                                    style={{ paddingTop: "25px" }}
                                >
                                    <span className="rounded-circle bg-white p-3 d-flex me-2 mb-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-receipt"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27m.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0z" />
                                            <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5" />
                                        </svg>
                                    </span>
                                    <figcaption className="info">
                                        <h6 className="title">Thanh toán</h6>
                                        <p>Thanh toán nhanh gọn</p>
                                    </figcaption>
                                </figure>
                                {/* itemside // */}
                            </div>
                        </div>
                    </div>
                    {/* container end.// */}
                </section>
                {/* Products */}
                <section>
                    <div className="container my-5">
                        <header className="mb-4">
                            <h3>Sản phẩm</h3>
                        </header>
                        <div className="row">
                            {products.map((product) => (
                                <div className="col-lg-3 col-md-6 col-sm-6 d-flex">
                                    <div className="card w-100 my-2 shadow-2-strong">
                                        <Link
                                            to={`/productdetail/${product.id}`}
                                        >
                                            <img
                                                src={`http://localhost:8000/${
                                                    JSON.parse(product.img)[0]
                                                }`}
                                                className="card-img-top"
                                            />
                                        </Link>
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">
                                                {product.name}
                                            </h5>
                                            <p className="card-text">
                                                {" "}
                                                {new Intl.NumberFormat(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                ).format(product.price)}
                                            </p>
                                            <div
                                                style={{
                                                    backgroundColor: "white",
                                                }}
                                                className="card-footer d-flex align-items-end pt-3 px-0 pb-0 mt-auto"
                                            >
                                                <a
                                                    // href="#!"
                                                    style={{ height: 39 }}
                                                    className="btn btn-primary shadow-0 me-1 fw-bold"
                                                    onClick={() =>
                                                        addToCart(
                                                            product.id,
                                                            1,
                                                            product.price
                                                        )
                                                    }
                                                >
                                                    Add to cart
                                                </a>
                                                <a
                                                    // href="#!"
                                                    className="btn btn-light border px-2 pt-2 icon-hover"
                                                    onClick={() =>
                                                        addToWishlist(
                                                            product.id,
                                                            userid
                                                        )
                                                    }
                                                >
                                                    <i className="fas fa-heart fa-lg text-secondary px-1" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* Products */}
                {/* Feature */}

                {/* Feature */}
                {/* Blog */}
                <section className="mt-5 mb-4">
                    <div className="container text-dark">
                        <header className="mb-4">
                            <h3>Thông tin</h3>
                        </header>
                        <div className="row">
                            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                <article>
                                    <a href="#" className="img-fluid">
                                        <img
                                            className="rounded w-100"
                                            src="https://dplusvn.com/wp-content/uploads/2020/02/hinh-anh-van-phong-cong-ty-rigup-2.jpg"
                                            style={{
                                                objectFit: "cover",
                                                height: "160px",
                                            }}
                                            alt="Office"
                                        />
                                    </a>
                                    <div className="mt-2 text-muted small d-block mb-1">
                                        <span>
                                            <i className="fa fa-calendar-alt fa-sm" />
                                            23.12.2022
                                        </span>
                                        <a href="#">
                                            <h6 className="text-dark">
                                                How to promote brands
                                            </h6>
                                        </a>
                                        <p>
                                            When you enter into any new area of
                                            science, you almost reach
                                        </p>
                                    </div>
                                </article>
                            </div>
                            {/* col.// */}
                            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                <article>
                                    <a href="#" className="img-fluid">
                                        <img
                                            className="rounded w-100"
                                            src="https://dplusvn.com/wp-content/uploads/2020/02/hinh-anh-van-phong-cong-ty-rigup-3.jpg"
                                            style={{ objectFit: "cover" }}
                                            height={160}
                                        />
                                    </a>
                                    <div className="mt-2 text-muted small d-block mb-1">
                                        <span>
                                            <i className="fa fa-calendar-alt fa-sm" />
                                            13.12.2022
                                        </span>
                                        <a href="#">
                                            <h6 className="text-dark">
                                                How we handle shipping
                                            </h6>
                                        </a>
                                        <p>
                                            When you enter into any new area of
                                            science, you almost reach
                                        </p>
                                    </div>
                                </article>
                            </div>
                            {/* col.// */}
                            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                <article>
                                    <a href="#" className="img-fluid">
                                        <img
                                            className="rounded w-100"
                                            src="https://dplusvn.com/wp-content/uploads/2020/02/hinh-anh-van-phong-cong-ty-casanova-mccann-2.jpg"
                                            style={{ objectFit: "cover" }}
                                            height={160}
                                        />
                                    </a>
                                    <div className="mt-2 text-muted small d-block mb-1">
                                        <span>
                                            <i className="fa fa-calendar-alt fa-sm" />
                                            25.11.2022
                                        </span>
                                        <a href="#">
                                            <h6 className="text-dark">
                                                How to promote brands
                                            </h6>
                                        </a>
                                        <p>
                                            When you enter into any new area of
                                            science, you almost reach
                                        </p>
                                    </div>
                                </article>
                            </div>
                            {/* col.// */}
                            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                <article>
                                    <a href="#" className="img-fluid">
                                        <img
                                            className="rounded w-100"
                                            src="https://icadvietnam.vn/wp-content/uploads/2023/12/thiet-ke-van-phong-cong-ty-scaled.jpg"
                                            style={{ objectFit: "cover" }}
                                            height={160}
                                        />
                                    </a>
                                    <div className="mt-2 text-muted small d-block mb-1">
                                        <span>
                                            <i className="fa fa-calendar-alt fa-sm" />
                                            03.09.2022
                                        </span>
                                        <a href="#">
                                            <h6 className="text-dark">
                                                Success story of sellers
                                            </h6>
                                        </a>
                                        <p>
                                            When you enter into any new area of
                                            science, you almost reach
                                        </p>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Blog */}
                {/* Footer */}
                <FootterHome />
            </div>
        </>
    );
};

export default Indexs;
