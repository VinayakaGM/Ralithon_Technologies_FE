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
import { Label } from "@/components/ui/label";
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
import { Plus, MoreHorizontal } from "lucide-react";
import AdminCourseService, {
  CourseFormData,
  Course,
  CourseFilesData,
} from "@/services/admin.service";
import { toast } from "sonner";

export function CourseManagementTab() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<CourseFormData>({
    courseName: "",
    description: "",
    courseFee: 0,
    durationInWeek: 0,
    courseType: "",
    status: true,
  });

  const [fileData, setFileData] = useState<File | null>(null);
  const [courseImageData, setCourseImageData] = useState<File | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "courseType") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        courseFee: value === "FREE" ? 0 : prev.courseFee,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "courseFee"
            ? value === ""
              ? ""
              : Number(value)
            : name === "durationInWeek"
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

  const handleCourseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseImageData(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    if (
      !formData.courseName.trim() ||
      !formData.description.trim() ||
      !formData.courseType ||
      !formData.durationInWeek ||
      fileData === null
    ) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Additional validation for paid courses
    if (formData.courseType === "PAID" && !formData.courseFee) {
      toast.error("Please enter course fee for paid courses");
      setIsSubmitting(false);
      return;
    }

    try {
      if (!fileData) {
        throw new Error("Please upload a course material file");
      }

      const submissionData = {
        ...formData,
        courseFee: formData.courseFee === "" ? 0 : Number(formData.courseFee),
        durationInWeek:
          formData.durationInWeek === "" ? 0 : Number(formData.durationInWeek),
      };

      const filesData: CourseFilesData = {
        file: fileData,
        courseImage: courseImageData || undefined,
      };

      const response = await AdminCourseService.createCourse(
        submissionData,
        filesData
      );

      if (response.success) {
        setIsAddDialogOpen(false);
        // Reset form
        setFormData({
          courseName: "",
          description: "",
          courseFee: 0,
          durationInWeek: 0,
          courseType: "",
          status: true,
        });
        setFileData(null);
        setCourseImageData(null);
        await fetchCourses(); // Refresh the course list
      } else {
        setError(response.message || "Failed to create course");
      }
    } catch (error: any) {
      setError(error.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequiredLabel = ({ name, label }: { name: string; label: string }) => (
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} <span className="text-red-500">*</span>
    </label>
  );

  const getStatusBadge = (status: boolean) => {
    return status ? "Active" : "Inactive";
  };

  const getStatusVariant = (status: boolean) => {
    return status ? "default" : "secondary";
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await AdminCourseService.deleteCourse(courseId);
        if (response.success) {
          await fetchCourses();
        } else {
          setError(response.message || "Failed to delete course");
        }
      } catch (error: any) {
        setError(error.message || "Failed to delete course");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Course Management
          </h2>
          <p className="text-gray-600">Create, edit, and manage all courses</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-blue-600 to-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new course to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel name="courseName" label="Course Name" />
                  <Input
                    id="courseName"
                    name="courseName"
                    placeholder="Enter course name"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel name="courseType" label="Course Type" />
                  <select
                    id="courseType"
                    name="courseType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.courseType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select course type</option>
                    <option value="PAID">Paid</option>
                    <option value="FREE">Free</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <RequiredLabel name="description" label="Description" />
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter course description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <RequiredLabel name="courseFee" label="Course Fee" />
                  <Input
                    id="courseFee"
                    name="courseFee"
                    type="number"
                    placeholder="Enter course fee"
                    value={formData.courseFee === 0 ? "" : formData.courseFee}
                    onChange={handleInputChange}
                    disabled={formData.courseType === "FREE"}
                    required={formData.courseType === "PAID"}
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel
                    name="durationInWeek"
                    label="Duration (Weeks)"
                  />
                  <Input
                    id="durationInWeek"
                    name="durationInWeek"
                    type="number"
                    placeholder="Enter duration in weeks"
                    value={
                      formData.durationInWeek === 0
                        ? ""
                        : formData.durationInWeek
                    }
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel name="status" label="Status" />
                  <select
                    id="status"
                    name="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.status ? "true" : "false"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value === "true",
                      }))
                    }
                    required
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel name="courseImage" label="Course Image" />
                  <Input
                    id="courseImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCourseImageChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image (e.g., 500x500px)
                  </p>
                </div>
                <div className="space-y-2">
                  <RequiredLabel name="file" label="Course Material" />
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, Word, PowerPoint, Excel, Images
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-br from-blue-600 to-blue-800"
                >
                  {isSubmitting ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {courses.length}
            </div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {courses.filter((c) => c.status).length}
            </div>
            <div className="text-sm text-gray-600">Active Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {/* Assuming you might want to add enrollment data later */}0
            </div>
            <div className="text-sm text-gray-600">Total Enrollments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {courses.filter((c) => !c.status).length}
            </div>
            <div className="text-sm text-gray-600">Inactive Courses</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            Manage course content and student assignments
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
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.courseId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.courseName}</div>
                        <div
                          className="text-sm text-gray-500 max-w-[300px] truncate"
                          title={course.description}
                        >
                          {course.description}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          course.courseType === "PAID" ? "default" : "secondary"
                        }
                        className={
                          course.courseType === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {course.courseType}
                      </Badge>
                    </TableCell>
                    <TableCell>₹ {course.courseFee}</TableCell>
                    <TableCell>{course.durationInWeek} weeks</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(course.status)}
                        className={
                          course.status
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {getStatusBadge(course.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Course</DropdownMenuItem>
                          <DropdownMenuItem>Manage Students</DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <DropdownMenuItem>
                            Schedule Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(course.courseId);
                            }}
                          >
                            Delete Course
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
