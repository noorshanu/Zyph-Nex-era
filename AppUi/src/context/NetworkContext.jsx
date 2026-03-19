import { createContext, useContext, useState } from "react";

const NetworkContext = createContext(null);

const STORAGE_KEY = "zyph_network";

export const NetworkProvider = ({ children }) => {
  const [network] = useState("mainnet");

  const setNetwork = () => {
    // Disabled switching out of mainnet
    console.warn("Network switching is disabled. Mainnet only.");
  };

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetwork must be used inside NetworkProvider");
  return ctx;
};
