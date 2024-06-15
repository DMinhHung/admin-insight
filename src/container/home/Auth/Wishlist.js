import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import HeaderHome from "../../../components/home/HeaderHome";
import FootterHome from "../../../components/home/FootterHome";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/getwishlist"
        );
        setWishlist(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
    fetchData();
  });

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
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/deletewishlist/${id}`); 
      toast.success("Xóa thanh cong");
    } catch (error) {
      toast.error("Xóa that bai");
    }
  };

  console.log(wishlist);

  return (
    <>
      <HeaderHome />
      <Container
        style={{ minHeight: "100vh", position: "relative", marginTop: "100px" }}
      >
        {isLoading ? (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <ThreeDots color="#007bff" height={80} width={80} />
          </div>
        ) : error ? (
          <Alert
            variant="danger"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {error}
          </Alert>
        ) : (
          <Row className="justify-content-center">
            <Col md={4}>
              <Card>
                <Card.Body className="">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                      <a href="/profile">Thông tin</a>
                    </li>
                    <li class="list-group-item">
                      <a href="/wishlist">Sản phẩm yêu thích</a>
                    </li>
                    <li class="list-group-item">
                      <a href="/bill">Hóa đơn</a>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={8}>
              <Card>
                <Card.Body>
                  <Form>
                    <div className="row">
                      {wishlist.map((item) => (
                        <div className="col-4">
                          <div className="card w-100 my-2 shadow-2-strong">
                            <Link to={`/product_detail/`}>
                              <img
                                src={`http://localhost:8000/${
                                  JSON.parse(item.product.img)[0]
                                }`}
                                className="card-img-top"
                              />
                            </Link>
                            <div className="card-body d-flex flex-column">
                              <h5 className="card-title">
                                {item.product.name}
                              </h5>
                              <p className="card-text">{item.product.price}</p>
                              <div
                                style={{ backgroundColor: "white" }}
                                className="card-footer d-flex align-items-end pt-3 px-0 pb-0 mt-auto"
                              >
                                <a
                                  href="#!"
                                  style={{ height: 39 }}
                                  className="btn btn-primary shadow-0 me-1 fw-bold"
                                  onClick={() =>
                                    addToCart(
                                      item.product.id,
                                      1,
                                      item.product.price
                                    )
                                  }
                                >
                                  Add to cart
                                </a>
                                <a
                                  className="btn btn-light border px-2 pt-2 icon-hover"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <i className="fas fa-heart fa-lg text-secondary px-1" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
      <FootterHome />
    </>
  );
};

export default Wishlist;
