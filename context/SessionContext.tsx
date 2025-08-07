"use client";

import { createContext, useContext, useState, useEffect } from "react";

type SessionContextType = {
  isLoggedIn: boolean;
  sessionExpired: boolean;
  login: () => void;
  logout: () => void;
  dismissExpired: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Check initial auth state
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);

    // Listen for 401 errors
    const handleSessionExpired = () => {
      if (isLoggedIn) {
        setSessionExpired(true);
        logout();
      }
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("session-expired", handleSessionExpired);
  }, [isLoggedIn]);

  const login = () => {
    setIsLoggedIn(true);
    setSessionExpired(false);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
  };

  const dismissExpired = () => {
    setSessionExpired(false);
  };

  return (
    <SessionContext.Provider
      value={{ isLoggedIn, sessionExpired, login, logout, dismissExpired }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};
