import { motion } from "framer-motion";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const LeaderboardTable = ({ rankings, currentUserId }) => {
  const getRankStyle = (rank) => {
    if (rank === 1)
      return {
        background: "linear-gradient(135deg, #FFD700, #FFA500)",
        color: "#000",
      };
    if (rank === 2)
      return {
        background: "linear-gradient(135deg, #C0C0C0, #A0A0A0)",
        color: "#000",
      };
    if (rank === 3)
      return {
        background: "linear-gradient(135deg, #CD7F32, #A0522D)",
        color: "#fff",
      };
    return { background: "var(--glass-bg)", color: "var(--text-primary)" };
  };

  return (
    <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60px 1fr 100px 100px",
          padding: "16px 20px",
          borderBottom: "1px solid var(--glass-border)",
          background: "var(--glass-bg-solid)",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontWeight: "600",
          }}
        >
          RANK
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontWeight: "600",
          }}
        >
          PLAYER
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontWeight: "600",
            textAlign: "right",
          }}
        >
          PNL
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontWeight: "600",
            textAlign: "right",
          }}
        >
          REWARD
        </span>
      </div>

      {/* Rows */}
      {rankings.map((entry, index) => {
        const isCurrentUser = entry.user_id === currentUserId;
        const isPositive = entry.pnl_percentage >= 0;

        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 100px 100px",
              padding: "14px 20px",
              alignItems: "center",
              borderBottom: "1px solid var(--glass-border)",
              background: isCurrentUser ? "var(--blue-subtle)" : "transparent",
            }}
          >
            {/* Rank */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "14px",
                ...getRankStyle(entry.rank),
              }}
            >
              {entry.rank}
            </div>

            {/* Player */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="avatar"
                style={{ width: "32px", height: "32px", fontSize: "12px" }}
              >
                {entry.username?.substring(0, 2).toUpperCase() || "U"}
              </div>
              <span style={{ fontWeight: isCurrentUser ? "600" : "400" }}>
                {entry.username || "Anonymous"}
                {isCurrentUser && (
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "var(--blue-secondary)",
                    }}
                  >
                    (You)
                  </span>
                )}
              </span>
            </div>

            {/* PnL */}
            <div
              style={{
                textAlign: "right",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "4px",
              }}
            >
              {isPositive ? (
                <FiTrendingUp size={14} style={{ color: "var(--success)" }} />
              ) : (
                <FiTrendingDown size={14} style={{ color: "var(--danger)" }} />
              )}
              <span
                style={{
                  color: isPositive ? "var(--success)" : "var(--danger)",
                  fontWeight: "600",
                }}
              >
                {isPositive ? "+" : ""}
                {entry.pnl_percentage?.toFixed(2)}%
              </span>
            </div>

            {/* Reward */}
            <div style={{ textAlign: "right" }}>
              {entry.reward > 0 ? (
                <span style={{ color: "var(--warning)", fontWeight: "600" }}>
                  ${entry.reward}
                </span>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>-</span>
              )}
            </div>
          </motion.div>
        );
      })}

      {rankings.length === 0 && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          No rankings yet
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;
