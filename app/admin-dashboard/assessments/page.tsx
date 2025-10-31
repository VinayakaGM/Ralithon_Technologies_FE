"use client";

import type React from "react";

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
import {
  Plus,
  MoreHorizontal,
  Eye,
  FileText,
  DollarSign,
  BookOpen,
} from "lucide-react";
import AdminCourseService, {
  type AssessmentFormData,
  type Assessment,
  type Course,
} from "@/services/admin.service";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";

export default function AssessmentMonitoringTab() {
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
  const [activeTab, setActiveTab] = useState("assessments");
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Assessment Management
                    </h2>
                    <p className="text-slate-600 text-lg">
                      Create and manage all assessments with comprehensive
                      monitoring
                    </p>
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
                      <Button 
                        className="text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl"
                        style={{
                          background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)"
                        }}
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Assessment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="space-y-3">
                        <DialogTitle className="text-2xl font-bold text-slate-900">
                          {editingAssessment
                            ? "Edit Assessment"
                            : "Create New Assessment"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 text-base">
                          {editingAssessment
                            ? "Update the assessment details and materials"
                            : "Add a new assessment to enhance student learning"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-6">
                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                          </div>
                        )}
                        <div className="space-y-3">
                          <RequiredLabel
                            name="courseId"
                            label="Course Selection"
                          />
                          <select
                            id="courseId"
                            name="courseId"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.courseId}
                            onChange={handleInputChange}
                            disabled={isCoursesLoading || !!editingAssessment}
                          >
                            <option value={0}>Select a course</option>
                            {courses.map((course) => (
                              <option
                                key={course.courseId}
                                value={course.courseId}
                              >
                                {course.courseName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <RequiredLabel
                              name="subjectName"
                              label="Subject Name"
                            />
                            <Input
                              id="subjectName"
                              name="subjectName"
                              placeholder="Enter subject name"
                              value={formData.subjectName}
                              onChange={handleInputChange}
                              className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                          <div className="space-y-3">
                            <RequiredLabel name="topic" label="Topic Name" />
                            <Input
                              id="topic"
                              name="topic"
                              placeholder="Enter topic name"
                              value={formData.topic}
                              onChange={handleInputChange}
                              className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <RequiredLabel
                              name="assessmentType"
                              label="Assessment Type"
                            />
                            <select
                              id="assessmentType"
                              name="assessmentType"
                              className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              value={formData.assessmentType}
                              onChange={handleInputChange}
                            >
                              <option value="Free">Free Assessment</option>
                              <option value="Paid">Premium Assessment</option>
                            </select>
                          </div>
                          <div className="space-y-3">
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
                              className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <RequiredLabel
                            name="file"
                            label="Assessment Material"
                          />
                          {editingAssessment?.awsUrl && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Current file:
                              </p>
                              <a
                                href={editingAssessment.awsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {editingAssessment.awsUrl.split("/").pop()}
                              </a>
                            </div>
                          )}
                          <Input
                            id="file"
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                            📎 Accepted formats: PDF, Word, PowerPoint, Excel,
                            Images
                            {editingAssessment &&
                              " (Leave empty to keep current file)"}
                          </p>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsAddDialogOpen(false);
                              setEditingAssessment(null);
                            }}
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl border-slate-200 hover:bg-slate-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl"
                            style={{
                              background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)"
                            }}
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

                <Dialog
                  open={!!viewAssessment}
                  onOpenChange={(open) => !open && setViewAssessment(null)}
                >
                  <DialogContent className="max-w-2xl">
                    {viewAssessment && (
                      <>
                        <DialogHeader className="space-y-3">
                          <DialogTitle className="text-2xl font-bold text-slate-900">
                            {viewAssessment.subjectName}
                          </DialogTitle>
                          <DialogDescription className="text-slate-600 text-base">
                            {viewAssessment.topicName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-slate-700">
                                Assessment Type
                              </p>
                              <Badge
                                className="text-white px-3 py-1 rounded-full"
                                style={{
                                  background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)"
                                }}
                              >
                                {viewAssessment.assessmentType}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-slate-700">
                                Price
                              </p>
                              <p className="text-lg font-bold text-slate-900">
                                ₹ {viewAssessment.price || 0}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-700">
                              Assessment File
                            </p>
                            {viewAssessment.awsUrl ? (
                              <a
                                href={viewAssessment.awsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {viewAssessment.awsUrl.split("/").pop()}
                              </a>
                            ) : (
                              <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                                No file available
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div 
                            className="text-3xl font-bold mb-1"
                            style={{
                              background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent"
                            }}
                          >
                            {assessments.length}
                          </div>
                          <div className="text-sm font-medium text-slate-600 mt-1">
                            Total Assessments
                          </div>
                        </div>
                        <div 
                          className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                          style={{
                            background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)"
                          }}
                        >
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div 
                            className="text-3xl font-bold mb-1"
                            style={{
                              background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent"
                            }}
                          >
                            {
                              assessments.filter(
                                (a) => a.assessmentType === "Free"
                              ).length
                            }
                          </div>
                          <div className="text-sm font-medium text-slate-600 mt-1">
                            Free Assessments
                          </div>
                        </div>
                        <div 
                          className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                          style={{
                            background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)"
                          }}
                        >
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div 
                            className="text-3xl font-bold mb-1"
                            style={{
                              background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent"
                            }}
                          >
                            {
                              assessments.filter(
                                (a) => a.assessmentType === "Paid"
                              ).length
                            }
                          </div>
                          <div className="text-sm font-medium text-slate-600 mt-1">
                            Premium Assessments
                          </div>
                        </div>
                        <div 
                          className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                          style={{
                            background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)"
                          }}
                        >
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                          All Assessments
                        </CardTitle>
                        <CardDescription className="text-slate-600 mt-1">
                          Manage assessment content and materials with
                          comprehensive monitoring
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div 
                          className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-600"
                          style={{
                            borderColor: "rgb(55, 182, 241) rgb(55, 182, 241) rgb(55, 182, 241) rgb(2, 116, 186)"
                          }}
                        ></div>
                        <p className="text-slate-600 font-medium">
                          Loading assessments...
                        </p>
                      </div>
                    ) : assessments.length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                          <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-slate-900">
                            No assessments found
                          </p>
                          <p className="text-slate-600">
                            Create your first assessment to get started
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50">
                              <TableHead className="font-semibold text-slate-700 py-4">
                                Subject
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Topic
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Type
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700">
                                Price
                              </TableHead>
                              <TableHead className="text-right font-semibold text-slate-700">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assessments.map((assessment) => (
                              <TableRow
                                key={assessment.assessmentId}
                                className="hover:bg-slate-50/50 transition-colors"
                              >
                                <TableCell className="font-medium text-slate-900 py-4">
                                  {assessment.subjectName}
                                </TableCell>
                                <TableCell className="text-slate-700">
                                  {assessment.topicName}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className="text-white text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap"
                                    style={{
                                      background: "linear-gradient(270deg, rgb(55, 182, 241) 0%, rgb(2, 116, 186) 100%)"
                                    }}
                                  >
                                    {assessment.assessmentType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900">
                                  ₹ {assessment.price || 0}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleEditClick(assessment)
                                        }
                                        className="cursor-pointer"
                                      >
                                        Edit Assessment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleViewAssessment(assessment)
                                        }
                                        className="cursor-pointer"
                                      >
                                        View Assessment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAssessment(
                                            assessment.assessmentId
                                          );
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const RequiredLabel = ({ name, label }: { name: string; label: string }) => (
  <label
    htmlFor={name}
    className="block text-sm font-semibold text-slate-700 mb-2"
  >
    {label} <span className="text-red-500 ml-1">*</span>
  </label>
);