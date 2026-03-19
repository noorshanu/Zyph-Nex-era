import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheck, FiShield, FiAward, FiTrendingUp } from "react-icons/fi";
import { usersApi } from "../services/api";

const Onboarding = () => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: FiTrendingUp,
      title: "Skill-Based Competition",
      desc: "Compete based on market analysis, not luck",
    },
    {
      icon: FiAward,
      title: "Earn Rewards",
      desc: "Top performers share the prize pool",
    },
    {
      icon: FiShield,
      title: "Virtual Capital",
      desc: "Real crypto performance, zero risk",
    },
  ];

  const handleContinue = async () => {
    setLoading(true);
    try {
      await usersApi.completeOnboarding();
      navigate("/practice");
    } catch (err) {
      console.error("Onboarding error:", err);
      navigate("/practice");
    } finally {
      setLoading(false);
    }
  };

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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: "480px", padding: "48px 40px" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "var(--glow-cyan)",
            }}
          >
            <FiTrendingUp size={40} color="#000" />
          </motion.div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            ZYPHNEX
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Skill-based market competition
          </p>
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "var(--cyan-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <feature.icon
                  size={22}
                  style={{ color: "var(--cyan-primary)" }}
                />
              </div>
              <div>
                <p
                  style={{
                    fontWeight: "600",
                    marginBottom: "2px",
                    fontSize: "14px",
                  }}
                >
                  {feature.title}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Terms Checkbox */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => setAgreed(!agreed)}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            marginBottom: "24px",
            cursor: "pointer",
            padding: "16px",
            background: agreed ? "var(--cyan-subtle)" : "transparent",
            border: `1px solid ${agreed ? "var(--cyan-primary)" : "var(--glass-border)"}`,
            borderRadius: "var(--radius-md)",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              border: agreed ? "none" : "2px solid var(--glass-border)",
              background: agreed ? "var(--cyan-primary)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "2px",
              transition: "all 0.2s",
            }}
          >
            {agreed && <FiCheck size={14} color="#000" />}
          </div>
          <span
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: "1.5",
            }}
          >
            I understand this is a skill-based competition platform, not a
            trading or gambling service. I agree to the Terms of Service.
          </span>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          className="btn-primary"
          disabled={!agreed || loading}
          onClick={handleContinue}
          whileHover={{ scale: agreed && !loading ? 1.02 : 1 }}
          whileTap={{ scale: agreed && !loading ? 0.98 : 1 }}
          style={{ width: "100%", padding: "14px", opacity: !agreed ? 0.5 : 1 }}
        >
          {loading ? "Please wait..." : "Continue to Practice"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Onboarding;
