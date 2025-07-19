// services/auth.service.ts
import axios from "axios";
import {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
} from "../types/auth.types";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

class AuthService {
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}users/register`, userData, {
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      });

      if (response.data.token) {
        this.setUser(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}users/login`, credentials, {
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      });

      if (response.data.token) {
        this.setUser(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  private setUser(authData: AuthResponse): void {
    if (typeof window === "undefined") return;

    const user: User = {
      userId: authData.userId,
      email: authData.email,
      userType: authData.userType,
      userStatus: authData.userStatus,
    };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", authData.token);
  }
}

export default new AuthService();
