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
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import HeaderHome from "../../../components/home/HeaderHome";
import FootterHome from "../../../components/home/FootterHome";
import { toast } from 'react-toastify';

const EditProfile = () => {
  const [user, setUser] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [phone, setPhone] = useState();
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userid");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/getusers/${userId}`
        );
        setUser(response.data);
        setName(response.data.name || "");
        setEmail(response.data.email || "");
        setPhone(response.data.phone || "");
        setAddress(response.data.address || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Unable to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, [userId]);
  console.log(user);

  const handleUpdateProfile = async () => {
    try {
      const updatedData = {};
      if (name !== user.name) {
        updatedData.name = name;
      } else {
        updatedData.name = user.name;
      }
      if (email !== user.email) {
        updatedData.email = email;
      } else {
        updatedData.email = user.email;
      }
      if (phone !== user.phone) {
        updatedData.phone = phone;
      } else {
        updatedData.phone = user.phone;
      }
      if (address !== user.address) {
        updatedData.address = address;
      } else {
        updatedData.address = user.address;
      }
      console.log(updatedData);
      const response = await axios.post(
        `http://localhost:8000/api/update/${userId}`,
        updatedData
      );
      console.log(response.data);
      toast.success("Thay đổi thông tin thành công");
      localStorage.setItem("username", name);
      } catch (error) {
        console.error("Error posting data:", error);
        toast.error("Thay đổi thông tin thất bại");
    }
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    axios
      .post(`http://localhost:8000/api/avatar/${userId}`, formData)
      .then((response) => {
        console.log(response.data);
        setAvatar(URL.createObjectURL(file));
        toast.success("Ảnh đã được thay đổi");
      })
      .catch((error) => {
        console.error("Error uploading avatar:", error);
        toast.error("Ảnh thay đổi thất bại!");

      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      name === user.name &&
      email === user.email &&
      phone === user.phone &&
      address === user.address
    ) {
      console.log("No changes made. Sending old data to server.");
      return;
    }

    handleUpdateProfile();
  };
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
                  <label htmlFor="avatarInput">
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        border: "2px solid #ccc",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        overflow: "hidden",
                        margin: "0 auto 20px",
                        marginLeft: "300px",
                      }}
                    >
                      <>
                        <img
                          src={
                            avatar ||
                            `http://localhost:8000/avatars/${user.image}`
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="avatarInput"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                  <Form onSubmit={handleSubmit}>
                    <Form.Group
                      as={Row}
                      className="mt-3 mb-3"
                      controlId="formBasicName"
                    >
                      <Form.Label column md={4}>
                        Name
                      </Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Enter name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group
                      as={Row}
                      className="mt-3 mb-3"
                      controlId="formBasicEmail"
                    >
                      <Form.Label column md={4}>
                        Email
                      </Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group
                      as={Row}
                      className="mt-3 mb-3"
                      controlId="formBasicPhone"
                    >
                      <Form.Label column md={4}>
                        Phone
                      </Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Enter phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group
                      as={Row}
                      className="mt-3 mb-3"
                      controlId="formBasicAddress"
                    >
                      <Form.Label column md={4}>
                        Address
                      </Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Enter address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </Col>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mt-3">
                      Save Changes
                    </Button>
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

export default EditProfile;
