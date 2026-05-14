import React, { useEffect, useState, useMemo, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/Home.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import Swal from "sweetalert2";
import BirthdayAnimation from "../components/BirthdayAnimation";
import Modal from "../components/common/Modal";
import { calculateNextAnnual, calculateNextMonthly } from "../utils/dateUtils";
import { useMoments } from "../hooks/useMoments";
import { useGridMoments } from "../hooks/useGridMoments";

// แก้ไขไอคอน marker ของ Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function Home() {
  // Data hooks
  const { moments: allMoments } = useMoments();
  const { gridSettings, gridMoments } = useGridMoments();

  // UI state
  const [moments, setMoments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const defaultCenter = [13.7563, 100.5018];

  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const [showBirthdayAnimation, setShowBirthdayAnimation] = useState(false);
  const [modalType, setModalType] = useState(null);

  const handleSwipe = (direction) => {
    if (transitioning) return;

    const canSwipe =
      direction === "left"
        ? currentIndex < selectedImages.length - 1
        : currentIndex > 0;

    if (!canSwipe) return;

    setTransitioning(true);

    setTimeout(() => {
      setCurrentIndex((prev) => (direction === "left" ? prev + 1 : prev - 1));
      setTransitioning(false);
    }, 300);
  };

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEnd.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const diff = touchStart.current - touchEnd.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      handleSwipe(diff > 0 ? "left" : "right");
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

  const getStackItems = () => {
    return [0, 1, 2]
      .map((offset) => {
        const index = currentIndex + offset;
        if (index >= selectedImages.length) return null;

        const position = offset === 0 ? "current" : `next-${offset}`;

        return (
          <div
            key={index}
            className={`stack-item ${position} ${
              transitioning && offset === 0
                ? `exit-${
                    touchEnd.current > touchStart.current ? "right" : "left"
                  }`
                : ""
            }`}
          >
            <img src={selectedImages[index]} alt={`${index + 1}`} />
          </div>
        );
      })
      .filter(Boolean);
  };

  useEffect(() => {
    // Show welcome alert once on mount
    const showWelcomeAlert = async () => {
      await Swal.fire({
        title: "Are you ready?",
        text: "พร้อมชมความน่ารักของคู่ผมหรือยังคับ!",
        imageUrl: "https://media.giphy.com/media/M8o1MOwcwsWOmueqN4/giphy.gif",
        imageWidth: 200,
        imageHeight: 200,
        confirmButtonText: "Yes, I'm ready!",
        confirmButtonColor: "#ff4081",
        background: "#fff",
        borderRadius: "15px",
      });
    };

    showWelcomeAlert();
  }, []);

  // Filter today's moments when allMoments updates
  useEffect(() => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).getTime();

    const todayMoments = allMoments.filter(
      (moment) => moment.date >= startOfDay && moment.date <= endOfDay
    );
    setMoments(todayMoments);
  }, [allMoments]);

  // เพิ่ม effect สำหรับจัดการ body scroll
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // Cleanup เมื่อ component unmount
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showModal]);

  // ฟังก์ชันจัดการเมื่อเลือกวันที่
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      // กรองข้อมูลตามวันที่เลือก
      const startOfDay = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const endOfDay = new Date(date.setHours(23, 59, 59, 999)).getTime();

      const filteredMoments = allMoments.filter(
        (moment) => moment.date >= startOfDay && moment.date <= endOfDay
      );
      setMoments(filteredMoments);
    } else {
      // ถ้าไม่ได้เลือกวันที่ แสดงข้อมูลทั้งหมด
      setMoments(allMoments);
    }
  };

  // ฟังก์ชันเช็คว่าวันที่นั้นมีข้อมูลหรือไม่
  const tileContent = ({ date }) => {
    const hasContent = allMoments.some((moment) => {
      const momentDate = new Date(moment.date);
      return momentDate.toDateString() === date.toDateString();
    });
    return hasContent ? <div className="has-content">•</div> : null;
  };

  // กรองเฉพาะสถานที่ที่มีพิกัด
  const locations = useMemo(() => {
    return allMoments
      .filter((moment) => moment.location && moment.coordinates)
      .map((moment) => ({
        position: [moment.coordinates.lat, moment.coordinates.lng],
        title: moment.location,
        description: moment.description,
        images: moment.imageUrls || (moment.imageUrl ? [moment.imageUrl] : []), // แก้ไขตรงนี้
        date: new Date(moment.date).toLocaleDateString("th-TH"),
        id: moment.id,
      }));
  }, [allMoments]);

  const getGoogleMapsUrl = (location) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location
    )}`;
  };

  const getMemoryIcon = (type) => {
    const icons = {
      place: "📍",
      birthday: "🎂",
      anniversary: "💑",
      firstMeet: "💫",
      other: "💝",
    };
    return icons[type] || "💝";
  };

  const calculateCountdown = (dateString) => {
    if (!dateString) return null;

    const today = new Date();
    const originalDate = new Date(dateString);

    // สร้างวันที่ครบรอบในเดือนนี้
    let nextAnniversary = new Date(
      today.getFullYear(),
      today.getMonth(),
      originalDate.getDate()
    );

    // ถ้าวันครบรอบเดือนนี้ผ่านไปแล้ว ให้เลื่อนไปเดือนหน้า
    if (today > nextAnniversary) {
      nextAnniversary = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        originalDate.getDate()
      );
    }

    const diffTime = nextAnniversary - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateDuration = (dateString) => {
    if (!dateString) return null;

    const start = new Date(dateString);
    const today = new Date();

    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    // ปรับวันที่ถ้าวันปัจจุบันน้อยกว่าวันที่เริ่ม
    if (today.getDate() < start.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }

    return { years, months };
  };

  const calculateAnnualCountdown = (dateString) => {
    if (!dateString) return null;

    const today = new Date();
    const date = new Date(dateString);

    // ตั้งปีของวันครบรอบให้เป็นปีปัจจุบัน
    const anniversaryThisYear = new Date(date);
    anniversaryThisYear.setFullYear(today.getFullYear());

    // ถ้าวันครบรอบปีนี้ผ่านไปแล้ว ให้คำนวณปีหน้า
    if (anniversaryThisYear < today) {
      anniversaryThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = anniversaryThisYear - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nextYear = anniversaryThisYear.getFullYear() - date.getFullYear();

    return { days: diffDays, year: nextYear };
  };

  const getImportantDates = useMemo(() => {
    const dateTypes = [
      "birthdayEarth",
      "birthdayDow",
      "anniversary",
      "firstMeet",
    ];
    const result = {};

    allMoments.forEach((moment) => {
      if (dateTypes.includes(moment.memoryType) && !result[moment.memoryType]) {
        const duration = calculateDuration(moment.rawDate);
        const annualCountdown = calculateAnnualCountdown(moment.rawDate);
        result[moment.memoryType] = {
          date: new Date(moment.date).toLocaleDateString("th-TH"),
          title: moment.title,
          type: moment.memoryType,
          duration,
          countdown: calculateCountdown(moment.rawDate),
          annualCountdown,
        };
      }
    });

    return result;
  }, [allMoments]);

  // ลบตัวแปรที่ไม่ได้ใช้ออก:
  // const dateCards = { ... }
  // const handleShowDowImages = () => { ... }
  // const handleShowAnniversaryImages = () => { ... }

  // เพิ่มฟังก์ชันสำหรับเรียง grid
  const getOrderedGridItems = () => {
    if (!gridSettings) return [];
    return Object.entries(gridSettings).sort(([keyA], [keyB]) => {
      // เรียงตาม grid number (grid1, grid2, grid3, grid4)
      const numA = parseInt(keyA.replace("grid", ""));
      const numB = parseInt(keyB.replace("grid", ""));
      return numA - numB;
    });
  };

  const handleGridClick = (moment) => {
    if (!moment.imageUrls || moment.imageUrls.length === 0) return;

    setSelectedImages(moment.imageUrls);
    setModalType(moment.memoryType);
    setCurrentIndex(0);

    // เพิ่มแอนิเมชันสำหรับ birthdayDow
    if (moment.memoryType === "birthdayDow") {
      setShowBirthdayAnimation(true);
    }

    setShowModal(true);
  };

  return (
    <div className="home-container">
      {showBirthdayAnimation && (
        <BirthdayAnimation onComplete={() => setShowBirthdayAnimation(false)} />
      )}
      {showModal && (
        <Modal
          title={
            <>
              <span>
                {modalType === "anniversary" ? "Story 💕" : "Daw Day"}
              </span>{" "}
              💫
              <div
                style={{
                  fontSize: "14px",
                  color: "#ff4081",
                  marginTop: "5px",
                  fontWeight: "bold",
                }}
              >
                {modalType === "anniversary"
                  ? `${getImportantDates["anniversary"]?.duration.years} Y ${getImportantDates["anniversary"]?.duration.months} M`
                  : modalType === "birthdayDow"
                  ? `${getImportantDates["birthdayDow"]?.date} | ${getImportantDates["birthdayDow"]?.duration.years}Y`
                  : ""}
              </div>
            </>
          }
          onClose={() => setShowModal(false)}
        >
          <div
            className="photo-viewer"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="photo-counter">
              {currentIndex + 1} / {selectedImages.length}
            </div>
            <div className="photo-stack">{getStackItems()}</div>
          </div>
        </Modal>
      )}

      <h1 className="home-title">💞 Earth & Daw 💓</h1>

      <div className="important-dates-grid">
        {gridSettings &&
          getOrderedGridItems().map(([gridKey, gridData]) => {
            const moment = gridMoments[gridKey];
            if (!moment) return null;

            const duration = calculateDuration(moment.date);
            const daysToAnnual = calculateNextAnnual(moment.date);
            const daysToMonthly = calculateNextMonthly(moment.date);

            return (
              <div
                key={gridKey}
                className="date-card"
                onClick={() => handleGridClick(moment)}
                style={{ cursor: "pointer" }}
              >
                {gridData.alertText && (
                  <div className="alert-badge">{gridData.alertText}</div>
                )}
                <div className="emoji">
                  {moment.memoryType === "place"
                    ? "📍"
                    : moment.memoryType === "birthdayEarth"
                    ? "🎂"
                    : moment.memoryType === "birthdayDow"
                    ? "🎂"
                    : moment.memoryType === "anniversary"
                    ? "💑"
                    : moment.memoryType === "firstMeet"
                    ? "💫"
                    : "💝"}
                </div>
                <h3 className="title">{moment.title}</h3>
                <p className="date">
                  {new Date(moment.date).toLocaleDateString("th-TH")}
                </p>

                {gridData.showDuration && (
                  <p className="duration">
                    {duration.years > 0 && `${duration.years} ปี `}
                    {duration.months > 0 && `${duration.months} เดือน`}
                    {duration.years === 0 &&
                      duration.months === 0 &&
                      "น้อยกว่า 1 เดือน"}
                  </p>
                )}

                {gridData.showNextMonth && (
                  <p className="monthly-countdown">
                    อีก {daysToMonthly} วัน จะครบรอบเดือน
                  </p>
                )}

                {gridData.showNextAnnual && (
                  <p className="annual-countdown">
                    อีก {daysToAnnual} วัน จะครบรอบปี
                  </p>
                )}
              </div>
            );
          })}
      </div>

      <div className="map-container">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: "400px", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {locations.map((location) => (
            <Marker key={location.id} position={location.position}>
              <Popup>
                <div style={{ maxWidth: "180px" }}>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>
                    <a
                      href={getGoogleMapsUrl(location.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#ff4081",
                        textDecoration: "none",
                      }}
                    >
                      📍 {location.title}
                    </a>
                  </h3>
                  {location.images && location.images.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        overflowX: "auto",
                        gap: "5px",
                        margin: "5px 0",
                      }}
                    >
                      {location.images.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={location.title}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: "12px",
                      margin: "5px 0",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {location.description}
                  </p>
                  <small style={{ color: "#666", fontSize: "11px" }}>
                    {location.date}
                  </small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="home-calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          locale="th-TH"
        />
      </div>

      {moments.length > 0 ? (
        moments.map((moment) => (
          <div key={moment.id} className="home-moment-card">
            <h2>
              {getMemoryIcon(moment.memoryType)} {moment.title}
            </h2>
            {moment.imageUrls && moment.imageUrls.length > 0 && (
              <div className="image-gallery">
                {moment.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${moment.title} ${index + 1}`}
                  />
                ))}
              </div>
            )}
            {moment.imageUrl && (
              <img src={moment.imageUrl} alt={moment.title} />
            )}
            <p>{moment.description}</p>
            {moment.location && moment.memoryType === "place" && (
              <div className="location-info">
                <p>
                  📍{" "}
                  <a
                    href={getGoogleMapsUrl(moment.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#ff4081",
                      textDecoration: "none",
                    }}
                  >
                    {moment.location}
                  </a>
                </p>
              </div>
            )}
            <small>{new Date(moment.date).toLocaleDateString("th-TH")}</small>
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center" }}>ไม่พบข้อมูลในวันที่เลือก</p>
      )}
    </div>
  );
}

export default Home;
