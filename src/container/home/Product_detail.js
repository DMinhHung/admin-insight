import React, { useEffect, useState } from "react";
import HeaderHome from "../../components/home/HeaderHome";
import FootterHome from "../../components/home/FootterHome";
import axios from "axios";
import { useParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import { toast } from "react-toastify";

const Product_detail = () => {
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState([]);

  const userid = localStorage.getItem("userid");

  // Fetch product details by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/show/${id}`
        );
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch all products for related items section
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/getproducts"
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Handle quantity change
  const handleQuantityChange = (operation) => {
    if (operation === "increase") {
      setQuantity(quantity + 1);
    } else if (operation === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Add product to cart
  const addToCart = async (productId, price, quantity) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/add-to-cart",
        {
          productId,
          userId: userid,
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

  // Add product to wishlist
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
        toast.success("Thêm sản phẩm vào wishlist thành công!");
      }
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
      toast.error("Thêm sản phẩm vào wishlist thất bại!");
    }
  };

  if (loading) {
    return <LoadingPage />;
  }
  return (
    <>
      <HeaderHome />
      <div className="bg-primary"></div>

      <div>
        <section className="py-5">
          <div className="container">
            <div className="row gx-5">
              <aside className="col-lg-6">
                <div className="border rounded-4 mb-3 d-flex justify-content-center">
                  <a
                    data-fslightbox="mygalley"
                    className="rounded-4"
                    target="_blank"
                    data-type="image"
                    href={`http://localhost:8000/${JSON.parse(product.img)[0]}`}
                  >
                    <img
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100vh",
                        margin: "auto",
                      }}
                      className="rounded-4 fit"
                      src={`http://localhost:8000/${
                        JSON.parse(product.img)[0]
                      }`}
                    />
                  </a>
                </div>
                <div className="d-flex justify-content-center mb-3">
                  <a
                    data-fslightbox="mygalley"
                    className="border mx-1 rounded-2"
                    target="_blank"
                    data-type="image"
                    href={`http://localhost:8000/${JSON.parse(product.img)[1]}`}
                  >
                    <img
                      width={60}
                      height={60}
                      className="rounded-2"
                      src={`http://localhost:8000/${
                        JSON.parse(product.img)[1]
                      }`}
                    />
                  </a>
                  <a
                    data-fslightbox="mygalley"
                    className="border mx-1 rounded-2"
                    target="_blank"
                    data-type="image"
                    href={`http://localhost:8000/${JSON.parse(product.img)[2]}`}
                  >
                    <img
                      width={60}
                      height={60}
                      className="rounded-2"
                      src={`http://localhost:8000/${
                        JSON.parse(product.img)[2]
                      }`}
                    />
                  </a>
                  <a
                    data-fslightbox="mygalley"
                    className="border mx-1 rounded-2"
                    target="_blank"
                    data-type="image"
                    href={`http://localhost:8000/${JSON.parse(product.img)[3]}`}
                  >
                    <img
                      width={60}
                      height={60}
                      className="rounded-2"
                      src={`http://localhost:8000/${
                        JSON.parse(product.img)[3]
                      }`}
                    />
                  </a>
                  <a
                    data-fslightbox="mygalley"
                    className="border mx-1 rounded-2"
                    target="_blank"
                    data-type="image"
                    href={`http://localhost:8000/${JSON.parse(product.img)[4]}`}
                  >
                    <img
                      width={60}
                      height={60}
                      className="rounded-2"
                      src={`http://localhost:8000/${
                        JSON.parse(product.img)[4]
                      }`}
                    />
                  </a>
                </div>
                {/* thumbs-wrap.// */}
                {/* gallery-wrap .end// */}
              </aside>
              <main className="col-lg-6">
                <div className="ps-lg-3">
                  <h4 className="title text-dark">{product.name}</h4>
                  <div className="mb-3">
                    <span className="h5">
                      {" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </span>
                  </div>
                  <p>{product.description}</p>
                  <hr />
                  <div className="row mb-4">
                    {/* <div className="col-md-4 col-6">
                      <label className="mb-2">Size</label>
                      <select
                        className="form-select border border-secondary"
                        style={{ height: 35 }}
                      >
                        <option>Small</option>
                        <option>Medium</option>
                        <option>Large</option>
                      </select>
                    </div> */}
                    {/* col.// */}
                    <div className="col-md-4 col-6 mb-3">
                      <label className="mb-2 d-block">Quantity</label>
                      <div className="input-group mb-3" style={{ width: 170 }}>
                        <button
                          className="btn btn-white border border-secondary px-3"
                          type="button"
                          onClick={() => handleQuantityChange("decrease")}
                        >
                          <i className="fas fa-minus" />
                        </button>
                        <input
                          type="text"
                          className="form-control text-center border border-secondary"
                          value={quantity}
                          aria-label="Quantity"
                          aria-describedby="button-addon1"
                        />
                        <button
                          className="btn btn-white border border-secondary px-3"
                          type="button"
                          onClick={() => handleQuantityChange("increase")}
                        >
                          <i className="fas fa-plus" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* <Link to="/checkout" className="btn btn-warning shadow-0">
                    {" "}
                    Buy now{" "}
                  </Link> */}
                  <a
                    href="#"
                    className="btn btn-primary shadow-0"
                    onClick={() =>
                      addToCart(product.id, product.price, quantity)
                    }
                  >
                    {" "}
                    <i className="me-1 fa fa-shopping-basket" /> Add to cart{" "}
                  </a>
                  <a
                    // href="#!"
                    className="btn btn-light border px-2 pt-2 icon-hover"
                    onClick={() => addToWishlist(product.id, userid)}
                  >
                    {" "}
                    <i className="me-1 fa fa-heart fa-lg" />{" "}
                  </a>
                </div>
              </main>
            </div>
          </div>
        </section>
        {/* content */}
        <section className="bg-light border-top py-4">
          <div className="container">
            <div className="row gx-4">
              <div className="col-lg-8 mb-4">
                <div className="border rounded-2 px-3 py-2 bg-white">
                  {/* Pills content */}
                  <div className="tab-content" id="ex1-content">
                    <div
                      className="tab-pane fade show active mt-3"
                      id="ex1-pills-1"
                      role="tabpanel"
                      aria-labelledby="ex1-tab-1"
                    >
                      <p>{product.description}</p>
                      <table className="table border mt-3 mb-2">
                        <tbody>
                          <tr>
                            <th className="py-2">CPU:</th>
                            <td className="py-2">{product.details.CPU}</td>
                          </tr>
                          <tr>
                            <th className="py-2">RAM:</th>
                            <td className="py-2">{product.details.RAM}</td>
                          </tr>
                          <tr>
                            <th className="py-2">HARDWARE:</th>
                            <td className="py-2">
                              {" "}
                              {product.details.HARDWARE}
                            </td>
                          </tr>
                          <tr>
                            <th className="py-2">COLOR</th>
                            <td className="py-2"> {product.color}</td>
                          </tr>
                          <tr>
                            <th className="py-2">CARD</th>
                            <td className="py-2">{product.details.CARD}</td>
                          </tr>
                          <tr>
                            <th className="py-2">MONITOR</th>
                            <td className="py-2">{product.details.MONITOR}</td>
                          </tr>
                          <tr>
                            <th className="py-2">PIN</th>
                            <td className="py-2">{product.details.PIN}</td>
                          </tr>
                          <tr>
                            <th className="py-2">WEIGHT</th>
                            <td className="py-2">{product.details.WEIGHT}</td>
                          </tr>
                          <tr>
                            <th className="py-2">LENGHT</th>
                            <td className="py-2">{product.details.LENGHT}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Pills content */}
                </div>
              </div>
              <div className="col-lg-4">
                <div className="px-0 border rounded-2 shadow-0">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Similar items</h5>
                      {products.map((product) => (
                        <div className="d-flex mb-3">
                          <a href="#" className="me-3">
                            <img
                              src={`http://localhost:8000/${
                                JSON.parse(product.img)[0]
                              }`}
                              style={{ minWidth: 96, height: 96 }}
                              className="img-md img-thumbnail"
                            />
                          </a>
                          <div className="info">
                            <a href="#" className="nav-link mb-1">
                              Rucksack Backpack Large <br />
                              Line Mounts
                            </a>
                            <strong className="text-dark"> $38.90</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <FootterHome />
      </div>
    </>
  );
};

export default Product_detail;
