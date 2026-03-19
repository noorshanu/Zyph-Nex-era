import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiAward,
  FiTarget,
  FiBarChart2,
  FiDollarSign,
  FiShield,
} from "react-icons/fi";
import { usersApi } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersApi.getProfile();
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // Removed mock fallback, use empty state instead
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await usersApi.getHistory();
      setHistory(response.data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setHistory([]);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "32px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        Loading profile...
      </div>
    );
  }

  const stats = [
    {
      icon: FiBarChart2,
      label: "Matches Played",
      value: user?.stats?.matches_played || 0,
      color: "var(--cyan-primary)",
    },
    {
      icon: FiAward,
      label: "Matches Won",
      value: user?.stats?.matches_won || 0,
      color: "var(--warning)",
    },
    {
      icon: FiTarget,
      label: "Best Rank",
      value: `#${user?.stats?.best_rank || "-"}`,
      color: "var(--success)",
    },
    {
      icon: FiTrendingUp,
      label: "Win Rate",
      value: `${user?.stats?.win_rate || 0}%`,
      color: "var(--info)",
    },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: "32px", marginBottom: "32px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "700",
              color: "#000",
              boxShadow: "var(--glow-cyan)",
            }}
          >
            {user?.firstName?.charAt(0) || "Z"}
            {user?.lastName?.charAt(0) || "U"}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                marginBottom: "4px",
              }}
            >
              {user?.firstName} {user?.lastName}
            </h1>
            {user?.username && (
              <p style={{ color: "var(--cyan-primary)", fontSize: "14px", marginBottom: "16px", fontWeight: "500" }}>
                @{user.username}
              </p>
            )}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div className="badge badge-primary">
                <FiShield size={12} />
                SR: {user?.skill_rating || 1000}
              </div>
              <div className="badge badge-success">
                <FiDollarSign size={12} />
                {(user?.balance || 0).toFixed(0)} USDC
              </div>
            </div>
          </div>

          {/* Skill Rating Display */}
          <div
            className="glass"
            style={{
              padding: "24px 40px",
              textAlign: "center",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Skill Rating
            </p>
            <p
              style={{ fontSize: "2.5rem", fontWeight: "700" }}
              className="text-gradient"
            >
              {user?.skill_rating || 1000}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card"
            style={{ padding: "24px", textAlign: "center" }}
          >
            <stat.icon
              size={32}
              style={{ color: stat.color, marginBottom: "16px" }}
            />
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {stat.label}
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: "700" }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Match History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
        style={{ padding: "24px" }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            marginBottom: "20px",
          }}
        >
          Match History
        </h2>

        <table className="table-dark" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Match</th>
              <th style={{ textAlign: "center" }}>Rank</th>
              <th style={{ textAlign: "right" }}>PnL%</th>
              <th style={{ textAlign: "right" }}>Reward</th>
              <th style={{ textAlign: "right" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  No match history found. Join a match to track your performance!
                </td>
              </tr>
            ) : (
              history.map((match, index) => (
              <tr key={index}>
                <td style={{ fontWeight: "500" }}>{match.title}</td>
                <td style={{ textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background:
                        match.rank <= 3
                          ? "var(--cyan-subtle)"
                          : "var(--bg-tertiary)",
                      color:
                        match.rank <= 3
                          ? "var(--cyan-primary)"
                          : "var(--text-secondary)",
                    }}
                  >
                    #{match.rank}
                  </span>
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: "600",
                    color: match.pnl >= 0 ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {match.pnl >= 0 ? "+" : ""}
                  {match.pnl.toFixed(2)}%
                </td>
                <td style={{ textAlign: "right" }}>
                  {match.reward > 0 ? (
                    <span
                      style={{ color: "var(--warning)", fontWeight: "600" }}
                    >
                      ${match.reward}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>-</span>
                  )}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                  }}
                >
                  {match.date}
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Profile;
