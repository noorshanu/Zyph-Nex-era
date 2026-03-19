import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSettings,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
  FiCpu,
} from "react-icons/fi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useAuth } from "../context/AuthContext";
import ProfileSetup from "./profile/ProfileSetup";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { isConnected, address, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, walletLogin, logout, user } = useAuth();

  const { data: balanceData } = useBalance({
    address,
    chainId,
    query: { enabled: !!address },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Wallet Connection & Auth
  useEffect(() => {
    const handleWalletAuth = async () => {
      if (isConnected && address && !isAuthenticated) {
        try {
          const response = await walletLogin(address);
          if (response?.data?.isNewUser) {
            setShowProfileSetup(true);
          }
        } catch (error) {
          console.error("Wallet login failed:", error);
          disconnect(); // Disconnect if backend auth fails
        }
      } else if (!isConnected && isAuthenticated) {
        logout();
      }
    };

    handleWalletAuth();
  }, [isConnected, address, isAuthenticated, walletLogin, logout, disconnect]);

  const navLinks = [
    { name: "Lobby", path: "/lobby" },
    { name: "History", path: "/history" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <Link to="/lobby" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <img 
              src="/logo.png" 
              alt="Stravex Logo" 
              style={{ height: "48px", width: "auto", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }} 
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {/* Desktop nav links */}
          <div className="desktop-nav" style={{ display: "flex", gap: "24px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "color 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.color = "var(--text-secondary)")
                }
              >
                {link.name === "Practice" && <FiCpu size={14} />}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Balance Pill */}
          {isConnected && balanceData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08))",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "#60a5fa",
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "0.3px",
                boxShadow: "0 0 12px rgba(59,130,246,0.1)",
              }}
            >
              <span style={{ fontSize: "14px" }}>⟠</span>
              <span style={{ fontFamily: "monospace" }}>
                {parseFloat(balanceData.formatted).toFixed(4)}
              </span>
              <span style={{ fontSize: "11px", opacity: 0.7 }}>
                {balanceData.symbol}
              </span>
            </motion.div>
          )}


          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== "loading";
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === "authenticated");

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <motion.button
                          onClick={openConnectModal}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="glass-button"
                          style={{
                            padding: "8px 16px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          Connect Wallet
                        </motion.button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "12px",
                            background: "#ff4d4f",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          onClick={openChainModal}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "12px",
                            padding: "6px 12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            cursor: "pointer",
                            color: "white",
                          }}
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 20,
                                height: 20,
                                borderRadius: 999,
                                overflow: "hidden",
                                marginRight: 8,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 20, height: 20 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <div ref={dropdownRef} style={{ position: "relative" }}>
                          <motion.button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              background: "rgba(255, 255, 255, 0.1)",
                              borderRadius: "12px",
                              padding: "6px 12px",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              cursor: "pointer",
                              color: "white",
                              gap: "8px",
                            }}
                          >
                            <div className="hidden md:flex flex-col items-end mr-2">
                              <span className="text-xs text-gray-400 font-mono">
                                {account.displayBalance
                                  ? `${account.displayBalance} `
                                  : ""}
                              </span>
                              <span className="text-xs text-white font-mono">
                                {account.address.slice(0, 6)}...
                                {account.address.slice(-4)}
                              </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold border-2 border-white/10">
                              {user?.firstName?.[0] || "U"}
                            </div>
                          </motion.button>

                          <AnimatePresence>
                            {isDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="glass"
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 12px)",
                                  right: 0,
                                  width: "240px",
                                  padding: "16px",
                                  borderRadius: "16px",
                                  background: "rgba(18, 18, 18, 0.95)",
                                  backdropFilter: "blur(20px)",
                                  border: "1px solid rgba(255, 255, 255, 0.08)",
                                  boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                                  zIndex: 100,
                                }}
                              >
                                {/* User Info Header */}
                                <div style={{ 
                                  padding: "12px 16px", 
                                  marginBottom: "16px", 
                                  background: "rgba(255,255,255,0.03)", 
                                  borderRadius: "12px", 
                                  border: "1px solid rgba(255,255,255,0.05)" 
                                }}>
                                  <p style={{ fontSize: "11px", color: "var(--cyan-primary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>
                                    {user?.username ? `@${user.username}` : "Connected Wallet"}
                                  </p>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)" }} />
                                    <p style={{ margin: 0, fontSize: "14px", fontFamily: "monospace", color: "var(--text-primary)", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : account.displayName}
                                    </p>
                                  </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <div
                                    onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}
                                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "14px", transition: "all 0.2s" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                                  >
                                    <FiUser size={16} color="var(--cyan-primary)" />
                                    <span>Profile</span>
                                  </div>
                                  <div
                                    onClick={() => { setIsDropdownOpen(false); navigate("/settings"); }}
                                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "14px", transition: "all 0.2s" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                                  >
                                    <FiSettings size={16} color="#a855f7" />
                                    <span>Settings</span>
                                  </div>

                                  <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "8px 0" }} />

                                  {/* Wallet Info Action */}
                                  <div
                                    onClick={() => { setIsDropdownOpen(false); openAccountModal(); }}
                                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "14px", transition: "all 0.2s" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                                  >
                                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1px solid currentColor", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>W</div>
                                    <span>Wallet Details</span>
                                  </div>

                                  <div
                                    onClick={() => { setIsDropdownOpen(false); logout(); disconnect(); }}
                                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", color: "#ef4444", fontSize: "14px", transition: "all 0.2s" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                  >
                                    <FiLogOut size={16} />
                                    <span>Disconnect</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>

          {/* Mobile Menu Button */}
          <motion.button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass mobile-nav"
              style={{
                position: "absolute",
                top: "70px",
                left: 0,
                right: 0,
                padding: "16px 32px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <ConnectButton showBalance={false} />
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    fontSize: "14px",
                    padding: "8px 0",
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: block !important; }
          }
        `}</style>
      </motion.nav>

      <ProfileSetup
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
      />
    </>
  );
};

export default Navbar;
