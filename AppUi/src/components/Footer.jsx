import { FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="glass"
      style={{
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
        © {currentYear} ZyphNex. All rights reserved.
      </p>

      <div style={{ display: "flex", gap: "16px" }}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--text-secondary)",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--blue-primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
        >
          <FiGithub size={20} />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--text-secondary)",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--blue-primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
        >
          <FiTwitter size={20} />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--text-secondary)",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--blue-primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
        >
          <FiLinkedin size={20} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
