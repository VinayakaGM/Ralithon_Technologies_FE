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

export interface Note {
  notesId: number;
  subject: string;
  downloadUrl: string;
  notesType: string | null;
  price: number | null;
}

export interface UserCourseNotes {
  courseId: number;
  courseName: string;
  notes: Note[];
}

export interface Assessment {
  assessmentId: number;
  subjectName: string;
  topicName: string;
  assessmentType: "Paid" | "Free";
  price: number;
  awsUrl: string;
}

export interface AssessmentSubmit {
  submissionId: number;
  assessmentName: string;
  assessmentType: "Paid" | "Free";
  totalScored: number;
  assessmentScored: number;
  correctAnswer: number;
  totalQuestion: number;
  attemptQuestion: number;
  incorrectAnswer: number;
  completedOn: string;
}

export interface UserAssessment {
  assessmentId: number;
  assessmentSubmit: AssessmentSubmit;
}

export interface EnrollCoursePayload {
  id: number;
  orderType: string;
  isPaymentDone: boolean;
  startDate: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: Record<string, string>;
  difficulty: string | null;
  explanation: string;
  answer: string;
  userAnswer: string | null;
}

export interface AssessmentStartResponse {
  orderId: string | null;
  amount: number | null;
  currency: string | null;
  razorpayKey: string | null;
  message: string;
  assessment: AssessmentQuestion[];
  attemptId?: string | null;
  assessmentId: number;
}

export interface AssessmentAttemptResponse {
  success: boolean;
  message?: string;
  data?: AssessmentStartResponse;
}

export interface AssessmentSubmissionResult {
  totalQuestions: number;
  attempted: number;
  correct: number;
  unanswered: number;
  marks: number;
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
  courseId: number;
  projectApply: boolean;
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
      accept: "*/*",
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }
  private dataURLtoBlob(dataURL: string): Blob {
    const [meta, content] = dataURL.split(",");
    const mime = meta.match(/:(.*?);/)![1];
    const bstr = atob(content);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  getAllUsers(): Promise<ApiResponse> {
    return axios
      .get(`${API_URL}users`, {
        headers: { ...this.getHeaders(), Accept: "application/json" },
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
        headers: { ...this.getHeaders(), Accept: "application/json" },
      })
      .then((response) => ({
        success: true,
        data: response.data,
      }))
      .catch((error) => this.handleError(error));
  }

  async updateUser(
    userId: number,
    userData: Partial<{
      firstName: string;
      lastName: string;
      phoneNumber: string;
    }>,
    profileImage?: string | null
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData();

      const userDTO = JSON.stringify({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phoneNumber: userData.phoneNumber || "",
      });

      formData.append("userDTO", userDTO);

      if (profileImage) {
        if (profileImage.startsWith("data:image")) {
          const blob = this.dataURLtoBlob(profileImage);
          formData.append("profileImage", blob, "profile.png");
        } else if (profileImage) {
          formData.append("profileImage", profileImage);
        }
      } else {
        formData.append("profileImage", "");
      }

      const response = await axios.put(`${API_URL}users/${userId}`, formData, {
        headers: {
          ...this.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data,
        message: "User updated successfully",
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  deleteUser(userId: number): Promise<ApiResponse> {
    return axios
      .delete(`${API_URL}users/${userId}`, {
        headers: { ...this.getHeaders(), Accept: "application/json" },
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
        headers: { ...this.getHeaders(), Accept: "application/json" },
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
        headers: { ...this.getHeaders(), Accept: "application/json" },
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
        headers: { ...this.getHeaders(), Accept: "application/json" },
      })
      .then((response) => ({
        success: true,
        data: response.data as CourseDetails,
      }))
      .catch((error) => this.handleError(error));
  }

  attemptAssessment(
    userId: number,
    assessmentId: number,
    count: number = 20
  ): Promise<AssessmentAttemptResponse> {
    return axios
      .post(
        `${API_URL}admin/assessments/start/${assessmentId}/${userId}?isAssessement=true`,
        null,
        {
          headers: { ...this.getHeaders(), Accept: "*/*" },
          params: { count },
        }
      )
      .then((response) => ({
        success: true,
        data: response.data,
        message: response.data.message || "Assessment attempted successfully",
      }))
      .catch((error) => this.handleError(error));
  }


  attemptTest(
    userId: number,
  ): Promise<AssessmentAttemptResponse> {
    return axios
      .post(
        `${API_URL}admin/assessments/startExam/${userId}`,
        null,
        {
          headers: { ...this.getHeaders(), Accept: "*/*" }
        }
      )
      .then((response) => ({
        success: true,
        data: response.data,
        message: response.data.message || "Assessment start successfully",
      }))
      .catch((error) => this.handleError(error));
  }

  submitAnswer(
    userId: number | undefined,
    assessmentId: number,
    questionId: string,
    answer: string
  ): Promise<ApiResponse> {
    return axios
      .post(
        `${API_URL}admin/assessments/answer/${userId}`,
        {
          assessmentId,
          questionId,
          answer,
        },
        {
          headers: this.getHeaders(),
        }
      )
      .then((response) => ({
        success: true,
        data: response.data,
        message: "Answer submitted successfully",
      }))
      .catch((error) => this.handleError(error));
  }


  submitAssessment(
    assessmentId: number,
    userId: number
  ): Promise<ApiResponse & { data?: AssessmentSubmissionResult }> {
    return axios
      .post(
        `${API_URL}admin/assessments/submit/${assessmentId}/${userId}`,
        null,
        {
          headers: this.getHeaders(),
        }
      )
      .then((response) => ({
        success: true,
        data: response.data,
        message: "Assessment submitted successfully",
      }))
      .catch((error) => this.handleError(error));
  }
  getUserAssessments(
    userId: number
  ): Promise<ApiResponse & { data?: UserAssessment[] }> {
    return axios
      .get(`${API_URL}dashboard/assessments?userId=${userId}`, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        data: response.data as UserAssessment[],
      }))
      .catch((error) => this.handleError(error));
  }
  applyProject(userId: number | null, courseId: number): Promise<ApiResponse> {
    return axios
      .get(`${API_URL}user-courses/apply-project/${userId}/${courseId}`, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        data: response.data,
        message: "Project applied successfully",
      }))
      .catch((error) => this.handleError(error));
  }
  getUserNotes(
    userId: number | null
  ): Promise<ApiResponse & { data?: UserCourseNotes[] }> {
    return axios
      .get(`${API_URL}user-courses/user-notes/${userId}`, {
        headers: this.getHeaders(),
      })
      .then((response) => ({
        success: true,
        data: response.data as UserCourseNotes[],
      }))
      .catch((error) => this.handleError(error));
  }
}

export default new UserService();
