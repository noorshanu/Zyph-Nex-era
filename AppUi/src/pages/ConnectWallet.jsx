import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAuth } from "../context/AuthContext";

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { walletLogin, isAuthenticated, loading } = useAuth();
  const { address, isConnected } = useAccount();
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const lastAttemptedAddress = useRef(null);

  // When wallet connects, authenticate with backend
  useEffect(() => {
    const authenticateWallet = async () => {
      if (
        isConnected &&
        address &&
        !isAuthenticated &&
        !isAuthenticating &&
        lastAttemptedAddress.current !== address
      ) {
        lastAttemptedAddress.current = address;
        setIsAuthenticating(true);
        setError("");

        try {
          const response = await walletLogin(address);
          // New users go to onboarding, returning users to lobby
          if (response.data?.isNewUser) {
            navigate("/onboarding");
          } else {
            navigate("/lobby");
          }
        } catch (err) {
          setError(err.message || "Failed to authenticate wallet");
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    authenticateWallet();
  }, [isConnected, address, isAuthenticated, walletLogin, navigate]);

  // If already authenticated, redirect to lobby
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/lobby");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div
        className="bg-gradient-radial"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="bg-gradient-radial"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: "420px", padding: "48px 40px" }}
      >
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          style={{ textAlign: "center", marginBottom: "40px", position: "relative" }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "140px",
              height: "140px",
              background: "var(--blue-primary)",
              opacity: 0.15,
              filter: "blur(40px)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          
          <motion.img
            src="/logo.png"
            alt="ZyphNex Logo"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              width: "90px",
              height: "90px",
              objectFit: "contain",
              margin: "0 auto 16px",
              display: "block",
              position: "relative",
              zIndex: 1,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
            }}
          />
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "800",
              letterSpacing: "3px",
              marginBottom: "12px",
              background: "linear-gradient(135deg, #ffffff 0%, var(--cyan-primary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              position: "relative",
              zIndex: 1,
              textTransform: "uppercase"
            }}
          >
        Stravex
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "15px",
              lineHeight: "1.5",
              maxWidth: "280px",
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            Predict trends. Compete on trading skill, not luck.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
              color: "var(--danger)",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Connect Button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "15px",
              textAlign: "center",
            }}
          >
            Connect your wallet to enter
          </p>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="address"
            />
          </div>

          {isAuthenticating && (
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Authenticating...
            </p>
          )}
        </div>

        {/* Network Info */}
        <div
          style={{
            marginTop: "40px",
            padding: "16px",
            background: "rgba(0, 212, 255, 0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(0, 212, 255, 0.1)",
          }}
        >
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "12px",
              textAlign: "center",
              margin: 0,
            }}
          >
            🔗 Powered by Base Network
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ConnectWallet;
