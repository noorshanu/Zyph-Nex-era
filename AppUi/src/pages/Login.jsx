import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/lobby"); // Go directly to lobby after login
    } catch (err) {
      setError(err.message || "Login failed");
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
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: "420px", padding: "48px 40px" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <FiTrendingUp size={32} color="#000" />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            ADMIN LOGIN
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Dashboard access for administrators
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
              color: "var(--danger)",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </motion.div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <input
              type="email"
              className="input-glass"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              type="password"
              className="input-glass"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <motion.button
            type="submit"
            className="btn-primary"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "14px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Continue with Email"}
          </motion.button>
        </form>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            or connect web3 wallet
          </p>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "32px",
            color: "var(--text-muted)",
            fontSize: "14px",
          }}
        >
          Don't have an account?{" "}
          <Link to="/admin/signup" className="link">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
