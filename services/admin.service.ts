import axios from "axios";

export interface CourseFormData {
  courseId?: number;
  courseName: string;
  description: string;
  courseFee: number;
  durationInWeek: number;
  courseType: string;
  awsUrl?: string;
  status: boolean;
}

export interface FileFormData {
  file: File;
}

export interface CourseResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface Course {
  courseId: number;
  courseName: string;
  description: string;
  courseFee: number;
  durationInWeek: number;
  courseType: string;
  awsUrl?: string;
  status: boolean;
}

export interface AssessmentFormData {
  subjectName: string;
  topic: string;
  assessmentType: string;
  price: number;
}

export interface Assessment {
  assessmentId: number;
  subjectName: string;
  topicName: string;
  assessmentType: string;
  price: number;
  awsUrl?: string;
}

export interface NotesFormData {
  subject: string;
  topic: string;
  notesType: string;
  price: number;
}

export interface Notes {
  notesId: number;
  subject: string;
  topic: string;
  downloadUrl: string;
  notesType: string;
  price: number;
}

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

class AdminCourseService {
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

  async createCourse(
    courseData: CourseFormData,
    fileData: FileFormData
  ): Promise<CourseResponse> {
    try {
      const formData = new FormData();

      formData.append("subject", JSON.stringify(courseData));

      if (fileData.file) {
        formData.append("file", fileData.file);
      }

      const response = await axios.post(`${API_URL}courses/create`, formData, {
        headers: {
          ...this.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Course creation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to create course. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
  async getAllCourses(): Promise<CourseResponse & { courses?: Course[] }> {
    try {
      const response = await axios.get(`${API_URL}courses`, {
        headers: this.getHeaders(),
      });

      return {
        success: true,
        data: response.data,
        courses: response.data,
      };
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to fetch courses. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
  async deleteCourse(courseId: number): Promise<CourseResponse> {
    try {
      const response = await axios.delete(`${API_URL}courses/${courseId}`, {
        headers: this.getHeaders(),
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Course deletion error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to delete course. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  async createAssessment(
    assessmentData: AssessmentFormData,
    fileData: FileFormData
  ): Promise<CourseResponse> {
    try {
      const formData = new FormData();

      formData.append("data", JSON.stringify(assessmentData));

      if (fileData.file) {
        formData.append("file", fileData.file);
      }

      const response = await axios.post(
        `${API_URL}admin/assessments`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Assessment creation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to create assessment. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  async getAllAssessments(): Promise<
    CourseResponse & { assessments?: Assessment[] }
  > {
    try {
      const response = await axios.get(`${API_URL}admin/assessments`, {
        headers: this.getHeaders(),
      });

      return {
        success: true,
        data: response.data,
        assessments: response.data,
      };
    } catch (error: any) {
      console.error("Failed to fetch assessments:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to fetch assessments. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  async updateAssessment(
    assessmentId: number,
    assessmentData: AssessmentFormData,
    fileData?: FileFormData
  ): Promise<CourseResponse> {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(assessmentData));

      if (fileData?.file) {
        formData.append("file", fileData.file);
      }

      const response = await axios.put(
        `${API_URL}admin/assessments/${assessmentId}`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Assessment update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to update assessment. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
  async uploadNotes(
    notesData: NotesFormData,
    fileData: FileFormData
  ): Promise<CourseResponse> {
    try {
      const formData = new FormData();

      formData.append("subject", JSON.stringify(notesData));

      if (fileData.file) {
        formData.append("file", fileData.file);
      }

      const response = await axios.post(`${API_URL}notes/upload`, formData, {
        headers: {
          ...this.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Notes upload error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to upload notes. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  async getAllNotes(): Promise<CourseResponse & { notes?: Notes[] }> {
    try {
      const response = await axios.get(`${API_URL}notes/all-notes`, {
        headers: this.getHeaders(),
      });

      return {
        success: true,
        data: response.data,
        notes: response.data,
      };
    } catch (error: any) {
      console.error("Failed to fetch notes:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error?.message ||
        "Failed to fetch notes. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

export default new AdminCourseService();
