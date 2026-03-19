import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiAward, FiHome, FiRotateCcw } from "react-icons/fi";
import { matchesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const defaultResult = {
  rank: null,
  totalParticipants: 0,
  isWinner: false,
  pnlPercentage: 0,
  reward: 0,
  entryFee: 0,
  portfolio: [],
  topPlayers: [],
};

const Results = () => {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const userId = authUser?.user?.id || authUser?.id;

  const [result, setResult] = useState(defaultResult);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchResults() {
      try {
        const [leaderRes, portfolioRes] = await Promise.all([
          matchesApi.getLeaderboard(matchId),
          matchesApi.getMyPortfolio(matchId).catch(() => ({ data: null })),
        ]);
        if (cancelled) return;
        const list = leaderRes.data && Array.isArray(leaderRes.data) ? leaderRes.data : [];
        const p = portfolioRes?.data;
        const myRank = p?.rank ?? null;
        const myPnl = p?.pnl_percentage ?? 0;
        const myReward = p?.reward ?? 0;
        const portfolio = (p?.allocations || []).map((a) => ({
          symbol: a.asset,
          pnl: 0,
          allocation: a.amount ?? 0,
        }));
        setResult({
          rank: myRank,
          totalParticipants: list.length,
          isWinner: myRank != null && myRank <= 10,
          pnlPercentage: myPnl,
          reward: myReward,
          entryFee: 0,
          portfolio,
          topPlayers: list.map((r) => ({
            rank: r.rank,
            username: r.username || "Player",
            pnl: r.pnl_percentage ?? 0,
            reward: r.reward ?? 0,
            isCurrentUser: userId && String(r.user_id) === String(userId),
          })),
        });
      } catch (err) {
        console.error("Failed to fetch results:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchResults();
    return () => { cancelled = true; };
  }, [matchId, userId]);

  const netProfit = result.isWinner
    ? result.reward - result.entryFee
    : -result.entryFee;

  if (loading) {
    return (
      <div
        className="bg-gradient-radial"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        Loading results…
      </div>
    );
  }

  return (
    <div
      className="bg-gradient-radial"
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: "100%", maxWidth: "800px" }}
      >
        {/* Winner / Loser Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "8px" }}>
            {result.isWinner ? "🏆" : "😔"}
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              marginBottom: "8px",
              background: result.isWinner
                ? "linear-gradient(to right, #FFD700, #00CED1)"
                : "linear-gradient(to right, #ef4444, #a0a0a0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {result.isWinner ? "You Won!" : "Better Luck Next Time"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            You finished #{result.rank ?? "—"} out of {result.totalParticipants || "—"}{" "}
            players
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
            style={{ padding: "20px", textAlign: "center" }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              Final Rank
            </p>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                color: "var(--cyan-primary)",
              }}
            >
              #{result.rank}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
            style={{ padding: "20px", textAlign: "center" }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              Portfolio PnL
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color:
                  result.pnlPercentage >= 0
                    ? "var(--success)"
                    : "var(--danger)",
              }}
            >
              +{result.pnlPercentage}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: "20px", textAlign: "center" }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              {result.isWinner ? "Winnings" : "Net Result"}
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: result.isWinner ? "var(--warning)" : "var(--danger)",
              }}
            >
              {result.isWinner ? `$${result.reward}` : `-$${result.entryFee}`}
            </p>
            {result.isWinner && (
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--success)",
                  marginTop: "4px",
                }}
              >
                Net profit: ${netProfit}
              </p>
            )}
          </motion.div>
        </div>

        {/* Top 10 Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ padding: "0", overflow: "hidden", marginBottom: "28px" }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--glass-border)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FiAward size={16} style={{ color: "var(--warning)" }} />
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>
              Prize Distribution — Top 10 Winners
            </h3>
          </div>

          <table className="table-dark">
            <thead>
              <tr>
                <th style={{ paddingLeft: "20px" }}>Rank</th>
                <th>Player</th>
                <th style={{ textAlign: "right" }}>PnL</th>
                <th style={{ textAlign: "right", paddingRight: "20px" }}>
                  Prize
                </th>
              </tr>
            </thead>
            <tbody>
              {result.topPlayers.map((player) => (
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
                        width: "26px",
                        height: "26px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "11px",
                        background:
                          player.rank === 1
                            ? "linear-gradient(135deg, #FFD700, #FDB931)"
                            : player.rank === 2
                              ? "linear-gradient(135deg, #E0E0E0, #BDBDBD)"
                              : player.rank === 3
                                ? "linear-gradient(135deg, #CD7F32, #A0522D)"
                                : "rgba(255, 255, 255, 0.05)",
                        color:
                          player.rank <= 2
                            ? "#000"
                            : player.rank === 3
                              ? "#fff"
                              : "var(--text-secondary)",
                      }}
                    >
                      {player.rank}
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
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: "600",
                      color: "var(--success)",
                    }}
                  >
                    +{player.pnl}%
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      paddingRight: "20px",
                      fontWeight: "700",
                      color: "var(--warning)",
                    }}
                  >
                    ${player.reward}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Your Token Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card"
          style={{ padding: "0", overflow: "hidden", marginBottom: "28px" }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--glass-border)",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>
              Your Token Performance
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "1px",
              background: "var(--glass-border)",
            }}
          >
            {result.portfolio.map((asset) => (
              <div
                key={asset.symbol}
                style={{
                  padding: "16px 8px",
                  textAlign: "center",
                  background: "var(--bg-card)",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    marginBottom: "6px",
                  }}
                >
                  {asset.symbol}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: asset.pnl >= 0 ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {asset.pnl >= 0 ? "+" : ""}
                  {asset.pnl}%
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  {asset.allocation} pts
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            className="btn-secondary"
            onClick={() => navigate("/lobby")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 24px",
            }}
          >
            <FiHome size={16} />
            Back to Lobby
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate("/lobby")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 32px",
            }}
          >
            <FiRotateCcw size={16} />
            Play Again
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Results;
