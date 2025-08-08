"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Eye } from "lucide-react";
import AdminCourseService, {
  AssessmentFormData,
  Assessment,
  Course,
} from "@/services/admin.service";
import { toast } from "sonner";

export function AssessmentMonitoringTab() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [viewAssessment, setViewAssessment] = useState<Assessment | null>(null);

  const [formData, setFormData] = useState<
    AssessmentFormData & { courseId: number }
  >({
    courseId: 0,
    subjectName: "",
    topic: "",
    assessmentType: "Free",
    price: 0,
  });

  const [fileData, setFileData] = useState<File | null>(null);

  useEffect(() => {
    fetchAssessments();
    fetchCourses();
  }, []);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const response = await AdminCourseService.getAllAssessments();
      if (response.success && response.assessments) {
        setAssessments(response.assessments);
      } else {
        setError(response.message || "Failed to fetch assessments");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    setIsCoursesLoading(true);
    try {
      const response = await AdminCourseService.getAllCourses();
      if (response.success && response.courses) {
        setCourses(response.courses);
      } else {
        setError(response.message || "Failed to fetch courses");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch courses");
    } finally {
      setIsCoursesLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "assessmentType") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        price: value === "Free" ? 0 : prev.price,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "price"
            ? value === ""
              ? ""
              : Number(value)
            : name === "courseId"
            ? Number(value)
            : value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileData(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    // Validate required fields
    if (
      !formData.courseId ||
      !formData.subjectName.trim() ||
      !formData.topic.trim() ||
      !formData.assessmentType
    ) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Additional validation for paid assessments
    if (formData.assessmentType === "Paid" && formData.price === "") {
      toast.error("Please enter price for paid assessments");
      setIsSubmitting(false);
      return;
    }

    try {
      if (!editingAssessment && !fileData) {
        toast.error("Please upload a file");
        return;
      }

      const submissionData = {
        ...formData,
        price: formData.price === "" ? 0 : Number(formData.price),
      };

      let response;
      if (editingAssessment) {
        response = await AdminCourseService.updateAssessment(
          editingAssessment.assessmentId,
          submissionData,
          fileData ? { file: fileData } : undefined
        );
      } else {
        response = await AdminCourseService.createAssessment(submissionData, {
          file: fileData!,
        });
      }

      if (response.success) {
        toast.success(
          editingAssessment
            ? "Assessment updated successfully"
            : "Assessment created successfully"
        );
        setIsAddDialogOpen(false);
        setFormData({
          courseId: 0,
          subjectName: "",
          topic: "",
          assessmentType: "Free",
          price: 0,
        });
        setFileData(null);
        setEditingAssessment(null);
        await fetchAssessments();
      } else {
        setError(
          response.message ||
            `Failed to ${editingAssessment ? "update" : "create"} assessment`
        );
      }
    } catch (error: any) {
      setError(
        error.message ||
          `Failed to ${editingAssessment ? "update" : "create"} assessment`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setFormData({
      courseId: assessment.courseId || 0,
      subjectName: assessment.subjectName,
      topic: assessment.topicName,
      assessmentType: assessment.assessmentType,
      price: assessment.price,
    });
    setIsAddDialogOpen(true);
  };

  const handleViewAssessment = (assessment: Assessment) => {
    setViewAssessment(assessment);
  };

  const RequiredLabel = ({ name, label }: { name: string; label: string }) => (
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} <span className="text-red-500">*</span>
    </label>
  );

  const handleDeleteAssessment = async (assessmentId: number) => {
    if (confirm("Are you sure you want to delete this assessment?")) {
      try {
        // You'll need to implement deleteAssessment in your service
        // const response = await AdminCourseService.deleteAssessment(assessmentId);
        // if (response.success) {
        //   await fetchAssessments();
        // } else {
        //   setError(response.message || "Failed to delete assessment");
        // }
        setError("Delete functionality not implemented yet");
      } catch (error: any) {
        setError(error.message || "Failed to delete assessment");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Assessment Management
          </h2>
          <p className="text-gray-600">Create and manage all assessments</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setEditingAssessment(null);
              setFormData({
                courseId: 0,
                subjectName: "",
                topic: "",
                assessmentType: "Free",
                price: 0,
              });
              setFileData(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-blue-600 to-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAssessment
                  ? "Edit Assessment"
                  : "Create New Assessment"}
              </DialogTitle>
              <DialogDescription>
                {editingAssessment
                  ? "Update the assessment details"
                  : "Add a new assessment to the platform"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="space-y-2">
                <RequiredLabel name="courseId" label="Course" />
                <select
                  id="courseId"
                  name="courseId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  disabled={isCoursesLoading}
                >
                  <option value={0}>Select a course</option>
                  {courses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel name="subjectName" label="Subject Name" />
                  <Input
                    id="subjectName"
                    name="subjectName"
                    placeholder="Enter subject name"
                    value={formData.subjectName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel name="topic" label="Topic Name" />
                  <Input
                    id="topic"
                    name="topic"
                    placeholder="Enter topic name"
                    value={formData.topic}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel
                    name="assessmentType"
                    label="Assessment Type"
                  />
                  <select
                    id="assessmentType"
                    name="assessmentType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.assessmentType}
                    onChange={handleInputChange}
                  >
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <RequiredLabel name="price" label="Price (₹)" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Enter price"
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={handleInputChange}
                    disabled={formData.assessmentType === "Free"}
                    required={formData.assessmentType === "Paid"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <RequiredLabel name="file" label="Assessment Material" />
                {editingAssessment?.awsUrl && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Current file:</p>
                    <a
                      href={editingAssessment.awsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {editingAssessment.awsUrl.split("/").pop()}
                    </a>
                  </div>
                )}
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, Word, PowerPoint, Excel, Images
                  {editingAssessment && " (Leave empty to keep current file)"}
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingAssessment(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-br from-blue-600 to-blue-800"
                >
                  {isSubmitting
                    ? editingAssessment
                      ? "Updating..."
                      : "Creating..."
                    : editingAssessment
                    ? "Update Assessment"
                    : "Create Assessment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Assessment Dialog */}
      {/* View Assessment Dialog */}
      <Dialog
        open={!!viewAssessment}
        onOpenChange={(open) => !open && setViewAssessment(null)}
      >
        <DialogContent className="max-w-2xl">
          {viewAssessment && (
            <>
              <DialogHeader>
                <DialogTitle>{viewAssessment.subjectName}</DialogTitle>
                <DialogDescription>
                  {viewAssessment.topicName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Assessment Type</p>
                    <p className="text-sm text-gray-600">
                      {viewAssessment.assessmentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm text-gray-600">
                      ₹ {viewAssessment.price || 0}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Assessment File</p>
                  {viewAssessment.awsUrl ? (
                    <a
                      href={viewAssessment.awsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {viewAssessment.awsUrl.split("/").pop()}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-600">No file available</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {assessments.length}
            </div>
            <div className="text-sm text-gray-600">Total Assessments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {assessments.filter((a) => a.assessmentType === "Free").length}
            </div>
            <div className="text-sm text-gray-600">Free Assessments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {assessments.filter((a) => a.assessmentType === "Paid").length}
            </div>
            <div className="text-sm text-gray-600">Paid Assessments</div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
          <CardDescription>
            Manage assessment content and materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.assessmentId}>
                    <TableCell className="font-medium">
                      {assessment.subjectName}
                    </TableCell>
                    <TableCell>{assessment.topicName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assessment.assessmentType === "Paid"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          assessment.assessmentType === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {assessment.assessmentType}
                      </Badge>
                    </TableCell>
                    <TableCell>₹ {assessment.price || 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(assessment)}
                          >
                            Edit Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewAssessment(assessment)}
                          >
                            View Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAssessment(assessment.assessmentId);
                            }}
                          >
                            Delete Assessment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
