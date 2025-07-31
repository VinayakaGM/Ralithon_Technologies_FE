import axios from "axios";

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: "ROLE_STUDENT" | "ROLE_ADMIN";
  phoneNumber: string;
  status: boolean;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

class UserService {
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      accept: "*/*",
      "Content-Type": "application/json",
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  getAllUsers(): Promise<ApiResponse> {
    return axios
      .get(`${API_URL}users`, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        data: response.data,
      }))
      .catch((error) => this.handleError(error));
  }

  getUserById(userId: number): Promise<ApiResponse> {
    return axios
      .get(`${API_URL}users/${userId}`, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        data: response.data,
      }))
      .catch((error) => this.handleError(error));
  }

  updateUser(userId: number, userData: Partial<User>): Promise<ApiResponse> {
    return axios
      .put(`${API_URL}users/${userId}`, userData, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        data: response.data,
        message: "User updated successfully",
      }))
      .catch((error) => this.handleError(error));
  }

  deleteUser(userId: number): Promise<ApiResponse> {
    return axios
      .delete(`${API_URL}users/${userId}`, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        message: "User deleted successfully",
      }))
      .catch((error) => this.handleError(error));
  }

  private handleError(error: any): ApiResponse {
    console.error("API Error:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.message ||
      error?.message ||
      "An error occurred. Please try again.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export default new UserService();
