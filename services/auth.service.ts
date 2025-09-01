import axios from "axios";
import {
  AuthResponse,
  GenerateOtp,
  LoginData,
  RegisterData,
  User,
  VerifyOTPParams,
} from "../types/auth.types";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

class AuthService {
  register(userData: RegisterData): Promise<AuthResponse> {
    return axios
      .post(`${API_URL}users/register`, userData, {
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        if (
          error.response?.status === 400 &&
          error.response?.data?.otpVerify === false
        ) {
          return error.response.data;
        }

        const errorMessage =
          error.response?.data?.message ||
          error.response?.message ||
          error?.message ||
          "Registration failed. Please try again.";

        throw new Error(errorMessage);
      });
  }

  login(credentials: LoginData): Promise<AuthResponse> {
    return axios
      .post(`${API_URL}users/login`, credentials, {
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        this.setUser(response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Login error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.message ||
          error?.message ||
          "Login failed. Please check your credentials.";
        throw new Error(errorMessage);
      });
  }

  verifyOTP({ userId, otp }: VerifyOTPParams): Promise<AuthResponse> {
    return axios
      .put(`${API_URL}users/verify-otp/${userId}?otp=${otp}`, null, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.message ||
          error?.message ||
          "Error while verifying otp.";
        throw new Error(errorMessage);
      });
  }

  generateOTP(email: GenerateOtp): Promise<AuthResponse> {
    return axios
      .put(`${API_URL}users/generate-otp/${email}`, null, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.message ||
          error?.message ||
          "Error while generating otp.";
        throw new Error(errorMessage);
      });
  }

  logout(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.clear();
      } catch (error) {
        console.error("Error clearing auth data:", error);
      }
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;

      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error("Error parsing user data:", error);
      this.logout();
      return null;
    }
  }

  getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("Error accessing token:", error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;

    return !!this.getAuthToken() && !!this.getCurrentUser();
  }

  // Add a public method to set user data from outside
  setUserData(token: string, userData: User): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error storing user data:", error);
      throw new Error("Failed to store authentication data");
    }
  }

  private setUser(authData: AuthResponse): void {
    if (typeof window === "undefined") return;

    try {
      const user: User = {
        userId: authData.userId,
        email: authData.email,
        userType: authData.userType,
        userStatus: authData.userStatus,
      };

      localStorage.setItem("user", JSON.stringify(user));

      if (authData.token) {
        localStorage.setItem("token", authData.token);
      }
    } catch (error) {
      console.error("Error storing user data:", error);
      throw new Error("Failed to store authentication data");
    }
  }
}

export default new AuthService();
