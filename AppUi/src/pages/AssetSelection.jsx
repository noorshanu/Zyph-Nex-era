import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiArrowLeft, FiLock } from "react-icons/fi";
import { matchesApi } from "../services/api";
import { usePrices } from "../hooks/usePrices";

const MAX_TOKENS = 10;
const VIRTUAL_BALANCE = 1000;

const AssetSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tokens: TOKENS, loading: pricesLoading, error: pricesError } = usePrices();
  const [selected, setSelected] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleToken = (symbol) => {
    if (selected.includes(symbol)) {
      setSelected(selected.filter((s) => s !== symbol));
    } else if (selected.length < MAX_TOKENS) {
      setSelected([...selected, symbol]);
    }
  };

  const handleConfirmSelection = () => {
    if (selected.length !== MAX_TOKENS) return;
    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    setSubmitting(true);
    setError("");

    const amountEach = VIRTUAL_BALANCE / MAX_TOKENS;
    const portfolio = {
      assets: selected,
      allocations: selected.map((symbol) => ({ asset: symbol, amount: amountEach })),
    };

    try {
      await matchesApi.submitPortfolio(id, portfolio);
      await matchesApi.lockPortfolio(id);
      navigate(`/match/${id}/waiting`);
    } catch (err) {
      setError(err.message || "Failed to submit portfolio");
      // Fallback: navigate anyway for demo
      setTimeout(() => navigate(`/match/${id}/waiting`), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const allSelected = selected.length === MAX_TOKENS;

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(`/match/${id}/entry`)}
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
        Back
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "24px" }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          Pick Your Tokens
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Select {MAX_TOKENS} tokens from the pool below. Prices and 24h change are live.
        </p>
        {pricesError && (
          <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
            {pricesError}
          </p>
        )}
      </motion.div>

      {/* Selection Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div
          className="glass"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            borderRadius: "30px",
            border: allSelected
              ? "1px solid var(--cyan-primary)"
              : "1px solid var(--glass-border)",
            background: allSelected
              ? "rgba(0, 206, 209, 0.08)"
              : "var(--glass-bg)",
          }}
        >
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Selected:
          </span>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: allSelected
                ? "var(--cyan-primary)"
                : "var(--text-primary)",
            }}
          >
            {selected.length}
            <span
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginLeft: "2px",
              }}
            >
              / {MAX_TOKENS}
            </span>
          </span>
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          💰 {VIRTUAL_BALANCE} virtual points
        </div>
      </motion.div>

      {/* Tokens Grid */}
      {pricesLoading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          Loading live prices…
        </div>
      ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {TOKENS.map((token, index) => {
          const isSelected = selected.includes(token.symbol);
          const isDisabled = !isSelected && selected.length >= MAX_TOKENS;

          return (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => !isDisabled && toggleToken(token.symbol)}
              style={{
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                border: isSelected
                  ? "1px solid var(--cyan-primary)"
                  : "1px solid var(--glass-border)",
                background: isSelected
                  ? "rgba(0, 206, 209, 0.06)"
                  : "var(--glass-bg)",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.4 : 1,
                transition: "all 0.2s ease",
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {/* Checkmark */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "var(--cyan-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiCheck size={12} color="#000" strokeWidth={3} />
                </div>
              )}

              {/* Token Icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: isSelected
                    ? "var(--cyan-primary)"
                    : "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                {token.symbol.charAt(0)}
              </div>

              {/* Token Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: isSelected
                        ? "var(--cyan-primary)"
                        : "var(--text-primary)",
                    }}
                  >
                    {token.symbol}
                  </p>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color:
                        (token.change ?? 0) >= 0 ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {(token.change ?? 0) >= 0 ? "+" : ""}
                    {(token.change ?? 0).toFixed(2)}%
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                  }}
                >
                  {token.name}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Sticky Bottom Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          position: "sticky",
          bottom: "24px",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          className="btn-primary"
          onClick={handleConfirmSelection}
          disabled={!allSelected}
          style={{
            padding: "14px 48px",
            fontSize: "15px",
            borderRadius: "var(--radius-md)",
            boxShadow: allSelected ? "var(--glow-cyan)" : "none",
            opacity: allSelected ? 1 : 0.5,
          }}
        >
          {allSelected
            ? "Confirm Selection"
            : `Select ${MAX_TOKENS - selected.length} more`}
        </button>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: "480px",
                padding: "32px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                Confirm Your Tokens
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  textAlign: "center",
                  marginBottom: "24px",
                }}
              >
                {VIRTUAL_BALANCE} virtual points split equally across your
                selections
              </p>

              {/* Selected Tokens List */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  marginBottom: "24px",
                }}
              >
                {selected.map((symbol) => {
                  const token = TOKENS.find((t) => t.symbol === symbol);
                  return (
                    <div
                      key={symbol}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        background: "var(--bg-tertiary)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--glass-border)",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: "rgba(0, 206, 209, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "var(--cyan-primary)",
                          flexShrink: 0,
                        }}
                      >
                        {symbol.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
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
                          {token?.name}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "var(--cyan-primary)",
                        }}
                      >
                        100 pts
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(0, 206, 209, 0.06)",
                  border: "1px solid rgba(0, 206, 209, 0.15)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Total Virtual Points
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "var(--cyan-primary)",
                  }}
                >
                  {VIRTUAL_BALANCE}
                </span>
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "16px",
                    color: "var(--danger)",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >
                <button
                  className="btn-secondary"
                  onClick={() => setShowConfirm(false)}
                  style={{ flex: 1, padding: "14px" }}
                >
                  Edit
                </button>
                <button
                  className="btn-primary"
                  onClick={handleFinalConfirm}
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <FiLock size={14} />
                  {submitting ? "Locking..." : "Lock & Enter Match"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssetSelection;
