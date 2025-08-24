import axios from "axios";

export interface PasswordOtpRequest {
  email: string;
}

export interface SetPasswordRequest {
  emailId: string;
  password: string;
}

export interface PasswordResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

class ForgetPasswordService {
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      accept: "application/json",
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async generateOtp(email: string): Promise<PasswordResponse> {
    try {
      const encodedEmail = encodeURIComponent(email);

      const response = await axios.post(
        `${API_URL}password/generateOtp/${encodedEmail}?email=${encodedEmail}`,
        {},
        {
          headers: this.getHeaders(),
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("OTP generation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to generate OTP. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  async setPassword(
    passwordData: SetPasswordRequest
  ): Promise<PasswordResponse> {
    try {
      const response = await axios.post(
        `${API_URL}password/setPassword`,
        {
          emailId: passwordData.emailId,
          password: passwordData.password,
        },
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Password set error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to set password. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

export default new ForgetPasswordService();
