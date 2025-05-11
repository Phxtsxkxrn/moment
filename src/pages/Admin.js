import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../firebase/config";
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
    setTitle(moment.title);
    setDescription(moment.description);
    // ใช้ rawDate ถ้ามี หรือแปลงจาก timestamp ถ้าไม่มี
    setDate(
      moment.rawDate || new Date(moment.date).toISOString().split("T")[0]
    );
    setLocation(moment.location || "");
    setCoordinates(moment.coordinates || { lat: "", lng: "" });
    setEditingId(moment.id);
    setExistingImages(moment.imageUrls || []); // เก็บรูปเก่าไว้
    setImages([]); // รีเซ็ตรูปใหม่
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

  return (
    <div style={{ padding: "15px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>
        {editingId ? "แก้ไขความทรงจำ" : "เพิ่มความทรงจำ"}
      </h1>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            หัวข้อ:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            รายละเอียด:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              minHeight: "100px",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            วันที่:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          {/* แสดงรูปที่มีอยู่แล้ว */}
          {existingImages.length > 0 && (
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>
                รูปภาพที่มีอยู่: (ลากเพื่อจัดลำดับ)
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                {existingImages.map((url, index) => (
                  <div
                    key={url}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    style={{ position: "relative" }}
                  >
                    <img
                      src={url}
                      alt={`Existing ${index + 1}`}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        cursor: "move",
                      }}
                    />
                    <button
                      onClick={() => handleRemoveExistingImage(index)}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        background: "#ff4081",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ฟอร์มอัพโหลดรูปใหม่ */}
          <label style={{ display: "block", marginBottom: "5px" }}>
            เพิ่มรูปภาพใหม่:
          </label>
          <input
            type="file"
            accept="image/*"
            multiple // เพิ่ม multiple attribute
            onChange={(e) => setImages(Array.from(e.target.files))}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          {images.length > 0 && (
            <small style={{ color: "#666" }}>
              เลือก {images.length} รูปใหม่
            </small>
          )}
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            ประเภทความทรงจำ:
          </label>
          <select
            value={memoryType}
            onChange={(e) => setMemoryType(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
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
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                สถานที่:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ชื่อสถานที่ เช่น ร้านอาหาร"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                พิกัด (ละติจูด, ลองจิจูด):
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="number"
                  value={coordinates.lat}
                  onChange={(e) =>
                    setCoordinates({ ...coordinates, lat: e.target.value })
                  }
                  placeholder="ละติจูด"
                  style={{
                    width: "50%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
                <input
                  type="number"
                  value={coordinates.lng}
                  onChange={(e) =>
                    setCoordinates({ ...coordinates, lng: e.target.value })
                  }
                  placeholder="ลองจิจูด"
                  style={{
                    width: "50%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            </div>
          </>
        )}
        <button
          type="submit"
          disabled={uploading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#ff4081",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? "กำลังอัพโหลด..." : editingId ? "อัพเดท" : "บันทึก"}
        </button>
      </form>

      <hr style={{ margin: "30px 0" }} />

      <h2 style={{ textAlign: "center" }}>รายการความทรงจำทั้งหมด</h2>
      {momentsList.length > 0 ? (
        momentsList.map((moment) => (
          <div
            key={moment.id}
            style={{
              marginBottom: "15px",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              margin: "10px 0",
            }}
          >
            <h3>{moment.title}</h3>
            {moment.imageUrls && moment.imageUrls.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  padding: "10px 0",
                }}
              >
                {moment.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${moment.title} ${index + 1}`}
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            )}
            <p>{moment.description}</p>
            <small>{new Date(moment.date).toLocaleDateString("th-TH")}</small>
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => handleEdit(moment)}
                style={{
                  marginRight: "10px",
                  padding: "6px 10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                แก้ไข
              </button>
              <button
                onClick={() => handleDelete(moment.id)}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                ลบ
              </button>
            </div>
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center" }}>ไม่มีข้อมูล</p>
      )}
    </div>
  );
}

export default Admin;
