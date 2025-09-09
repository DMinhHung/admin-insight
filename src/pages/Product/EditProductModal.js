import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditProductModal = ({
  show,
  handleClose,
  product = {},
  handleUpdate,
}) => {
  const [editedName, setEditedName] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedQuantity, setEditedQuantity] = useState("");
  const [editedColor, setEditedColor] = useState("");
  const [editedImages, setEditedImages] = useState([]);
  const [editedCategories, setEditedCategories] = useState("");
  const [previews, setPreviews] = useState([null, null, null, null, null]);
  const fileInputRefs = useRef([]);
  const [categories, setCategories] = useState([]);

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


  useEffect(() => {
    if (product) {

      setEditedName(product.name || "");
      setEditedPrice(product.price || "");
      setEditedDescription(product.description || "");
      setEditedQuantity(product.quantity || "");
      setEditedColor(product.color || "");
      setEditedCategories(product.categories_id || "");
      const imgArray = product.img ? JSON.parse(product.img) : [];
      setEditedImages(imgArray);
      setPreviews(
        imgArray.map((img) =>
          typeof img === "string" ? `http://localhost:8000/${img}` : null
        )
      );
      

      if (product.categories_id === "1") {
        setCpu(product.CPU || "");
        setRam(product.RAM || "");
        setHardware(product.HARDWARE || "");
        setCard(product.CARD || "");
        setMonitor(product.MONITOR || "");
        setPin(product.PIN || "");
        setWeight(product.WEIGHT || "");
        setMaterial(product.MATERRIAL || "");
        setLength(product.LENGHT || "");
      }
    }
  }, [product]);

  const handleButtonClick = (index) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].click();
    }
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image")) {
      const newImages = [...editedImages];
      newImages[index] = file;
      setEditedImages(newImages);

      const newPreviews = [...previews];
      newPreviews[index] = URL.createObjectURL(file);
      setPreviews(newPreviews);
    } else {
      console.error("Invalid file selected.");
      toast.error("Please select a valid image file.");
    }
  };

  console.log("Check" + editedCategories);

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", editedName);
      formData.append("price", editedPrice);
      formData.append("description", editedDescription);
      formData.append("color", editedColor);
      formData.append("quantity", editedQuantity);
      formData.append("categories_id", editedCategories);

      editedImages.forEach((image, index) => {
        formData.append(`img[${index}]`, image);
      });

      if (editedCategories === "1") {
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

      await axios.post(
        `http://localhost:8000/api/updateproducts/${product.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Product updated successfully!");
      handleClose();
      handleUpdate(product.id, {
        ...product,
        name: editedName,
        price: editedPrice,
        description: editedDescription,
        quantity: editedQuantity,
        color: editedColor,
        categories_id: editedCategories,
        img: editedImages,
        CPU: cpu,
        RAM: ram,
        HARDWARE: hardware,
        CARD: card,
        PIN: pin,
        MONITOR: monitor,
        WEIGHT: weight,
        MATERRIAL: material,
        LENGHT: length,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update product. Please try again!");
    }
  };
  console.log(product);
  return (
    <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmitEdit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="editedName" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="editedName"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter product name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editedPrice" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="editedPrice"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  placeholder="Enter product price"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editedDescription" className="form-label">
                  Description
                </label>
                <textarea
                  rows={5}
                  type="text"
                  className="form-control"
                  id="editedDescription"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter product description"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editedQuantity" className="form-label">
                  Quantity
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="editedQuantity"
                  value={editedQuantity}
                  onChange={(e) => setEditedQuantity(e.target.value)}
                  placeholder="Enter product quantity"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editedColor" className="form-label">
                  Color
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="editedColor"
                  value={editedColor}
                  onChange={(e) => setEditedColor(e.target.value)}
                  placeholder="Enter product color"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="categories_id" className="form-label">
                  Categories
                </label>
                <select
                  className="form-control"
                  id="categories_id"
                  value={editedCategories}
                  onChange={(e) => setEditedCategories(e.target.value)}
                >
                  <option value="">Chọn danh mục sản phẩm</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.categories_id}>
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
              <div className="row">
                {[...Array(4).keys()].map((index) => (
                  <div key={index} className="col-3">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e, index + 1)}
                      style={{ display: "none" }}
                      ref={(el) => (fileInputRefs.current[index + 1] = el)}
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
                      onClick={() => handleButtonClick(index + 1)}
                    >
                      {previews[index + 1] ? (
                        <img
                          src={previews[index + 1]}
                          alt={`Preview ${index + 1}`}
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
          {editedCategories === "1" && (
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
          <div className="text-center">
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProductModal;
