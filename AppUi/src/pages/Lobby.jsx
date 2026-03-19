import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MatchCard from "../components/match/MatchCard";
import { matchesApi } from "../services/api";

const Lobby = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesApi.getAll();
      setMatches(response.data || []);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      // Fallback mock data
      setMatches([
        {
          _id: "1",
          title: "Crypto Classic",
          description: "30 min head-to-head token battle",
          type: "paid",
          entry_fee: 5,
          prize_pool: 450,
          duration: 30,
          virtual_balance: 1000,
          status: "open",
          start_time: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
          current_participants: 37,
          max_participants: 50,
        },
        {
          _id: "2",
          title: "High Rollers Arena",
          description: "Premium match for experienced traders",
          type: "paid",
          entry_fee: 20,
          prize_pool: 1800,
          duration: 30,
          virtual_balance: 1000,
          status: "open",
          start_time: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
          current_participants: 42,
          max_participants: 50,
        },
        {
          _id: "3",
          title: "Diamond League",
          description: "1 hour strategic token challenge",
          type: "paid",
          entry_fee: 10,
          prize_pool: 900,
          duration: 60,
          virtual_balance: 1000,
          status: "upcoming",
          start_time: new Date(Date.now() + 1000 * 60 * 300).toISOString(),
          current_participants: 28,
          max_participants: 50,
        },
        {
          _id: "4",
          title: "Quick Fire",
          description: "Fast-paced 15-min match",
          type: "paid",
          entry_fee: 5,
          prize_pool: 450,
          duration: 15,
          virtual_balance: 1000,
          status: "open",
          start_time: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
          current_participants: 18,
          max_participants: 30,
        },
        {
          _id: "5",
          title: "Mega Contest",
          description: "100-player mega contest with huge prize",
          type: "paid",
          entry_fee: 50,
          prize_pool: 4500,
          duration: 60,
          virtual_balance: 1000,
          status: "upcoming",
          start_time: new Date(Date.now() + 1000 * 60 * 600).toISOString(),
          current_participants: 65,
          max_participants: 100,
        },
        {
          _id: "6",
          title: "Crypto Classic #42",
          description: "30 min standard match - completed",
          type: "paid",
          entry_fee: 5,
          prize_pool: 450,
          duration: 30,
          virtual_balance: 1000,
          status: "completed",
          start_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          current_participants: 50,
          max_participants: 50,
        },
        {
          _id: "7",
          title: "High Rollers #18",
          description: "Premium match - finished",
          type: "paid",
          entry_fee: 20,
          prize_pool: 1800,
          duration: 30,
          virtual_balance: 1000,
          status: "completed",
          start_time: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          current_participants: 50,
          max_participants: 50,
        },
        {
          _id: "8",
          title: "Quick Fire #7",
          description: "Expired quick match",
          type: "paid",
          entry_fee: 5,
          prize_pool: 450,
          duration: 15,
          virtual_balance: 1000,
          status: "expired",
          start_time: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          current_participants: 20,
          max_participants: 30,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activeStatuses = ["open", "upcoming", "live"];
  const expiredStatuses = ["completed", "expired"];

  const filteredMatches = matches.filter((match) => {
    if (tab === "active") return activeStatuses.includes(match.status);
    return expiredStatuses.includes(match.status);
  });

  const handleMatchClick = (matchId) => {
    navigate(`/match/${matchId}/entry`);
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1200px", margin: "0 auto" }}>
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
          <span style={{ fontSize: "1.5rem" }}>🏟️</span>
          Stravex Arena
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Join a match, pick your tokens, and compete for rewards
        </p>
      </motion.div>

      {/* Active / Expired Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "flex",
          gap: "0",
          marginBottom: "32px",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          border: "1px solid var(--glass-border)",
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setTab("active")}
          style={{
            padding: "12px 32px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            background:
              tab === "active"
                ? "linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary))"
                : "transparent",
            color: tab === "active" ? "#000" : "var(--text-secondary)",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: tab === "active" ? "#000" : "var(--success)",
              display: "inline-block",
            }}
          />
          Active Matches
        </button>
        <button
          onClick={() => setTab("expired")}
          style={{
            padding: "12px 32px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            borderLeft: "1px solid var(--glass-border)",
            background:
              tab === "expired"
                ? "linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary))"
                : "transparent",
            color: tab === "expired" ? "#000" : "var(--text-secondary)",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: tab === "expired" ? "#000" : "var(--text-muted)",
              display: "inline-block",
            }}
          />
          Expired Matches
        </button>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "var(--text-muted)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--glass-border)",
              borderTop: "3px solid var(--cyan-primary)",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          Loading matches...
        </div>
      )}

      {/* Matches Grid */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MatchCard
                match={match}
                onClick={() => handleMatchClick(match._id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredMatches.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>
            {tab === "active" ? "🏟️" : "📜"}
          </div>
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>
            {tab === "active"
              ? "No active matches right now"
              : "No expired matches found"}
          </p>
          <p style={{ fontSize: "13px" }}>
            {tab === "active"
              ? "Check back soon for new matches!"
              : "Play some matches to see your history here"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Lobby;
