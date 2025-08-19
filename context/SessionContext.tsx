"use client";

import { createContext, useContext, useState, useEffect } from "react";
import AuthService from "@/services/auth.service";
import { User } from "@/types/auth.types";

type SessionContextType = {
  isLoggedIn: boolean;
  sessionExpired: boolean;
  login: (token: string) => void;
  logout: () => void;
  dismissExpired: () => void;
  user: User | null;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check initial auth state using AuthService
    const initialCheck = () => {
      const authenticated = AuthService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setUser(AuthService.getCurrentUser());
    };

    initialCheck();

    const handleUnauthorized = () => {
      if (isLoggedIn) {
        setSessionExpired(true);
        logout();
      }
    };

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        handleUnauthorized();
      }
      return response;
    };

    window.addEventListener("session-expired", handleUnauthorized);
    
    return () => {
      window.removeEventListener("session-expired", handleUnauthorized);
      window.fetch = originalFetch;
    };
  }, [isLoggedIn]);

  const login = (token: string) => {
    setIsLoggedIn(true);
    setSessionExpired(false);
    setUser(AuthService.getCurrentUser());
  };

  const logout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  const dismissExpired = () => {
    setSessionExpired(false);
  };

  return (
    <SessionContext.Provider
      value={{ isLoggedIn, sessionExpired, login, logout, dismissExpired, user }}
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