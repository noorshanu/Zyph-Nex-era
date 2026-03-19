import { motion } from "framer-motion";
import { FiHome, FiBarChart2, FiSettings, FiUsers } from "react-icons/fi";

const Dashboard = () => {
  const stats = [
    { icon: FiUsers, label: "Total Users", value: "2,543", color: "#3b82f6" },
    { icon: FiBarChart2, label: "Analytics", value: "12.5K", color: "#60a5fa" },
    { icon: FiHome, label: "Projects", value: "24", color: "#818cf8" },
    { icon: FiSettings, label: "Tasks", value: "89", color: "#a78bfa" },
  ];

  return (
    <div style={{ padding: "32px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}
        >
          Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
          Welcome back! Here's what's happening.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="glass-card"
            style={{ padding: "24px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                  border: `1px solid ${stat.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  {stat.label}
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="glass-card"
        style={{ marginTop: "32px", padding: "24px" }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "16px",
          }}
        >
          Quick Actions
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Your dashboard is ready. Start exploring the features!
        </p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
