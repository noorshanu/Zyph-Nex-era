import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Layout
import AppShell from "./components/layout/AppShell";

// Pages
import ConnectWallet from "./pages/ConnectWallet";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Lobby from "./pages/Lobby";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Onboarding Flow
import Onboarding from "./pages/Onboarding";
import PracticeMatch from "./pages/PracticeMatch";

// Match Flow
import MatchEntry from "./pages/MatchEntry";
import AssetSelection from "./pages/AssetSelection";
import WaitingRoom from "./pages/WaitingRoom";
import LiveMatch from "./pages/LiveMatch";
import Results from "./pages/Results";
import MatchHistory from "./pages/MatchHistory";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Wallet Connect (default for users) */}
          <Route path="/" element={<ConnectWallet />} />

          {/* Admin Auth Routes (hidden, for admin access only) */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/signup" element={<Signup />} />

          {/* Onboarding (protected, no AppShell) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <PracticeMatch />
              </ProtectedRoute>
            }
          />

          {/* Main App with AppShell layout (protected) */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Match Flow: Entry → Select Tokens → Wait → Live → Results */}
            <Route path="/match/:id/entry" element={<MatchEntry />} />
            <Route path="/match/:id/select" element={<AssetSelection />} />
            <Route path="/match/:id/waiting" element={<WaitingRoom />} />
            <Route path="/match/:id/live" element={<LiveMatch />} />
            <Route path="/match/:id/results" element={<Results />} />
            <Route path="/history" element={<MatchHistory />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
