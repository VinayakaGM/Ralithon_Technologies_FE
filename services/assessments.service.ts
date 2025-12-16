import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

export interface AnswerSubmission {
  userId: number;
  assessmentId: number;
  questionId: string;
  answer: string;
  questionType: string;
}

export interface AssessmentSubmission {
  assessmentId: number;
  userId: number;
}

export interface Question {
  id: string;
  question: string;
  options: {
    [key: string]: string;
  };
  difficulty: string | null;
  explanation: string;
  answer: string;
  userAnswer: string | null;
}

export interface AssessmentData {
  assessment: Question[];
  attemptId?: string;
  assessmentId?: number;
  courseId?: number;
  courseName?: string;
}

export interface AssessmentResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface SubmitAssessmentResponse {
  success: boolean;
  data?: {
    totalQuestions: number;
    attempted: number;
    correct: number;
    unanswered: number;
    marks: number;
  };
  message?: string;
}

class AssessmentService {
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      accept: "*/*",
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Save user's answer for a specific question
   * @param data Answer submission data
   * @returns Response with success status
   */
  async saveAnswer(data: AnswerSubmission): Promise<AssessmentResponse> {
    try {
      const { userId, ...answerData } = data;

      const response = await axios.post(
        `${API_URL}admin/assessments/answer/${userId}`,
        answerData,
        {
          headers: this.getHeaders(),
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error saving answer:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to save answer. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Submit the complete assessment
   * @param data Assessment submission data
   * @returns Response with submission results
   */
  async submitAssessment(
    data: AssessmentSubmission
  ): Promise<SubmitAssessmentResponse> {
    try {
      const { assessmentId, userId } = data;

      const response = await axios.post(
        `${API_URL}admin/assessments/submit/${assessmentId}/${userId}`,
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
      console.error("Error submitting assessment:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to submit assessment. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get assessment results for a user
   * @param userId User ID
   * @param assessmentId Assessment ID (optional)
   * @returns Assessment results
   */
  async getAssessmentResults(
    userId: number,
    assessmentId?: number
  ): Promise<AssessmentResponse> {
    try {
      const url = assessmentId
        ? `${API_URL}assessment/results/${userId}?assessmentId=${assessmentId}`
        : `${API_URL}assessment/results/${userId}`;

      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error fetching assessment results:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to fetch assessment results. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Get assessment attempt history for a user
   * @param userId User ID
   * @returns List of assessment attempts
   */
  async getAssessmentHistory(userId: number): Promise<AssessmentResponse> {
    try {
      const response = await axios.get(
        `${API_URL}assessment/history/${userId}`,
        {
          headers: this.getHeaders(),
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error fetching assessment history:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to fetch assessment history. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

export default new AssessmentService();