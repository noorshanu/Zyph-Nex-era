import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    // No token = not authenticated, skip API call
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      setUser(response.data?.user || response.data);
      setIsAuthenticated(true);
    } catch (_err) {
      // 401 is expected when token is invalid/expired - silently clear
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    setUser(response.data || response.user);
    setIsAuthenticated(true);
    return response;
  };

  const signup = async (userData) => {
    const response = await authApi.signup(userData);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    setUser(response.data || response.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  const walletLogin = async (walletAddress) => {
    const response = await authApi.walletAuth(walletAddress);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    setUser(response.data?.user || response.user);
    setIsAuthenticated(true);
    return response;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    walletLogin,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
