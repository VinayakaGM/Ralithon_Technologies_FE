"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import AuthService from "@/services/auth.service";
import { User } from "@/types/auth.types";
import axios from "axios";
import { SessionExpiredModal } from "@/components/SessionExpiredModal";
import { useRouter } from "next/navigation";

type SessionContextType = {
  isLoggedIn: boolean;
  sessionExpired: boolean;
  login: (token: string, userData: User) => void;
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
  const isLoggedInRef = useRef(isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  const handleUnauthorized = () => {
    const wasLoggedIn = isLoggedInRef.current;
    const hasToken = !!AuthService.getAuthToken();

    if (wasLoggedIn || hasToken) {
      setSessionExpired(true);
      AuthService.logout();
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    const initialCheck = () => {
      const authenticated = AuthService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setUser(AuthService.getCurrentUser());
      console.log("Initial auth check - isAuthenticated:", authenticated);
    };

    initialCheck();

    const axiosResponseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error) {
          handleUnauthorized();
        } else if (error.code === "ERR_NETWORK") {
          console.log("Network error - check API URL and connectivity");
        }
        return Promise.reject(error);
      }
    );

    const axiosRequestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = AuthService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log("No auth token available for request");
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(axiosResponseInterceptor);
      axios.interceptors.request.eject(axiosRequestInterceptor);
    };
  }, []);

  const login = (token: string, userData: User) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
      } catch (error) {
        console.error("Error storing user data:", error);
      }
    }

    setIsLoggedIn(true);
    setSessionExpired(false);
    setUser(userData);
  };

  const logout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setUser(null);
    setSessionExpired(false);
    router.push("/");
  };

  const dismissExpired = () => {
    setSessionExpired(false);
  };

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn,
        sessionExpired,
        login,
        logout,
        dismissExpired,
        user,
      }}
    >
      {children}
      {sessionExpired && (
        <SessionExpiredModal
          isOpen={sessionExpired}
          onClose={dismissExpired}
          onLoginRedirect={() => {
            dismissExpired();
            router.push("/");
          }}
        />
      )}
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
