import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProductModal = ({ show, handleClose }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [color, setColor] = useState("");
  const [img, setImg] = useState([null, null, null, null, null]);
  const [categories, setCategories] = useState([]);
  const [categories_id, setCategories_id] = useState("");
  const [previews, setPreviews] = useState([null, null, null, null, null]);
  const fileInputRefs = useRef([]);

  // State for product details
  const [cpu, setCpu] = useState("");
  const [ram, setRam] = useState("");
  const [hardware, setHardware] = useState("");
  const [card, setCard] = useState("");
  const [monitor, setMonitor] = useState("");
  const [pin, setPin] = useState("");
  const [weight, setWeight] = useState("");
  const [material, setMaterial] = useState("");
  const [length, setLength] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/getcate");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  const handleButtonClick = (index) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].click();
    }
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image")) {
      const newImages = [...img];
      newImages[index] = file;
      setImg(newImages);

      const newPreviews = [...previews];
      newPreviews[index] = URL.createObjectURL(file);
      setPreviews(newPreviews);
    } else {
      console.error("Invalid file selected.");
      toast.error("Please select a valid image file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("color", color);
      formData.append("quantity", quantity);
      formData.append("categories_id", categories_id);

      img.forEach((image, index) => {
        if (image) {
          formData.append(`img[${index}]`, image);
        }
      });

      // Append product details based on category
      if (categories_id === "1") {
        formData.append("CPU", cpu);
        formData.append("RAM", ram);
        formData.append("HARDWARE", hardware);
        formData.append("CARD", card);
        formData.append("PIN", pin);
        formData.append("MONITOR", monitor);
        formData.append("WEIGHT", weight);
        formData.append("MATERRIAL", material);
        formData.append("LENGHT", length);
      }

      await axios.post("http://localhost:8000/api/addproducts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product added successfully!");
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add product. Please try again!");
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Add Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">
                    Price
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter product price"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="color" className="form-label">
                    Color
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Enter product color"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter product material"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    type="text"
                    className="form-control"
                    id="sizepd"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product size"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="categories_id" className="form-label">
                    Categories
                  </label>
                  <select
                    className="form-control"
                    id="categories_id"
                    value={categories_id}
                    onChange={(e) => setCategories_id(e.target.value)}
                  >
                    <option value="">Chọn danh mục sản phẩm</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3 mt-2">
                  <label htmlFor="img" className="form-label"></label>
                  <input
                    type="file"
                    className="form-control"
                    id="img"
                    onChange={(e) => handleFileChange(e, 0)}
                    ref={(el) => (fileInputRefs.current[0] = el)}
                    style={{ display: "none" }}
                  />
                  <div
                    className="file-input-frame"
                    style={{
                      width: "auto",
                      height: "500px",
                      border: "2px dashed #ccc",
                      borderRadius: "5px",
                      cursor: "pointer",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => handleButtonClick(0)}
                  >
                    {previews[0] ? (
                      <img
                        src={previews[0]}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                        }}
                      />
                    ) : (
                      <div className="file-input-label">
                        Please Choose File Image
                      </div>
                    )}
                  </div>
                </div>
                {/* Additional image upload fields */}
                <div className="row">
                  {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="col-3">
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => handleFileChange(e, index)}
                        style={{ display: "none" }}
                        ref={(el) => (fileInputRefs.current[index] = el)}
                      />
                      <div
                        className="file-input-frame mr-3 mb-3"
                        style={{
                          width: "auto",
                          height: "200px",
                          border: "2px dashed #ccc",
                          borderRadius: "5px",
                          cursor: "pointer",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => handleButtonClick(index)}
                      >
                        {previews[index] ? (
                          <img
                            src={previews[index]}
                            alt={`Preview ${index}`}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                            }}
                          />
                        ) : (
                          <div className="file-input-label">
                            Please Choose File Image
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {categories_id === "1" && (
              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="cpu" className="form-label">
                      CPU
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="cpu"
                      value={cpu}
                      onChange={(e) => setCpu(e.target.value)}
                      placeholder="Enter CPU"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ram" className="form-label">
                      RAM
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="ram"
                      value={ram}
                      onChange={(e) => setRam(e.target.value)}
                      placeholder="Enter RAM"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="hardware" className="form-label">
                      Hardware
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="hardware"
                      value={hardware}
                      onChange={(e) => setHardware(e.target.value)}
                      placeholder="Enter Hardware"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="card" className="form-label">
                      Card
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="card"
                      value={card}
                      onChange={(e) => setCard(e.target.value)}
                      placeholder="Enter Card"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="pin" className="form-label">
                      Pin
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="pin"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter Pin"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="monitor" className="form-label">
                      Monitor
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="monitor"
                      value={monitor}
                      onChange={(e) => setMonitor(e.target.value)}
                      placeholder="Enter Monitor"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="weight" className="form-label">
                      Weight
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter Weight"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="length" className="form-label">
                      Length
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="length"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="Enter Length"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="text-center mt-3">
              <Button variant="primary" type="submit">
                Add Product
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddProductModal;
