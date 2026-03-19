import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { matchesApi } from "../services/api";
import { usePrices } from "../hooks/usePrices";

const TOTAL_CAPITAL = 1000;

const Allocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tokens: priceTokens } = usePrices();
  const ASSETS_DATA = useMemo(() => {
    const map = {};
    priceTokens.forEach((t) => {
      map[t.symbol] = {
        symbol: t.symbol,
        name: t.name,
        pair: `${t.symbol}/USD`,
        price: t.price ?? 0,
        icon: t.icon ?? t.symbol.charAt(0),
      };
    });
    return map;
  }, [priceTokens]);

  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Colors for donut chart
  const COLORS = ["#00CED1", "#20B2AA", "#40E0D0", "#48D1CC", "#5F9EA0"];

  useEffect(() => {
    const stored = localStorage.getItem("selectedAssets");
    if (stored) {
      const symbols = JSON.parse(stored);
      setSelectedSymbols(symbols);
      const initial = {};
      symbols.forEach((s) => {
        initial[s] = 200; // Default equal allocation
      });
      setAllocations(initial);
    }
  }, []);

  const totalAllocated = Object.values(allocations).reduce(
    (sum, val) => sum + val,
    0,
  );
  const isValid = totalAllocated === TOTAL_CAPITAL;

  const handleAllocationChange = (symbol, value) => {
    // Enforce 100 increments
    const val = parseInt(value) || 0;
    setAllocations((prev) => ({ ...prev, [symbol]: val }));
  };

  const handleConfirm = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError("");

    const portfolio = {
      assets: selectedSymbols,
      allocations: selectedSymbols.map((symbol) => ({
        asset: symbol,
        amount: allocations[symbol] ?? 0,
      })),
    };

    try {
      await matchesApi.submitPortfolio(id, portfolio);
      await matchesApi.lockPortfolio(id);

      localStorage.removeItem("selectedAssets");
      navigate(`/match/${id}/waiting`);
    } catch (err) {
      setError(err.message || "Failed to submit portfolio");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate percentages for display
  const getPercentage = (value) => ((value / TOTAL_CAPITAL) * 100).toFixed(0);

  // Calculate risk level based on concentration
  const getRiskLevel = () => {
    const values = Object.values(allocations);
    const max = Math.max(...values);
    const concentration = max / TOTAL_CAPITAL;
    if (concentration > 0.4)
      return { level: "High Risk", color: "var(--danger)", position: 80 };
    if (concentration > 0.3)
      return { level: "Medium Risk", color: "var(--warning)", position: 50 };
    return { level: "Low Risk", color: "var(--success)", position: 20 };
  };

  const risk = getRiskLevel();

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "8px", textAlign: "center" }}
      >
        <span
          className="badge badge-primary mb-4"
          style={{ padding: "8px 16px", fontSize: "12px" }}
        >
          STEP 2 OF 2
        </span>
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>
          Allocate Your Capital
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Distribute {TOTAL_CAPITAL} units across your 5 assets in 100-unit
          blocks.
        </p>
      </motion.div>

      {/* Total Capital */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: "32px", textAlign: "center" }}
      >
        <div className="glass inline-flex items-center px-6 py-3 rounded-full gap-3">
          <span className="text-gray-400">Total Allocated:</span>
          <span
            className={`text-xl font-bold ${isValid ? "text-success" : "text-warning"}`}
          >
            {totalAllocated} / {TOTAL_CAPITAL}
          </span>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-red-500 text-center text-sm">
          {error}
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}
      >
        {/* Left Panel - Asset Allocation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{ padding: "32px" }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              marginBottom: "24px",
              color: "var(--text-secondary)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Asset Allocation</span>
            <span className="text-xs text-muted font-normal">
              Min 100 / Max 500 per asset
            </span>
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {selectedSymbols.map((symbol, index) => {
              const asset = ASSETS_DATA[symbol] || {
                symbol,
                name: symbol,
                pair: `${symbol}/USD`,
                price: 0,
              };
              return (
                <div
                  key={symbol}
                  className="glass"
                  style={{
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Color indicator */}
                  <div
                    style={{
                      width: "4px",
                      height: "40px",
                      borderRadius: "2px",
                      background: COLORS[index],
                    }}
                  />

                  {/* Asset info */}
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{asset.icon}</span>
                      <span className="font-bold text-white">{asset.pair}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      ${asset.price?.toLocaleString()}
                    </p>
                  </div>

                  {/* Allocation input */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <input
                      type="number"
                      value={allocations[symbol] || 0}
                      onChange={(e) =>
                        handleAllocationChange(symbol, e.target.value)
                      }
                      step={100}
                      min={100}
                      max={500}
                      style={{
                        width: "80px",
                        padding: "8px 12px",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--text-primary)",
                        textAlign: "center",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        minWidth: "35px",
                      }}
                    >
                      {getPercentage(allocations[symbol] || 0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Panel - Portfolio Distribution & Risk */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Donut Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
            style={{
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "32px",
                color: "var(--text-secondary)",
                alignSelf: "flex-start",
              }}
            >
              Portfolio Distribution
            </h3>

            <div
              style={{
                position: "relative",
                width: "220px",
                height: "220px",
                marginBottom: "32px",
              }}
            >
              {/* SVG Donut */}
              <svg
                viewBox="0 0 100 100"
                style={{
                  transform: "rotate(-90deg)",
                  width: "100%",
                  height: "100%",
                }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#1a1a20"
                  strokeWidth="20"
                  fill="none"
                />
                {
                  selectedSymbols.reduce(
                    (acc, symbol, index) => {
                      const value = allocations[symbol] || 0;
                      const percentage = value / TOTAL_CAPITAL;
                      const prevOffset = acc.offset;
                      const circumference = 2 * Math.PI * 40;
                      const dashArray = percentage * circumference;
                      acc.offset += dashArray;
                      acc.elements.push(
                        <circle
                          key={symbol}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={COLORS[index]}
                          strokeWidth="20"
                          strokeDasharray={`${dashArray} ${circumference}`}
                          strokeDashoffset={-prevOffset}
                          style={{ transition: "all 0.5s ease" }}
                        />,
                      );
                      return acc;
                    },
                    { elements: [], offset: 0 },
                  ).elements
                }
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: isValid
                      ? "var(--cyan-primary)"
                      : "var(--text-primary)",
                  }}
                >
                  {totalAllocated}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  OF {TOTAL_CAPITAL}
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {selectedSymbols.map((symbol, index) => (
                <div
                  key={symbol}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      background: COLORS[index],
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {symbol} ({getPercentage(allocations[symbol] || 0)}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Risk Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: "24px" }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "24px",
                color: "var(--text-secondary)",
              }}
            >
              Risk Analysis
            </h3>

            <div
              style={{
                position: "relative",
                height: "8px",
                background:
                  "linear-gradient(90deg, var(--success), var(--warning), var(--danger))",
                borderRadius: "4px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  left: `${risk.position}%`,
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "white",
                  border: `3px solid ${risk.color}`,
                  transform: "translateX(-50%)",
                  transition: "left 0.3s ease",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Diversified</span>
              <span>Concentrated</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          className="btn-secondary"
          onClick={() => navigate(`/match/${id}/assets`)}
        >
          Back
        </button>

        <div className="text-center flex flex-col items-center">
          {!isValid && (
            <span className="text-warning text-sm mb-2">
              Allocate all {TOTAL_CAPITAL} units to proceed
            </span>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handleConfirm}
          disabled={!isValid || submitting}
          style={{
            opacity: isValid ? 1 : 0.5,
            width: "200px",
            boxShadow: isValid ? "var(--glow-cyan)" : "none",
          }}
        >
          {submitting ? "Locking..." : "Lock Portfolio"}
        </button>
      </motion.div>
    </div>
  );
};

export default Allocation;
