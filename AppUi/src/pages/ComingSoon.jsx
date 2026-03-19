import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiArrowLeft } from "react-icons/fi";

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-gradient-radial"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", maxWidth: "500px" }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "30px",
            background:
              "linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 40px",
            boxShadow: "var(--glow-cyan)",
          }}
        >
          <FiClock size={56} color="#000" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: "3rem",
            fontWeight: "700",
            marginBottom: "16px",
          }}
        >
          <span className="text-gradient">Coming Soon</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            color: "var(--text-muted)",
            fontSize: "1.1rem",
            lineHeight: "1.6",
            marginBottom: "40px",
          }}
        >
          We're working hard to bring you the ultimate crypto competition
          experience. This feature will be available soon!
        </motion.p>

        {/* Features coming */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ padding: "24px", marginBottom: "40px", textAlign: "left" }}
        >
          <h3
            style={{
              fontSize: "14px",
              color: "var(--cyan-primary)",
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            What's Coming
          </h3>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {[
              "Real-time crypto portfolio competitions",
              "Live leaderboards with instant rankings",
              "Skill-based matchmaking system",
              "USDC rewards for top performers",
            ].map((item, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "var(--cyan-primary)" }}>→</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="btn-secondary"
          onClick={() => navigate("/lobby")}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <FiArrowLeft size={18} />
          Back to Lobby
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
