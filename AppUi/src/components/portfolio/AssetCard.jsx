import { motion } from "framer-motion";

const AssetCard = ({ asset, isSelected, onClick, allocation }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="glass-card"
      style={{
        padding: "16px",
        cursor: "pointer",
        border: isSelected
          ? "2px solid var(--blue-primary)"
          : "1px solid var(--glass-border)",
        background: isSelected ? "var(--blue-subtle)" : "var(--glass-bg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Icon */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: isSelected
              ? "linear-gradient(135deg, var(--blue-primary), var(--blue-accent))"
              : "var(--glass-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          {asset.icon || asset.symbol.charAt(0)}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: "600", marginBottom: "2px" }}>
            {asset.symbol}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {asset.name}
          </p>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "var(--success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
            }}
          >
            ✓
          </motion.div>
        )}
      </div>

      {/* Allocation display */}
      {allocation !== undefined && isSelected && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid var(--glass-border)",
          }}
        >
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Allocation:{" "}
            <span style={{ color: "var(--blue-secondary)", fontWeight: "600" }}>
              {allocation}
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AssetCard;
