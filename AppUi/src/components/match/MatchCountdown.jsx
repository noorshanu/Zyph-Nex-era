import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const MatchCountdown = ({ targetTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetTime) - new Date();

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  const formatNumber = (num) => String(num).padStart(2, "0");

  return (
    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
      {[
        { value: timeLeft.hours, label: "HRS" },
        { value: timeLeft.minutes, label: "MIN" },
        { value: timeLeft.seconds, label: "SEC" },
      ].map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card"
          style={{
            padding: "16px 20px",
            textAlign: "center",
            minWidth: "80px",
          }}
        >
          <motion.p
            key={item.value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              marginBottom: "4px",
            }}
            className="text-gradient"
          >
            {formatNumber(item.value)}
          </motion.p>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              letterSpacing: "1px",
            }}
          >
            {item.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default MatchCountdown;
