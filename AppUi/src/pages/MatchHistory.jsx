import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiAward, FiHome, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../services/api";

const MatchHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    matches_played: 0,
    matches_won: 0,
    best_rank: null,
    win_rate: 0,
    totalEarned: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [histRes, statsRes] = await Promise.allSettled([
        usersApi.getHistory(),
        usersApi.getStats(),
      ]);

      let histData = [];
      if (histRes.status === "fulfilled") {
        histData = histRes.value.data || [];
        setHistory(histData);
      }

      if (statsRes.status === "fulfilled") {
        const s = statsRes.value.data?.stats || {};
        const totalEarned = histData.reduce(
          (sum, m) => sum + (m.reward || 0),
          0,
        );
        setStats({
          matches_played: s.matches_played || histData.length,
          matches_won:
            s.matches_won || histData.filter((m) => m.is_winner).length,
          best_rank: s.best_rank || null,
          win_rate: s.win_rate || 0,
          totalEarned,
        });
      } else {
        // Fallback: compute from history
        const totalEarned = histData.reduce(
          (sum, m) => sum + (m.reward || 0),
          0,
        );
        const wins = histData.filter((m) => m.is_winner).length;
        const bestRank = histData.reduce(
          (best, m) => (m.rank && (!best || m.rank < best) ? m.rank : best),
          null,
        );
        setStats({
          matches_played: histData.length,
          matches_won: wins,
          best_rank: bestRank,
          win_rate:
            histData.length > 0
              ? Math.round((wins / histData.length) * 100)
              : 0,
          totalEarned,
        });
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "32px" }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "700",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <FiCalendar style={{ color: "var(--cyan-primary)" }} />
          Match History
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Your complete match performance record
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {[
          {
            label: "Total Matches",
            value: stats.matches_played,
            color: "var(--text-primary)",
          },
          { label: "Wins", value: stats.matches_won, color: "var(--success)" },
          {
            label: "Best Rank",
            value: stats.best_rank ? `#${stats.best_rank}` : "#—",
            color: "var(--cyan-primary)",
          },
          {
            label: "Win Rate",
            value: `${stats.win_rate.toFixed ? stats.win_rate.toFixed(1) : stats.win_rate}%`,
            color: "var(--warning)",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card"
            style={{ padding: "16px", textAlign: "center" }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "6px",
              }}
            >
              {s.label}
            </p>
            <p
              style={{ fontSize: "1.75rem", fontWeight: "700", color: s.color }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Win Rate Bar */}
      {stats.matches_played > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              flexShrink: 0,
            }}
          >
            Win Rate
          </span>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div
              className="progress-fill"
              style={{
                width: `${stats.win_rate}%`,
                background: "var(--success)",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--success)",
              flexShrink: 0,
            }}
          >
            {stats.win_rate.toFixed
              ? stats.win_rate.toFixed(1)
              : stats.win_rate}
            %
          </span>
        </motion.div>
      )}

      {/* History Table */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--text-muted)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid var(--glass-border)",
              borderTop: "3px solid var(--cyan-primary)",
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "spin 1s linear infinite",
            }}
          />
          Loading history...
        </div>
      ) : history.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: "60px", textAlign: "center" }}
        >
          <p style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🏛️</p>
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>
            No matches yet
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "24px",
            }}
          >
            Join your first match to start building your history!
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate("/lobby")}
            style={{ padding: "12px 28px" }}
          >
            Browse Matches
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{ padding: "0", overflow: "hidden" }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 80px 100px 100px 90px",
              padding: "12px 20px",
              borderBottom: "1px solid var(--glass-border)",
              fontSize: "11px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span>Match</span>
            <span style={{ textAlign: "center" }}>Rank</span>
            <span style={{ textAlign: "center" }}>PnL</span>
            <span style={{ textAlign: "center" }}>Reward</span>
            <span style={{ textAlign: "center" }}>Result</span>
            <span style={{ textAlign: "right" }}>Date</span>
          </div>

          {history.map((match, index) => {
            const isWinner =
              match.is_winner || (match.rank && match.rank <= 10);
            return (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 80px 100px 100px 90px",
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--glass-border)",
                  alignItems: "center",
                  background: isWinner
                    ? "rgba(34, 197, 94, 0.03)"
                    : "transparent",
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "2px",
                    }}
                  >
                    {match.match_title || "Match"}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Entry: ${match.entry_fee || 0}
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontWeight: "700", fontSize: "16px" }}>
                    #{match.rank || "—"}
                  </span>
                  {match.total_participants && (
                    <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      of {match.total_participants}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: "700",
                      fontSize: "13px",
                      color:
                        (match.pnl_percentage || 0) >= 0
                          ? "var(--success)"
                          : "var(--danger)",
                    }}
                  >
                    {(match.pnl_percentage || 0) >= 0 ? "+" : ""}
                    {(match.pnl_percentage || 0).toFixed(2)}%
                  </span>
                </div>
                <div style={{ textAlign: "center" }}>
                  {match.reward > 0 ? (
                    <span
                      style={{
                        fontWeight: "700",
                        color: "var(--warning)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                      }}
                    >
                      <FiAward size={12} />${match.reward}
                    </span>
                  ) : (
                    <span
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      —
                    </span>
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: isWinner
                        ? "rgba(34, 197, 94, 0.15)"
                        : "rgba(239, 68, 68, 0.1)",
                      color: isWinner ? "var(--success)" : "var(--danger)",
                      border: `1px solid ${isWinner ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.2)"}`,
                    }}
                  >
                    {isWinner ? "🏆 WIN" : "❌ LOSS"}
                  </span>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  {formatDate(match.date || match.createdAt)}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Back to lobby */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ marginTop: "24px", textAlign: "center" }}
      >
        <button
          className="btn-secondary"
          onClick={() => navigate("/lobby")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
          }}
        >
          <FiHome size={14} />
          Back to Lobby
        </button>
      </motion.div>
    </div>
  );
};

export default MatchHistory;
