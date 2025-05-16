import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../firebase/config";
import "../css/Admin.css";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

function Admin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [images, setImages] = useState([]); // เปลี่ยนจาก image เป็น images array
  const [uploading, setUploading] = useState(false);
  const [momentsList, setMomentsList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [memoryType, setMemoryType] = useState("place"); // เพิ่ม state สำหรับประเภทความทรงจำ
  const [existingImages, setExistingImages] = useState([]); // เพิ่ม state สำหรับรูปที่มีอยู่แล้ว
  const [activeTab, setActiveTab] = useState("add"); // เพิ่ม state สำหรับ tab
  const [sortBy, setSortBy] = useState("date"); // date, title
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");

  const memoryTypes = {
    place: "📍 สถานที่",
    birthdayEarth: "🎂 วันเกิดเอิร์ธ",
    birthdayDow: "🎂 วันเกิดดาว",
    anniversary: "💑 วันครบรอบ",
    firstMeet: "💫 วันที่เจอกัน",
    other: "💝 ความทรงจำอื่นๆ",
  };

  // ดึงข้อมูลจาก Firestore
  const fetchMoments = async () => {
    const q = await getDocs(collection(db, "moments"));
    const data = q.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMomentsList(data);
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  const uploadImages = async (files) => {
    const uploadedUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("key", "e3c404b71b9f51f503453365f1860bd7");

      try {
        const response = await axios.post(
          "https://api.imgbb.com/1/upload",
          formData
        );
        uploadedUrls.push(response.data.data.url);
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("ไม่สามารถอัพโหลดรูปภาพได้");
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // เพิ่มการตรวจสอบว่ามีการเปลี่ยนแปลงรูปภาพหรือไม่
    if (
      editingId &&
      !window.confirm("คุณต้องการบันทึกการเปลี่ยนแปลงหรือไม่?")
    ) {
      return;
    }

    // ตรวจสอบข้อมูลก่อนบันทึก
    if (!title.trim()) {
      alert("กรุณากรอกหัวข้อ");
      return;
    }
    if (!description.trim()) {
      alert("กรุณากรอกรายละเอียด");
      return;
    }
    if (!date) {
      alert("กรุณาเลือกวันที่");
      return;
    }

    try {
      setUploading(true);
      let allImageUrls = [...existingImages]; // เริ่มด้วยรูปเก่า

      if (images.length > 0) {
        const newImageUrls = await uploadImages(images);
        allImageUrls = [...allImageUrls, ...newImageUrls]; // รวมรูปเก่ากับรูปใหม่
      }

      // แปลงวันที่เป็น UTC timestamp
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      const timestamp = dateObj.getTime();

      const docData = {
        title: title.trim(),
        description: description.trim(),
        date: timestamp,
        rawDate: date, // เก็บวันที่ดิบไว้ด้วยเพื่อความสะดวกในการแก้ไข
        imageUrls: allImageUrls, // เปลี่ยนจาก imageUrl เป็น imageUrls array
        memoryType, // เพิ่มประเภทความทรงจำ
        location: location.trim(),
        coordinates:
          coordinates.lat && coordinates.lng
            ? {
                lat: parseFloat(coordinates.lat),
                lng: parseFloat(coordinates.lng),
              }
            : null,
        createdAt: new Date(),
      };

      if (editingId) {
        await updateDoc(doc(db, "moments", editingId), docData);
        alert("อัปเดตข้อมูลสำเร็จ");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "moments"), docData);
        alert("บันทึกข้อมูลสำเร็จ");
      }

      setTitle("");
      setDescription("");
      setDate("");
      setImages([]); // reset images array
      setExistingImages([]);
      setLocation("");
      setCoordinates({ lat: "", lng: "" });
      fetchMoments();
    } catch (error) {
      console.error("Error:", error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (moment) => {
    // เพิ่มการเปลี่ยน tab ก่อนที่จะ set ค่าต่างๆ
    setActiveTab("add");

    setTitle(moment.title);
    setDescription(moment.description);
    setDate(
      moment.rawDate || new Date(moment.date).toISOString().split("T")[0]
    );
    setLocation(moment.location || "");
    setCoordinates(moment.coordinates || { lat: "", lng: "" });
    setEditingId(moment.id);
    setMemoryType(moment.memoryType || "place"); // เพิ่มการ set memoryType
    setExistingImages(moment.imageUrls || []);
    setImages([]);

    // เลื่อนหน้าไปที่ด้านบน
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบข้อมูลนี้หรือไม่?")) {
      await deleteDoc(doc(db, "moments", id));
      fetchMoments();
    }
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    if (
      window.confirm(
        "คุณต้องการลบรูปภาพนี้หรือไม่? กรุณากดปุ่มอัพเดทเพื่อบันทึกการเปลี่ยนแปลง"
      )
    ) {
      setExistingImages(
        existingImages.filter((_, index) => index !== indexToRemove)
      );
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("text/plain"));
    const items = [...existingImages];
    const [reorderedItem] = items.splice(dragIndex, 1);
    items.splice(dropIndex, 0, reorderedItem);
    setExistingImages(items);
  };

  // เพิ่มฟังก์ชันย้ายรูปภาพ
  const moveImage = (index, direction) => {
    const newImages = [...existingImages];
    if (direction === "left" && index > 0) {
      [newImages[index], newImages[index - 1]] = [
        newImages[index - 1],
        newImages[index],
      ];
      setExistingImages(newImages);
    } else if (direction === "right" && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      setExistingImages(newImages);
    }
  };

  // เพิ่มฟังก์ชัน sort และ filter
  const getFilteredAndSortedMoments = () => {
    let filtered = [...momentsList];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((moment) => moment.memoryType === filterType);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (moment) =>
          moment.title.toLowerCase().includes(searchText.toLowerCase()) ||
          moment.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc" ? b.date - a.date : a.date - b.date;
      }
      // Sort by title
      return sortOrder === "desc"
        ? b.title.localeCompare(a.title)
        : a.title.localeCompare(b.title);
    });

    return filtered;
  };

  return (
    <div className="admin-form-wrapper">
      <div className="tab-container">
        <TabButton
          active={activeTab === "add"}
          onClick={() => setActiveTab("add")}
          icon="➕"
          text="เพิ่มความทรงจำ"
        />
        <TabButton
          active={activeTab === "list"}
          onClick={() => setActiveTab("list")}
          icon="📝"
          text="รายการทั้งหมด"
        />
        <TabButton
          active={activeTab === "calendar"}
          onClick={() => setActiveTab("calendar")}
          icon="📅"
          text="ปฏิทิน"
        />
      </div>

      {activeTab === "add" && (
        <div>
          <h2 className="admin-title">
            {editingId ? "แก้ไขความทรงจำ" : "เพิ่มความทรงจำใหม่"}
          </h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-section">
              <label className="form-label">หัวข้อ:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-section">
              <label className="form-label">รายละเอียด:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-section">
              <label className="form-label">วันที่:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-section">
              {/* แสดงรูปที่มีอยู่แล้ว */}
              {existingImages.length > 0 && (
                <div>
                  <label className="form-label">
                    รูปภาพที่มีอยู่: (ลากเพื่อจัดลำดับ)
                  </label>
                  <div className="existing-images-container">
                    {existingImages.map((url, index) => (
                      <div
                        key={url}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="existing-image-wrapper"
                      >
                        <img
                          src={url}
                          alt={`Existing ${index + 1}`}
                          className="existing-image"
                        />
                        <button
                          onClick={() => handleRemoveExistingImage(index)}
                          className="remove-image-button"
                        >
                          ×
                        </button>
                        <div className="image-actions">
                          <button
                            className="move-button"
                            onClick={() => moveImage(index, "left")}
                            disabled={index === 0}
                          >
                            ←
                          </button>
                          <button
                            className="move-button"
                            onClick={() => moveImage(index, "right")}
                            disabled={index === existingImages.length - 1}
                          >
                            →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ฟอร์มอัพโหลดรูปใหม่ */}
              <label className="form-label">เพิ่มรูปภาพใหม่:</label>
              <input
                type="file"
                accept="image/*"
                multiple // เพิ่ม multiple attribute
                onChange={(e) => setImages(Array.from(e.target.files))}
                className="form-input"
              />
              {images.length > 0 && (
                <small className="image-count">
                  เลือก {images.length} รูปใหม่
                </small>
              )}
            </div>
            <div className="form-section">
              <label className="form-label">ประเภทความทรงจำ:</label>
              <select
                value={memoryType}
                onChange={(e) => setMemoryType(e.target.value)}
                className="form-input"
              >
                {Object.entries(memoryTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {memoryType === "place" && (
              <>
                <div className="form-section">
                  <label className="form-label">สถานที่:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ชื่อสถานที่ เช่น ร้านอาหาร"
                    className="form-input"
                  />
                </div>
                <div className="form-section">
                  <label className="form-label">
                    พิกัด (ละติจูด, ลองจิจูด):
                  </label>
                  <div className="coordinates-container">
                    <input
                      type="number"
                      value={coordinates.lat}
                      onChange={(e) =>
                        setCoordinates({ ...coordinates, lat: e.target.value })
                      }
                      placeholder="ละติจูด"
                      className="form-input"
                    />
                    <input
                      type="number"
                      value={coordinates.lng}
                      onChange={(e) =>
                        setCoordinates({ ...coordinates, lng: e.target.value })
                      }
                      placeholder="ลองจิจูด"
                      className="form-input"
                    />
                  </div>
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={uploading}
              className="submit-button"
            >
              {uploading ? "กำลังอัพโหลด..." : editingId ? "อัพเดท" : "บันทึก"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "list" && (
        <div>
          <h2 className="admin-title">รายการความทรงจำทั้งหมด</h2>

          <div className="search-container">
            {/* Search */}
            <input
              type="text"
              placeholder="🔍 ค้นหา..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">🏷️ ทั้งหมด</option>
              {Object.entries(memoryTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="sort-select"
            >
              <option value="date-desc">📅 วันที่ล่าสุด</option>
              <option value="date-asc">📅 วันที่เก่าสุด</option>
              <option value="title-asc">📝 ชื่อ A-Z</option>
              <option value="title-desc">📝 ชื่อ Z-A</option>
            </select>
          </div>

          {getFilteredAndSortedMoments().length > 0 ? (
            getFilteredAndSortedMoments().map((moment) => (
              <div key={moment.id} className="moment-list-item">
                <h3>{moment.title}</h3>
                {moment.imageUrls && moment.imageUrls.length > 0 && (
                  <div className="image-list-container">
                    {moment.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${moment.title} ${index + 1}`}
                        className="image-list-item"
                      />
                    ))}
                  </div>
                )}
                <p>{moment.description}</p>
                <small>
                  {new Date(moment.date).toLocaleDateString("th-TH")}
                </small>
                <div className="button-container">
                  <button
                    onClick={() => handleEdit(moment)}
                    className="edit-button"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(moment.id)}
                    className="delete-button"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center" }}>ไม่พบข้อมูล</p>
          )}
        </div>
      )}

      {activeTab === "calendar" && (
        <div>
          <h2 className="admin-title">ปฏิทินความทรงจำ</h2>
          {/* Calendar component จะเพิ่มในอนาคต */}
        </div>
      )}
    </div>
  );
}

// Component สำหรับปุ่ม Tab
const TabButton = ({ active, onClick, icon, text }) => (
  <button onClick={onClick} className={`tab-button ${active ? "active" : ""}`}>
    <span>{icon}</span>
    <span>{text}</span>
  </button>
);

export default Admin;
