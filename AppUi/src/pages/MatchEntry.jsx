import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiClock,
  FiUsers,
  FiDollarSign,
  FiCheck,
  FiAward,
  FiArrowLeft,
  FiZap,
  FiLock,
} from "react-icons/fi";
import { matchesApi } from "../services/api";
import { useMatchPayment } from "../hooks/useMatchPayment";
import { useAccount } from "wagmi";

const MatchEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [paymentStep, setPaymentStep] = useState(""); // "", "confirm", "waiting", "done"

  const { isConnected } = useAccount();

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const response = await matchesApi.getById(id);
      setMatch(response.data);
    } catch (err) {
      console.error("Failed to fetch match:", err);
      setMatch({
        _id: id,
        title: "High Rollers Arena",
        description:
          "Pick your best 10 crypto tokens from a pool of 20. Top performers win the prize pool!",
        type: "paid",
        entry_fee: 20,
        prize_pool: 1800,
        duration: 30,
        virtual_balance: 1000,
        status: "open",
        start_time: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
        current_participants: 37,
        max_participants: 50,
        rules: [
          "Select 10 tokens from a pool of 20",
          "Each token gets 100 virtual points (1000 total)",
          "Match runs for 30 minutes with live prices",
          "Top performers share the prize pool",
          "Winners are ranked by portfolio performance",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // Payment hook — only used for paid matches
  const {
    pay,
    isPaying,
    error: payError,
    targetChain,
  } = useMatchPayment(match || {});

  const handleJoin = async () => {
    if (!match) return;
    setError("");
    setPaymentStep("");
    setJoining(true);

    try {
      const isPaid = match.type === "paid" && match.entry_fee > 0;

      if (isPaid) {
        // --- Paid match: payment first ---
        if (!isConnected) {
          setError("Please connect your wallet to pay the entry fee.");
          setJoining(false);
          return;
        }

        setPaymentStep("confirm");
        await pay(); // triggers MetaMask — waits for user sign
        setPaymentStep("waiting");

        // Small delay so user sees "waiting" state briefly before navigating
        await new Promise((r) => setTimeout(r, 800));
        setPaymentStep("done");
      }

      // --- Join on backend (free or after payment) ---
      await matchesApi.join(id);
      navigate(`/match/${id}/select`);
    } catch (err) {
      const msg = payError || err?.message || "Failed to join match";
      setError(msg);
      // For demo: allow navigation even if payment/join fails in testnet
      // Remove these two lines in production:
      // await new Promise((r) => setTimeout(r, 400));
      // navigate(`/match/${id}/select`);
    } finally {
      setJoining(false);
      setPaymentStep("");
    }
  };

  // Derive button label depending on state
  const getButtonLabel = () => {
    if (paymentStep === "confirm") return "Confirm in wallet…";
    if (paymentStep === "waiting") return "Waiting for confirmation…";
    if (paymentStep === "done") return "Payment confirmed ✓";
    if (joining) return "Joining…";
    if (match?.type === "paid" && match?.entry_fee > 0) {
      return `Pay & Enter — $${match.entry_fee}`;
    }
    return "Enter Match (Free)";
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
        }}
      >
        Loading match details...
      </div>
    );
  }

  const isPaid = match?.type === "paid" && match?.entry_fee > 0;

  return (
    <div style={{ padding: "24px 32px", maxWidth: "700px", margin: "0 auto" }}>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/lobby")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "none",
          border: "none",
          color: "var(--text-secondary)",
          cursor: "pointer",
          fontSize: "14px",
          padding: "8px 0",
          marginBottom: "24px",
        }}
      >
        <FiArrowLeft size={16} />
        Back to Lobby
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: "32px" }}
      >
        {/* Match Title */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <span className="badge badge-primary" style={{ fontSize: "11px" }}>
              {match.type === "paid" ? "PREMIUM" : "FREE"}
            </span>
            {match.status === "open" && (
              <span
                className="badge badge-success"
                style={{ fontSize: "11px" }}
              >
                OPEN
              </span>
            )}
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              marginBottom: "8px",
            }}
          >
            {match.title}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {match.description}
          </p>
        </div>

        {/* Match Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <div
            className="glass"
            style={{ padding: "16px", textAlign: "center" }}
          >
            <FiClock
              size={20}
              style={{ color: "var(--cyan-primary)", marginBottom: "8px" }}
            />
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Duration
            </p>
            <p style={{ fontWeight: "700", fontSize: "1.1rem" }}>
              {match.match_duration_minutes || match.duration} min
            </p>
          </div>
          <div
            className="glass"
            style={{ padding: "16px", textAlign: "center" }}
          >
            <FiDollarSign
              size={20}
              style={{ color: "var(--success)", marginBottom: "8px" }}
            />
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Entry Fee
            </p>
            <p style={{ fontWeight: "700", fontSize: "1.1rem" }}>
              {match.entry_fee === 0 ? "FREE" : `$${match.entry_fee}`}
            </p>
          </div>
          <div
            className="glass"
            style={{ padding: "16px", textAlign: "center" }}
          >
            <FiAward
              size={20}
              style={{ color: "var(--warning)", marginBottom: "8px" }}
            />
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Prize Pool
            </p>
            <p
              style={{
                fontWeight: "700",
                fontSize: "1.1rem",
                color: "var(--warning)",
              }}
            >
              ${match.prize_pool}
            </p>
          </div>
          <div
            className="glass"
            style={{ padding: "16px", textAlign: "center" }}
          >
            <FiUsers
              size={20}
              style={{ color: "var(--info)", marginBottom: "8px" }}
            />
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Players
            </p>
            <p style={{ fontWeight: "700", fontSize: "1.1rem" }}>
              {match.current_participants}/{match.max_participants}
            </p>
          </div>
        </div>

        {/* Payment notice for paid matches */}
        {isPaid && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "14px 18px",
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "var(--radius-md)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <FiLock size={18} style={{ color: "#a78bfa", flexShrink: 0 }} />
            <div>
              <p
                style={{
                  fontWeight: "600",
                  fontSize: "13px",
                  marginBottom: "2px",
                  color: "#c4b5fd",
                }}
              >
                Entry fee: ${match.entry_fee} on {targetChain?.name ?? "Base"}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                Payment is sent to the Zyphnex treasury via your connected
                wallet. Network:{" "}
                <strong style={{ color: "#4ade80" }}>
                  🌐 Mainnet
                </strong>
              </p>
            </div>
          </motion.div>
        )}

        {/* Virtual Balance Info */}
        <div
          style={{
            padding: "16px 20px",
            background: "rgba(0, 206, 209, 0.06)",
            border: "1px solid rgba(0, 206, 209, 0.15)",
            borderRadius: "var(--radius-md)",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <FiZap
            size={24}
            style={{ color: "var(--cyan-primary)", flexShrink: 0 }}
          />
          <div>
            <p
              style={{
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "4px",
              }}
            >
              1,000 Virtual Points
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              You'll receive virtual points to distribute across 10 tokens of
              your choice
            </p>
          </div>
        </div>

        {/* Rules */}
        <div style={{ marginBottom: "28px" }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            How It Works
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {(
              match.rules || [
                "Select 10 tokens from a pool of 20",
                "Each token gets 100 virtual points",
                "Real-time performance tracking",
                "Top performers share the prize pool",
              ]
            ).map((rule, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "var(--cyan-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FiCheck size={12} style={{ color: "var(--cyan-primary)" }} />
                </div>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                  }}
                >
                  {rule}
                </span>
              </div>
            ))}
          </div>
        </div>

        {(error || payError) && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              color: "var(--danger)",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            {error || payError}
          </div>
        )}

        {/* Join Button */}
        <button
          className="btn-primary"
          onClick={handleJoin}
          disabled={joining || isPaying}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "15px",
            borderRadius: "var(--radius-md)",
            opacity: joining || isPaying ? 0.7 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {getButtonLabel()}
        </button>

        {isPaid && !isConnected && (
          <p
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "var(--text-muted)",
              marginTop: "10px",
            }}
          >
            ⚠ Connect your wallet above to pay the entry fee
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default MatchEntry;
