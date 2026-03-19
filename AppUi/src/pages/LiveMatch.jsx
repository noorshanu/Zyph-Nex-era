import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUp, FiArrowDown, FiActivity } from "react-icons/fi";
import { matchesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const defaultRankings = [];
const defaultUserStats = {
  rank: null,
  totalParticipants: 0,
  pnl: 0,
  pnlPercentage: 0,
  rankMovement: 0,
};
const defaultAssetPerformance = [];

const LiveMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const userId = authUser?.user?.id || authUser?.id;

  const [timeLeft, setTimeLeft] = useState(900);
  const [rankings, setRankings] = useState(defaultRankings);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(defaultUserStats);
  const [assetPerformance, setAssetPerformance] = useState(defaultAssetPerformance);

  const fetchMyPortfolio = useCallback(
    async (totalParticipants = 0) => {
      try {
        const response = await matchesApi.getMyPortfolio(id);
        const p = response.data;
        if (p) {
          setUserStats((prev) => ({
            ...prev,
            rank: p.rank ?? null,
            totalParticipants,
            pnl: p.pnl ?? 0,
            pnlPercentage: p.pnl_percentage ?? 0,
            rankMovement: 0,
          }));
          const allocs = p.allocations || [];
          setAssetPerformance(
            allocs.map((a) => ({
              symbol: a.asset,
              name: a.asset,
              pnl: 0,
              allocation: a.amount ?? 0,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch portfolio:", err);
      }
    },
    [id]
  );

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await matchesApi.getLeaderboard(id);
      const list = response.data && Array.isArray(response.data) ? response.data : [];
      setRankings(
        list.map((r) => ({
          rank: r.rank,
          username: r.username || "Player",
          pnl_percentage: r.pnl_percentage ?? 0,
          change: 0,
          isCurrentUser: userId && String(r.user_id) === String(userId),
        }))
      );
      if (userId && list.length > 0) {
        fetchMyPortfolio(list.length);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [id, userId, fetchMyPortfolio]);

  useEffect(() => {
    fetchLeaderboard();
    const pollInterval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(pollInterval);
  }, [fetchLeaderboard]);


  // Navigate when timer hits zero
  useEffect(() => {
    if (timeLeft <= 0) {
      navigate(`/match/${id}/results`);
    }
  }, [timeLeft, navigate, id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getRankBadgeStyle = (rank) => {
    if (rank === 1)
      return {
        background: "linear-gradient(135deg, #FFD700, #FDB931)",
        color: "#000",
        boxShadow: "0 0 10px rgba(255, 215, 0, 0.4)",
      };
    if (rank === 2)
      return {
        background: "linear-gradient(135deg, #E0E0E0, #BDBDBD)",
        color: "#000",
      };
    if (rank === 3)
      return {
        background: "linear-gradient(135deg, #CD7F32, #A0522D)",
        color: "#fff",
      };
    return {
      background: "rgba(255, 255, 255, 0.05)",
      color: "var(--text-secondary)",
    };
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "32px",
          textAlign: "center",
          color: "var(--text-muted)",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid var(--glass-border)",
            borderTop: "3px solid var(--cyan-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        Connecting to Live Feed...
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#ef4444",
              display: "inline-block",
              boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
              animation: "pulse-cyan 2s ease-in-out infinite",
            }}
          />
          Live Match
        </h1>

        <div
          className="glass"
          style={{
            padding: "8px 20px",
            borderRadius: "30px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Time Left
          </span>
          <span
            style={{
              fontSize: "1.25rem",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: "700",
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            padding: "20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Your Rank
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "2rem",
                fontWeight: "700",
              }}
            >
              #{userStats.rank ?? "—"}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              / {userStats.totalParticipants || rankings.length || "—"}
            </span>
          </div>
          {userStats.rankMovement !== 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                marginTop: "4px",
                fontSize: "12px",
                color: userStats.rankMovement > 0 ? "var(--success)" : "var(--danger)",
              }}
            >
              {userStats.rankMovement > 0 ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
              <span>{Math.abs(userStats.rankMovement)} positions</span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: "20px", textAlign: "center" }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Total PnL
          </p>
          <span
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: userStats.pnl >= 0 ? "var(--success)" : "var(--danger)",
            }}
          >
            {(userStats.pnlPercentage ?? 0) >= 0 ? "+" : ""}
            {(userStats.pnlPercentage ?? 0).toFixed(2)}%
          </span>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginTop: "4px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ${(userStats.pnl ?? 0).toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{ padding: "20px", textAlign: "center" }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Best Token
          </p>
          <span style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {(userStats.pnlPercentage ?? 0) >= 0 ? "+" : ""}
            {(userStats.pnlPercentage ?? 0).toFixed(2)}%
          </span>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            Live PnL from real market prices
          </p>
        </motion.div>
      </div>

      {/* Main Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "20px",
        }}
      >
        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{ padding: "0", overflow: "hidden" }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--glass-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: "15px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FiActivity size={16} style={{ color: "var(--cyan-primary)" }} />
              Live Leaderboard
            </h2>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Updates every 5s
            </span>
          </div>

          <table className="table-dark">
            <thead>
              <tr>
                <th style={{ paddingLeft: "20px" }}>Rank</th>
                <th>Player</th>
                <th style={{ textAlign: "right", paddingRight: "20px" }}>
                  PnL
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((player) => (
                <tr
                  key={player.rank}
                  style={{
                    background: player.isCurrentUser
                      ? "rgba(0, 206, 209, 0.08)"
                      : "transparent",
                  }}
                >
                  <td style={{ paddingLeft: "20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "11px",
                          ...getRankBadgeStyle(player.rank),
                        }}
                      >
                        {player.rank}
                      </div>
                      {player.change !== 0 && (
                        <span
                          style={{
                            fontSize: "10px",
                            display: "flex",
                            alignItems: "center",
                            color:
                              player.change > 0
                                ? "var(--success)"
                                : "var(--danger)",
                          }}
                        >
                          {player.change > 0 ? (
                            <FiArrowUp size={10} />
                          ) : (
                            <FiArrowDown size={10} />
                          )}
                          {Math.abs(player.change)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: player.isCurrentUser ? "700" : "500",
                        color: player.isCurrentUser
                          ? "var(--cyan-primary)"
                          : "var(--text-primary)",
                      }}
                    >
                      {player.username}
                      {player.isCurrentUser && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "10px",
                            padding: "2px 6px",
                            background: "rgba(0, 206, 209, 0.15)",
                            borderRadius: "4px",
                            color: "var(--cyan-primary)",
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      paddingRight: "20px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: "700",
                        color:
                          (player.pnl_percentage ?? 0) >= 0
                            ? "var(--success)"
                            : "var(--danger)",
                      }}
                    >
                      {(player.pnl_percentage ?? 0) > 0 ? "+" : ""}
                      {(player.pnl_percentage ?? 0).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Portfolio Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
          style={{ padding: "0", overflow: "hidden", height: "fit-content" }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--glass-border)",
            }}
          >
            <h2
              style={{
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              Your Portfolio
            </h2>
          </div>

          {assetPerformance.map((asset) => (
            <div
              key={asset.symbol}
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--glass-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                  }}
                >
                  {asset.symbol[0]}
                </div>
                <div>
                  <p style={{ fontWeight: "600", fontSize: "13px" }}>
                    {asset.symbol}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {asset.allocation} pts
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: "700",
                  fontSize: "14px",
                  color: asset.pnl >= 0 ? "var(--success)" : "var(--danger)",
                }}
              >
                {asset.pnl > 0 ? "+" : ""}
                {asset.pnl}%
              </span>
            </div>
          ))}

          <div
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.02)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
              }}
            >
              Prices updated via Oracle
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveMatch;
