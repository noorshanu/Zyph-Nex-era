import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers } from "react-icons/fi";
import { matchesApi } from "../services/api";

const WaitingRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(null); // null = loading
  const [match, setMatch] = useState(null);
  const [selectedTokens, setSelectedTokens] = useState([]);

  const timerRef = useRef(null);
  const pollRef = useRef(null);

  // ── Fetch match + portfolio ───────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const matchRes = await matchesApi.getById(id);
      const m = matchRes.data;
      setMatch(m);

      // Compute seconds left until join window closes
      const startTime = new Date(m.start_time).getTime();
      const joinWindowMs = (m.join_window_minutes ?? 30) * 60 * 1000;
      const closeTime = startTime + joinWindowMs;
      const remaining = Math.max(
        0,
        Math.floor((closeTime - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
    } catch (err) {
      console.error("WaitingRoom: failed to fetch match", err);
      // Fallback so the page isn't blank
      setTimeLeft(0);
    }

    // Fetch the user's portfolio to show real tokens
    try {
      const portRes = await matchesApi.getMyPortfolio(id);
      const allocations = portRes.data?.allocations || [];
      if (allocations.length > 0) {
        setSelectedTokens(allocations.map((a) => a.asset));
      }
    } catch {
      // Portfolio not submitted yet — keep empty or show placeholder
    }
  };

  // ── Poll match for live player count ─────────────────────────────────────
  const pollMatch = async () => {
    try {
      const matchRes = await matchesApi.getById(id);
      const m = matchRes.data;
      setMatch((prev) => ({ ...prev, ...m }));

      // If match went live, navigate to live page
      if (m.status === "live") {
        clearInterval(timerRef.current);
        clearInterval(pollRef.current);
        navigate(`/match/${id}/live`);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchData();

    // Poll match data every 10 seconds
    pollRef.current = setInterval(pollMatch, 10_000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, [id]);

  // ── Countdown tick ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return; // still loading

    if (timeLeft <= 0) {
      // Timer done — keep polling for the backend to flip status to live
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null]); // only re-run when we get the initial value

  // ── Format helpers ────────────────────────────────────────────────────────
  const formatTime = (seconds) => {
    if (seconds === null) return { mins: "--", secs: "--" };
    const s = Math.max(0, seconds);
    return {
      mins: String(Math.floor(s / 60)).padStart(2, "0"),
      secs: String(s % 60).padStart(2, "0"),
    };
  };

  const time = formatTime(timeLeft);
  const playersJoined = match?.current_participants ?? 0;
  const maxPlayers = match?.max_participants ?? 50;
  const progress = maxPlayers > 0 ? (playersJoined / maxPlayers) * 100 : 0;

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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: "100%", maxWidth: "520px", textAlign: "center" }}
      >
        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "32px" }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "12px",
            }}
          >
            {timeLeft === 0
              ? "Waiting for match to go live…"
              : "Match starts in"}
          </p>
          <div
            style={{
              fontSize: "4.5rem",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: "700",
              letterSpacing: "6px",
              background:
                "linear-gradient(135deg, var(--cyan-primary), var(--cyan-accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 60px rgba(0, 206, 209, 0.4)",
            }}
          >
            {time.mins}:{time.secs}
          </div>
        </motion.div>

        {/* Players Joined */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{
            padding: "20px 24px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FiUsers size={16} style={{ color: "var(--cyan-primary)" }} />
              <span
                style={{ fontSize: "13px", color: "var(--text-secondary)" }}
              >
                Players Joined
              </span>
            </div>
            <span style={{ fontWeight: "700", fontSize: "15px" }}>
              {playersJoined}{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>
                / {maxPlayers}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </motion.div>

        {/* Info message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            color: "var(--text-muted)",
            fontSize: "12px",
            marginBottom: "28px",
          }}
        >
          Match will start when all slots fill or timer ends
        </motion.p>

        {/* Selected Tokens Grid */}
        {selectedTokens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px",
              }}
            >
              Your Team ({selectedTokens.length} tokens)
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
              }}
            >
              {selectedTokens.map((symbol, index) => (
                <motion.div
                  key={symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.03 }}
                  className="glass"
                  style={{
                    padding: "12px 6px",
                    textAlign: "center",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--cyan-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    {symbol}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    100 pts
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WaitingRoom;
