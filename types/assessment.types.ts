export interface AssessmentSubmissionPayload {
  userId: number | undefined;
  assessmentId: number;
  totalQuestions: number;
  attempted: number;
  correct: number;
  score: number;
  totalMarks: number;
}
