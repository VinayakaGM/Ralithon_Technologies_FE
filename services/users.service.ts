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

export interface EnrollCoursePayload {
  id: number;
  orderType: string;
  isPaymentDone: boolean;
  startDate: string;
}

export interface AssessmentAttemptResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface Course {
  courseId: number;
  courseName: string;
  awsUrl?: string;
  description?: string;
  durationInWeek?: number;
  courseType?: string;
  courseFee?: number;
  status?: boolean;
}

export interface EnrolledCourse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  courseStatus: string;
  durationInWeek: number;
}

export interface CourseDetails {
  courseName: string;
  startDate: string;
  endDate: string;
  remainingDays: string;
  coursePlayListDTOList: {
    imageUrl: string | null;
    topicName: string;
    videoUrl: string;
  }[];
}

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

class UserService {
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      accept: "/",
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

  updateUser(
    userId: number,
    userData: Partial<User>,
    profileImage?: File | null
  ): Promise<ApiResponse> {
    const formData = new FormData();

    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(`userDTO.${key}`, value as any);
      }
    });

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    return axios
      .put(`${API_URL}users/${userId}`, formData, {
        headers: {
          ...this.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
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

  enrollInCourse(
    userId: number | null,
    payload: EnrollCoursePayload
  ): Promise<ApiResponse> {
    return axios
      .post(`${API_URL}user-courses/enroll/${userId}`, payload, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        data: response.data,
        message: "Enrolled successfully",
      }))
      .catch((error) => this.handleError(error));
  }

  getEnrolledCourses(userId: number): Promise<ApiResponse> {
    return axios
      .get(`${API_URL}user-courses/user/${userId}`, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        data: response.data as EnrolledCourse[],
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

  getUserCourseDetails(userId: number, courseId: number): Promise<ApiResponse> {
    return axios
      .get(`${API_URL}user-courses/user/${userId}/${courseId}`, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        data: response.data as CourseDetails,
      }))
      .catch((error) => this.handleError(error));
  }

  attemptAssessment(
    userId: number,
    assessmentId: number
  ): Promise<AssessmentAttemptResponse> {
    return axios
      .post(
        `${API_URL}admin/assessments/attempt/${userId}/${assessmentId}`,
        null,
        {
          headers: this.getHeaders(),
        }
      )
      .then((response) => ({
        success: true,
        data: response.data,
        message: "Assessment attempted successfully",
      }))
      .catch((error) => this.handleError(error));
  }
}

export default new UserService();
