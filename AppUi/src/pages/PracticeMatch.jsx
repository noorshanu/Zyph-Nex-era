import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiAward,
  FiDollarSign,
  FiCheck,
  FiTrendingUp,
  FiCpu,
} from "react-icons/fi";
import { usersApi } from "../services/api";
import { usePrices } from "../hooks/usePrices";

const ASSET_COLORS = [
  "#F7931A", "#627EEA", "#14F195", "#F3BA2F", "#0033AD", "#23292F",
  "#E6007A", "#C2A633", "#E84142", "#2A5ADA", "#8247E5", "#FF007A",
  "#345D9D", "#2E3148", "#328332", "#08B5E5", "#0090FF", "#222222",
  "#15BDFF", "#29ABE2",
];

const PracticeMatch = () => {
  const navigate = useNavigate();
  const { tokens: priceTokens } = usePrices();
  const ASSETS = useMemo(
    () =>
      priceTokens.map((t, i) => ({
        id: t.symbol,
        name: t.name,
        price: t.price ?? 0,
        color: ASSET_COLORS[i % ASSET_COLORS.length],
      })),
    [priceTokens]
  );

  const [phase, setPhase] = useState("lobby"); // lobby, selection, payment, simulation, result
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [leaderboard, setLeaderboard] = useState([]);

  // Simulation State
  const [userRank, setUserRank] = useState(15);
  const [userScore, setUserScore] = useState(0);

  // --- LOGIC ---

  // Timer logic for simulation
  useEffect(() => {
    if (phase === "simulation") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("result");
            return 0;
          }
          return prev - 1;
        });

        // Random rank fluctuation
        setUserRank((prev) =>
          Math.max(1, Math.min(20, prev + Math.floor(Math.random() * 3) - 1)),
        );
        setUserScore((prev) => prev + (Math.random() - 0.45)); // Slight upward trend
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Initial Leaderboard Generation
  useEffect(() => {
    if (phase === "simulation") {
      const generateLeaderboard = () => {
        return Array.from({ length: 10 }, (_, i) => ({
          name: `Player ${Math.floor(Math.random() * 1000)}`,
          score: (Math.random() * 20 + 5).toFixed(2),
          rank: i + 1,
        }));
      };

      // Use setTimeout to avoid synchronous state update warning during render phase (if any)
      // and only initialize if empty
      setTimeout(() => {
        setLeaderboard((prev) =>
          prev.length === 0 ? generateLeaderboard() : prev,
        );
      }, 0);

      const interval = setInterval(() => {
        setLeaderboard((prev) =>
          prev
            .map((p) => ({
              ...p,
              score: (parseFloat(p.score) + (Math.random() - 0.3)).toFixed(2),
            }))
            .sort((a, b) => b.score - a.score)
            .map((p, i) => ({ ...p, rank: i + 1 })),
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [phase]);

  // Complete Practice API Call
  useEffect(() => {
    if (phase === "result") {
      usersApi
        .completePractice()
        .catch((err) =>
          console.error("Failed to mark practice complete:", err),
        );
    }
  }, [phase]);

  const handleAssetToggle = (assetId) => {
    if (selectedAssets.includes(assetId)) {
      setSelectedAssets((prev) => prev.filter((id) => id !== assetId));
    } else {
      if (selectedAssets.length < 10) {
        setSelectedAssets((prev) => [...prev, assetId]);
      }
    }
  };

  const handlePayment = () => {
    // Simulate API call for payment
    setTimeout(() => {
      setPhase("simulation");
    }, 1500);
  };

  // --- RENDERERS ---

  const renderLobby = () => (
    <div className="max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Practice Arena
        </h1>
        <p className="text-gray-400">
          Select a training simulation to hone your skills
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {[
          {
            id: 1,
            title: "Crypto Basics",
            desc: "Learn the fundamentals with top 20 assets.",
            icon: FiCpu,
            color: "from-blue-500/20 to-cyan-500/20",
            border: "group-hover:border-cyan-500/50",
          },
          {
            id: 2,
            title: "High Volatility",
            desc: "Master high-risk, high-reward trading scenarios.",
            icon: FiTrendingUp,
            color: "from-purple-500/20 to-pink-500/20",
            border: "group-hover:border-purple-500/50",
          },
        ].map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedMatch(card.id);
              setPhase("selection");
            }}
            className={`group relative glass p-8 rounded-2xl cursor-pointer border border-white/5 transition-all ${card.border} ${selectedMatch === card.id ? "ring-2 ring-cyan-500" : ""}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`}
            />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <card.icon size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
              <p className="text-gray-400 mb-6">{card.desc}</p>
              <div className="flex items-center gap-2 text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
                <FiDollarSign /> 1000 VL Entry
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSelection = () => (
    <div className="max-w-6xl mx-auto w-full px-4">
      <div className="flex justify-between items-center mb-8 sticky top-[80px] z-20 glass p-4 rounded-xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedMatch === 1 ? "Crypto Basics" : "High Volatility"} - Select
            Assets
          </h2>
          <p className="text-gray-400 text-sm">
            Choose exactly 10 assets to build your portfolio
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`px-4 py-2 rounded-lg font-mono font-bold ${
              selectedAssets.length === 10
                ? "bg-green-500/20 text-green-400"
                : "bg-white/5 text-gray-300"
            }`}
          >
            {selectedAssets.length} / 10 Selected
          </div>
          <button
            onClick={() => setPhase("payment")}
            disabled={selectedAssets.length !== 10}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              selectedAssets.length === 10
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-105"
                : "bg-white/5 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirmed Selection
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
        {ASSETS.map((asset) => {
          const isSelected = selectedAssets.includes(asset.id);
          return (
            <motion.div
              key={asset.id}
              whileHover={{ y: -2 }}
              onClick={() => handleAssetToggle(asset.id)}
              className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-cyan-500/10 border-cyan-500"
                  : "bg-white/5 border-white/5 hover:border-white/20"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                  <FiCheck size={12} className="text-black" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: asset.color + "40",
                    color: asset.color,
                  }}
                >
                  {asset.id[0]}
                </div>
                <span className="font-bold">{asset.id}</span>
              </div>
              <div className="text-sm text-gray-400">{asset.name}</div>
              <div className="text-lg font-mono mt-1">
                ${asset.price.toLocaleString()}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card max-w-md w-full p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center mb-6">
          <FiDollarSign size={40} className="text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Confirm Entry</h2>
        <p className="text-gray-400 mb-8">
          This practice match requires an entry fee of{" "}
          <span className="text-white font-bold">1,000 VL Coins</span>.
        </p>

        <div className="bg-white/5 rounded-xl p-4 mb-8 flex justify-between items-center">
          <span className="text-gray-400">Entry Fee</span>
          <span className="font-mono font-bold text-red-400">-1,000 VL</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setPhase("selection")}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            Pay & Start
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderSimulation = () => (
    <div className="max-w-6xl mx-auto w-full px-4 pt-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Simulation Area */}
        <div className="flex-[2] glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
              <FiClock className="text-cyan-400" />
              <span className="font-mono text-xl font-bold">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Live Simulation</h2>
            <p className="text-gray-400">
              Market is active. Watch your portfolio performance.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
            <motion.div
              className="text-6xl font-bold font-mono mb-4"
              animate={{
                scale: [1, 1.05, 1],
                color:
                  userScore >= 0
                    ? ["#4ade80", "#22c55e", "#4ade80"]
                    : ["#ef4444", "#dc2626", "#ef4444"],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {userScore > 0 ? "+" : ""}
              {userScore.toFixed(2)}%
            </motion.div>
            <div className="text-gray-400">Current PnL</div>

            <div className="mt-8 w-full max-w-md bg-white/5 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500"
                initial={{ width: "0%" }}
                animate={{ width: `${(timeLeft / 120) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="flex-1 glass rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FiAward className="text-yellow-400" /> Live Leaderboard
          </h3>
          <div className="space-y-3">
            {leaderboard.map((player) => (
              <motion.div
                key={player.name}
                layout
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      player.rank <= 3
                        ? "bg-yellow-500 text-black"
                        : "bg-white/10"
                    }`}
                  >
                    {player.rank}
                  </div>
                  <span className="text-sm">{player.name}</span>
                </div>
                <span className="font-mono text-green-400 font-bold">
                  +{player.score}%
                </span>
              </motion.div>
            ))}

            {/* User Rank (if not in top 10) */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-cyan-500 text-black">
                    {userRank}
                  </div>
                  <span className="text-sm font-bold">YOU</span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">
                  {userScore > 0 ? "+" : ""}
                  {userScore.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="max-w-md mx-auto w-full text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-8"
      >
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold mb-2">Practice Complete!</h2>
        <p className="text-gray-400 mb-8">
          You successfully simulated a market cycle.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-xl">
            <div className="text-gray-400 text-sm mb-1">Final Score</div>
            <div className="text-2xl font-bold text-green-400">
              +{userScore.toFixed(2)}%
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl">
            <div className="text-gray-400 text-sm mb-1">Rank</div>
            <div className="text-2xl font-bold text-cyan-400">#{userRank}</div>
          </div>
        </div>

        <button
          onClick={() => {
            setPhase("lobby");
            setSelectedAssets([]);
            setUserScore(0);
            setUserRank(15);
            setTimeLeft(120);
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all mb-4"
        >
          Play Again
        </button>

        <button
          onClick={() => navigate("/lobby")}
          className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
        >
          Back to Lobby
        </button>
      </motion.div>
    </div>
  );

  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4 bg-fixed bg-center bg-cover transition-all duration-500"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 10%, rgba(34, 211, 238, 0.1) 0%, rgba(0, 0, 0, 0) 50%)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
        >
          {phase === "lobby" && renderLobby()}
          {phase === "selection" && renderSelection()}
          {phase === "payment" && renderPayment()}
          {phase === "simulation" && renderSimulation()}
          {phase === "result" && renderResult()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PracticeMatch;
