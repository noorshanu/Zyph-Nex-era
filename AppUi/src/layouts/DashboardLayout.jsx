import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DashboardLayout = () => {
  return (
    <div
      className="bg-gradient-radial"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      {/* Main Content - offset for fixed navbar */}
      <main style={{ flex: 1, marginTop: "70px", padding: "24px 0" }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
