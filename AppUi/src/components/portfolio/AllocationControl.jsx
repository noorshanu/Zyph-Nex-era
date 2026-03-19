import { motion } from "framer-motion";

const AllocationControl = ({
  asset,
  value,
  onChange,
  min = 50,
  max = 500,
  total = 1000,
}) => {
  const percentage = ((value / total) * 100).toFixed(1);

  return (
    <div
      className="glass"
      style={{ padding: "16px", borderRadius: "var(--radius-md)" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "var(--blue-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {asset.icon || asset.symbol.charAt(0)}
          </div>
          <div>
            <p style={{ fontWeight: "600", fontSize: "14px" }}>
              {asset.symbol}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {asset.name}
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ fontWeight: "700", fontSize: "18px" }}>{value}</p>
          <p style={{ fontSize: "11px", color: "var(--blue-secondary)" }}>
            {percentage}%
          </p>
        </div>
      </div>

      {/* Slider */}
      <div style={{ position: "relative" }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{
            width: "100%",
            height: "8px",
            borderRadius: "4px",
            appearance: "none",
            background: `linear-gradient(to right, var(--blue-primary) 0%, var(--blue-primary) ${((value - min) / (max - min)) * 100}%, var(--glass-border) ${((value - min) / (max - min)) * 100}%, var(--glass-border) 100%)`,
            cursor: "pointer",
          }}
        />
      </div>

      {/* Min/Max labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
        }}
      >
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Min: {min}
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Max: {max}
        </span>
      </div>
    </div>
  );
};

export default AllocationControl;
