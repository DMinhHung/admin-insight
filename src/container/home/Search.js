import React, { useEffect, useState } from "react";
import HeaderHome from "../../components/home/HeaderHome";
import FootterHome from "../../components/home/FootterHome";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const Search = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const location = useLocation(); // Hook để lấy thông tin về URL

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const term = searchParams.get("term"); // Lấy giá trị từ query parameter 'term'

        const fetchProducts = async (term) => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/search?search=${term}`
                );
                setProducts(response.data); // Cập nhật danh sách sản phẩm từ API
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Lỗi khi tải danh sách sản phẩm");
            }
        };

        if (term) {
            setSearchTerm(term); // Cập nhật searchTerm từ query parameter 'term'
            fetchProducts(term); // Gọi API lấy danh sách sản phẩm
        }
    }, [location.search]);
    const userid = localStorage.getItem("userid");
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/getcate"
                );
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
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

    // Lọc sản phẩm dựa trên category đã chọn
    const filteredProducts = selectedCategory
        ? products.filter(
              (product) => product.categories_id === selectedCategory
          )
        : products;

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
            <HeaderHome />
            <div className="bg-primary mb-4"></div>

            <section className="mt-5">
                <div className="container">
                    <div className="row">
                        {/* sidebar */}
                        <div className="col-lg-3">
                            {/* Toggle button */}
                            <button
                                className="btn btn-outline-secondary mb-3 w-100 d-lg-none"
                                type="button"
                                data-mdb-toggle="collapse"
                                data-mdb-target="#navbarSupportedContent"
                                aria-controls="navbarSupportedContent"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                            >
                                <span>Show filter</span>
                            </button>
                            {/* Collapsible wrapper */}
                            <div
                                className="collapse card d-lg-block mb-5"
                                id="navbarSupportedContent"
                            >
                                <div
                                    className="accordion"
                                    id="accordionPanelsStayOpenExample"
                                >
                                    <div className="accordion-item">
                                        <h2
                                            className="accordion-header"
                                            id="headingOne"
                                        >
                                            <button
                                                style={{ display: "inline" }}
                                                className="accordion-button text-dark bg-light"
                                            >
                                                Danh mục sản phẩm
                                            </button>
                                        </h2>
                                        <div
                                            id="panelsStayOpen-collapseOne"
                                            className="accordion-collapse collapse show"
                                            aria-labelledby="headingOne"
                                        >
                                            <div className="accordion-body">
                                                <ul className="list-unstyled">
                                                    {categories.map(
                                                        (category) => (
                                                            <li
                                                                key={
                                                                    category.id
                                                                }
                                                            >
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    value={
                                                                        category.id
                                                                    }
                                                                    checked={
                                                                        selectedCategory ===
                                                                        category.id
                                                                    }
                                                                    onChange={() =>
                                                                        setSelectedCategory(
                                                                            category.id
                                                                        )
                                                                    }
                                                                />
                                                                <label
                                                                    className="form-check-label ms-2"
                                                                    htmlFor="flexCheckDefault"
                                                                >
                                                                    {
                                                                        category.value
                                                                    }
                                                                </label>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-9">
                            <header className="d-sm-flex align-items-center border-bottom mb-4 pb-3">
                                <strong className="d-block py-2">
                                    Đang có {filteredProducts.length} sản phẩm
                                </strong>
                            </header>
                            <div className="row">
                                {filteredProducts.map((product) => (
                                    <div
                                        className="col-lg-4 col-md-6 col-sm-6 d-flex"
                                        key={product.id}
                                    >
                                        <div className="card w-100 my-2 shadow-2-strong">
                                            <Link
                                                to={`/productdetail/${product.id}`}
                                            >
                                                <img
                                                    src={`http://localhost:8000/${
                                                        JSON.parse(
                                                            product.img
                                                        )[0]
                                                    }`}
                                                    className="card-img-top"
                                                    alt={product.name}
                                                />
                                            </Link>
                                            <div className="card-body d-flex flex-column">
                                                <div className="d-flex flex-row">
                                                    <h5 className="mb-1 me-1">
                                                        {" "}
                                                        {new Intl.NumberFormat(
                                                            "vi-VN",
                                                            {
                                                                style: "currency",
                                                                currency: "VND",
                                                            }
                                                        ).format(product.price)}
                                                    </h5>
                                                </div>
                                                <Link
                                                    to={`/product_detail/${product.id}`}
                                                >
                                                    <p className="card-text">
                                                        {product.name}
                                                    </p>
                                                </Link>
                                                <div
                                                    style={{
                                                        backgroundColor:
                                                            "white",
                                                    }}
                                                    className="card-footer d-flex align-items-end pt-3 px-0 pb-0 mt-auto"
                                                >
                                                    <a
                                                        href="#!"
                                                        style={{ height: 39 }}
                                                        className="btn btn-primary shadow-0 me-1"
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
                            <hr />
                        </div>
                    </div>
                </div>
            </section>

            <FootterHome />
        </>
    );
};

export default Search;
