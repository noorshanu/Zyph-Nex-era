import { motion } from "framer-motion";
import {
  FiClock,
  FiUsers,
  FiDollarSign,
  FiAward,
  FiLock,
} from "react-icons/fi";

const MatchCard = ({ match, onClick }) => {
  const formatCountdown = (startTime) => {
    const diff = new Date(startTime) - new Date();
    if (diff <= 0) return "00:00:00";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const isOpen = match.status === "open";
  const isLive = match.status === "live";
  const isCompleted =
    match.status === "completed" || match.status === "settled";
  const isHot = match.current_participants > match.max_participants * 0.7;

  // Join window duration displayed on card
  const joinWindow = match.join_window_minutes || match.duration || 30;
  const matchDuration = match.match_duration_minutes || 4;

  const getButtonConfig = () => {
    if (isLive)
      return {
        label: "🔴 Ongoing",
        disabled: true,
        style:
          "bg-red-900/30 text-red-400 border border-red-800 cursor-not-allowed",
      };
    if (isCompleted)
      return {
        label: "View Results",
        disabled: false,
        style: "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60",
      };
    if (isOpen)
      return {
        label: "Join Now →",
        disabled: false,
        style:
          "bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold hover:opacity-90",
      };
    return {
      label: "Opens Soon",
      disabled: true,
      style: "bg-gray-800/40 text-gray-500 cursor-not-allowed",
    };
  };

  const btn = getButtonConfig();

  return (
    <motion.div
      className="match-card group"
      onClick={!btn.disabled ? onClick : undefined}
      whileHover={!btn.disabled ? { scale: 1.02, y: -4 } : {}}
      whileTap={!btn.disabled ? { scale: 0.98 } : {}}
      style={{ cursor: btn.disabled && !isCompleted ? "default" : "pointer" }}
    >
      {/* Header Tags */}
      <div className="match-card-header">
        <div
          className={`badge ${match.type === "paid" ? "badge-primary" : "badge-success"}`}
        >
          {match.type === "paid" ? "PREMIUM" : "PRACTICE"}
        </div>
        {isHot && !isLive && (
          <div className="badge badge-hot animate-pulse-cyan">🔥 HOT</div>
        )}
        {isLive && (
          <div
            className="badge badge-danger"
            style={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#ef4444",
                display: "inline-block",
                animation: "pulse-red 1.5s ease-in-out infinite",
              }}
            />
            LIVE
          </div>
        )}
        {isCompleted && <div className="badge">ENDED</div>}
      </div>

      {/* Title */}
      <div style={{ marginBottom: "20px" }}>
        <h3 className="card-title">{match.title}</h3>
        <p className="card-desc">
          {match.description ||
            "Pick 10 tokens and compete for the prize pool."}
        </p>
      </div>

      {/* Countdown — only for open (not yet live) */}
      {isOpen && (
        <div className="countdown-box">
          <p className="countdown-label">Join Window Closes In</p>
          <div className="countdown-display" style={{ fontSize: "1.8rem" }}>
            {formatCountdown(
              new Date(
                new Date(match.start_time).getTime() + joinWindow * 60 * 1000,
              ),
            )}
          </div>
        </div>
      )}

      {/* Upcoming countdown */}
      {!isOpen && !isLive && !isCompleted && (
        <div className="countdown-box">
          <p className="countdown-label">Opens In</p>
          <div className="countdown-display" style={{ fontSize: "1.8rem" }}>
            {formatCountdown(match.start_time)}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-label">
            <FiAward size={12} />
            <span>POOL</span>
          </div>
          <div className="stats-value" style={{ color: "var(--warning)" }}>
            <span className="currency">$</span>
            {match.prize_pool}
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-label">
            <FiDollarSign size={12} />
            <span>ENTRY</span>
          </div>
          <div className="stats-value">
            {match.entry_fee === 0 ? "FREE" : `$${match.entry_fee}`}
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-label">
            <FiUsers size={12} />
            <span>PLAYERS</span>
          </div>
          <div className="stats-value">
            {match.current_participants}/{match.max_participants}
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-label">
            <FiClock size={12} />
            <span>MATCH</span>
          </div>
          <div className="stats-value">{matchDuration}m</div>
        </div>
      </div>

      {/* Live — show locked icon */}
      {isLive && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 12px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "16px",
            fontSize: "12px",
            color: "#ef4444",
          }}
        >
          <FiLock size={12} />
          Entry closed — match in progress
        </div>
      )}

      {/* Progress bar */}
      {!isCompleted && (
        <div className="progress-container">
          <div className="progress-header">
            <span>{isLive ? "Players" : "Registration"}</span>
            <span>
              {Math.round(
                (match.current_participants / match.max_participants) * 100,
              )}
              % Full
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(match.current_participants / match.max_participants) * 100}%`,
                background: isLive ? "var(--danger)" : undefined,
              }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        className={`action-btn ${btn.style}`}
        disabled={btn.disabled}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "var(--radius-md)",
          border: "none",
          cursor: btn.disabled ? "not-allowed" : "pointer",
          marginTop: "4px",
          fontSize: "14px",
        }}
      >
        {btn.label}
      </button>
    </motion.div>
  );
};

export default MatchCard;
