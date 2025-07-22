import { useActiveAddress, useConnection } from "@arweave-wallet-kit/react";
import React, { createContext, useContext } from "react";

interface User {
  connected: boolean;
  address?: string;
}

const UserContext = createContext<User | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connected } = useConnection();
  const address = useActiveAddress();

  return (
    <UserContext.Provider value={{ connected, address }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): User => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};