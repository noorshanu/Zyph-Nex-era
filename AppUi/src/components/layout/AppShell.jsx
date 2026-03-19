import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

const AppShell = () => {
  return (
    <div className="bg-mesh" style={{ minHeight: "100vh" }}>
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main style={{ paddingTop: "70px", minHeight: "100vh" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
