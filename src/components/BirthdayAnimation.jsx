import React, { useEffect } from "react";
import "./BirthdayAnimation.css";

const BirthdayAnimation = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500); // เพิ่มเวลาเป็น 3.5 วินาที
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="birthday-animation">
      <div className="sparkles">
        {[...Array(20)].map(
          (
            _,
            i // เพิ่มจำนวน sparkles
          ) => (
            <div
              key={`sparkle-${i}`}
              className="sparkle"
              style={{
                "--delay": `${i * 0.15}s`, // ปรับจังหวะการแสดง
                "--angle": `${i * 18}deg`, // กระจายให้ทั่วมากขึ้น
              }}
            />
          )
        )}
      </div>
      <div className="stars">
        {[...Array(15)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="star"
            style={{
              "--delay": `${i * 0.2}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="hearts">
        {[...Array(10)].map((_, i) => (
          <div
            key={`heart-${i}`}
            className="heart"
            style={{
              "--delay": `${i * 0.3}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="confetti">
        {[...Array(20)].map((_, i) => (
          <div
            key={`confetti-${i}`}
            className="confetti-piece"
            style={{
              "--delay": `${i * 0.1}s`,
              "--angle": `${Math.random() * 360}deg`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="balloons">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="balloon"
            style={{
              "--delay": `${i * 0.2}s`,
              "--x-offset": `${-50 + i * 25}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BirthdayAnimation;
