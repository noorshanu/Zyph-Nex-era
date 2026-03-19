import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSave, FiUser, FiHash, FiCreditCard, FiCopy, FiCheck } from "react-icons/fi";
import { usersApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await usersApi.updateProfile(formData);
      await checkAuth(); // Refresh user context
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: "40px" }}
      >
        <div
          style={{
            marginBottom: "32px",
            borderBottom: "1px solid var(--glass-border)",
            paddingBottom: "24px",
          }}
        >
          <h1
            style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}
          >
            Settings
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your account settings and profile information
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        >
          {/* Wallet Address (Read-only) */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "var(--text-secondary)",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FiCreditCard /> Wallet Address
              </span>
            </label>
            <div
              className="glass"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "12px",
                fontFamily: "monospace",
                color: "var(--text-muted)",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div style={{ overflow: "hidden", display: "flex", flex: 1 }}>
                <span className="hidden sm:block" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.walletAddress || "Not connected"}
                </span>
                <span className="block sm:hidden">
                  {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : "Not connected"}
                </span>
              </div>
              
              {user?.walletAddress && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(user.walletAddress);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "8px",
                    cursor: "pointer",
                    color: copied ? "var(--success)" : "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "16px",
                    transition: "all 0.2s"
                  }}
                  title="Copy Wallet Address"
                >
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              )}
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "6px",
              }}
            >
              Your wallet address is your unique identity and cannot be changed.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "var(--text-secondary)",
                }}
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "var(--text-secondary)",
                }}
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "var(--text-secondary)",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FiHash /> Username
              </span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a unique username"
              maxLength={30}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "16px",
              }}
            />
          </div>

          {/* Messages */}
          {error && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                color: "#86efac",
              }}
            >
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="glass-button"
              style={{
                padding: "12px 32px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary))",
                border: "none",
                color: "#000",
                fontWeight: "600",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <FiSave /> Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Settings;
