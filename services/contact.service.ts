import axios from "axios";

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

class ContactService {
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

  submitContactForm(contactData: ContactFormData): Promise<ContactResponse> {
    return axios
      .post(`${API_URL}api/contact`, contactData, {
        headers: this.getHeaders(),
      })
      .then((response) => {
        return {
          success: true,
          data: response.data,
        };
      })
      .catch((error) => {
        console.error("Contact form submission error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.message ||
          error?.message ||
          "Failed to submit contact form. Please try again.";

        return {
          success: false,
          message: errorMessage,
        };
      });
  }
}

export default new ContactService();
