"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, BookOpen, Users, TrendingUp, Clock, Upload } from "lucide-react"
import { ImageIcon } from "lucide-react"
import AdminCourseService, { type CourseFormData, type Course, type CourseFilesData } from "@/services/admin.service"
import { toast } from "sonner"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"

export default function CourseManagementTab() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("courses")
  const [formData, setFormData] = useState<CourseFormData>({
    courseName: "",
    description: "",
    courseFee: 0,
    durationInWeek: 0,
    courseType: "",
    status: true,
  })

  const [fileData, setFileData] = useState<File | null>(null)
  const [courseImageData, setCourseImageData] = useState<File | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await AdminCourseService.getAllCourses()
      if (response.success && response.courses) {
        setCourses(response.courses)
      } else {
        setError(response.message || "Failed to fetch courses")
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch courses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "courseType") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        courseFee: value === "FREE" ? 0 : prev.courseFee,
      }))
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
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileData(e.target.files[0])
    }
  }

  const handleCourseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseImageData(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    if (
      !formData.courseName.trim() ||
      !formData.description.trim() ||
      !formData.courseType ||
      !formData.durationInWeek ||
      fileData === null
    ) {
      toast.error("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    // Additional validation for paid courses
    if (formData.courseType === "PAID" && !formData.courseFee) {
      toast.error("Please enter course fee for paid courses")
      setIsSubmitting(false)
      return
    }

    try {
      if (!fileData) {
        throw new Error("Please upload a course material file")
      }

      const submissionData = {
        ...formData,
        courseFee: formData.courseFee === "" ? 0 : Number(formData.courseFee),
        durationInWeek: formData.durationInWeek === "" ? 0 : Number(formData.durationInWeek),
      }

      const filesData: CourseFilesData = {
        file: fileData,
        courseImage: courseImageData || undefined,
      }

      const response = await AdminCourseService.createCourse(submissionData, filesData)

      if (response.success) {
        setIsAddDialogOpen(false)
        // Reset form
        setFormData({
          courseName: "",
          description: "",
          courseFee: 0,
          durationInWeek: 0,
          courseType: "",
          status: true,
        })
        setFileData(null)
        setCourseImageData(null)
        await fetchCourses() // Refresh the course list
      } else {
        setError(response.message || "Failed to create course")
      }
    } catch (error: any) {
      setError(error.message || "Failed to create course")
    } finally {
      setIsSubmitting(false)
    }
  }

  const RequiredLabel = ({ name, label }: { name: string; label: string }) => (
    <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-2">
      {label} <span className="text-rose-500">*</span>
    </label>
  )

  const getStatusBadge = (status: boolean) => {
    return status ? "Active" : "Inactive"
  }

  const getStatusVariant = (status: boolean) => {
    return status ? "default" : "secondary"
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await AdminCourseService.deleteCourse(courseId)
        if (response.success) {
          await fetchCourses()
        } else {
          setError(response.message || "Failed to delete course")
        }
      } catch (error: any) {
        setError(error.message || "Failed to delete course")
      }
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-8 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Course Management
                    </h1>
                    <p className="text-slate-600 text-lg">Create, edit, and manage all courses with ease</p>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 h-auto">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="space-y-3 pb-6">
                        <DialogTitle className="text-2xl font-bold text-slate-900">Create New Course</DialogTitle>
                        <DialogDescription className="text-slate-600 text-base">
                          Add a new course to the platform with all necessary details and materials
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-8 py-2">
                        {error && (
                          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                          </div>
                        )}

                        <div className="space-y-8">
                          {/* Basic Information Section */}
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                              Basic Information
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <RequiredLabel name="courseName" label="Course Name" />
                                <Input
                                  id="courseName"
                                  name="courseName"
                                  placeholder="Enter course name"
                                  value={formData.courseName}
                                  onChange={handleInputChange}
                                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                                  required
                                />
                              </div>
                              <div className="space-y-3">
                                <RequiredLabel name="courseType" label="Course Type" />
                                <select
                                  id="courseType"
                                  name="courseType"
                                  className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                                  value={formData.courseType}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="">Select course type</option>
                                  <option value="PAID">Paid Course</option>
                                  <option value="FREE">Free Course</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <RequiredLabel name="description" label="Course Description" />
                              <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter detailed course description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="min-h-[120px] border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                                required
                              />
                            </div>
                          </div>

                          {/* Course Details Section */}
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                              Course Details
                            </h3>
                            <div className="grid grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <RequiredLabel name="courseFee" label="Course Fee (₹)" />
                                <Input
                                  id="courseFee"
                                  name="courseFee"
                                  type="number"
                                  placeholder="0"
                                  value={formData.courseFee === 0 ? "" : formData.courseFee}
                                  onChange={handleInputChange}
                                  disabled={formData.courseType === "FREE"}
                                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 disabled:bg-slate-50"
                                  required={formData.courseType === "PAID"}
                                />
                              </div>
                              <div className="space-y-3">
                                <RequiredLabel name="durationInWeek" label="Duration (Weeks)" />
                                <Input
                                  id="durationInWeek"
                                  name="durationInWeek"
                                  type="number"
                                  placeholder="Enter weeks"
                                  value={formData.durationInWeek === 0 ? "" : formData.durationInWeek}
                                  onChange={handleInputChange}
                                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                                  required
                                />
                              </div>
                              <div className="space-y-3">
                                <RequiredLabel name="status" label="Status" />
                                <select
                                  id="status"
                                  name="status"
                                  className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
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
                          </div>

                          {/* File Uploads Section */}
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                              Course Materials
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <RequiredLabel name="courseImage" label="Course Image" />
                                <div className="relative">
                                  <Input
                                    id="courseImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCourseImageChange}
                                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    required
                                  />
                                  <ImageIcon className="absolute right-3 top-3 h-6 w-6 text-slate-400 pointer-events-none" />
                                </div>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <span>Recommended: Square image (500x500px)</span>
                                </p>
                              </div>
                              <div className="space-y-3">
                                <RequiredLabel name="file" label="Course Material" />
                                <div className="relative">
                                  <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    required
                                  />
                                  <Upload className="absolute right-3 top-3 h-6 w-6 text-slate-400 pointer-events-none" />
                                </div>
                                <p className="text-xs text-slate-500">Accepted: PDF, Word, PowerPoint, Excel, Images</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                            disabled={isSubmitting}
                            className="px-6 py-3 h-auto border-slate-300 hover:bg-slate-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 h-auto"
                          >
                            {isSubmitting ? "Creating..." : "Create Course"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-blue-600 mb-1">{courses.length}</div>
                          <div className="text-sm font-medium text-slate-600">Total Courses</div>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/50 hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-emerald-600 mb-1">
                            {courses.filter((c) => c.status).length}
                          </div>
                          <div className="text-sm font-medium text-slate-600">Active Courses</div>
                        </div>
                        <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-purple-600 mb-1">0</div>
                          <div className="text-sm font-medium text-slate-600">Total Enrollments</div>
                        </div>
                        <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/50 hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-amber-600 mb-1">
                            {courses.filter((c) => !c.status).length}
                          </div>
                          <div className="text-sm font-medium text-slate-600">Inactive Courses</div>
                        </div>
                        <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                          <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-bold text-slate-900">All Courses</CardTitle>
                    <CardDescription className="text-slate-600">
                      Manage course content and student assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                        <p className="text-slate-600 font-medium">Loading courses...</p>
                      </div>
                    ) : courses.length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <BookOpen className="h-16 w-16 text-slate-300" />
                        <div className="text-center">
                          <p className="text-lg font-medium text-slate-600 mb-2">No courses found</p>
                          <p className="text-slate-500">Create your first course to get started</p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/80">
                              <TableHead className="font-semibold text-slate-700 py-4">Course</TableHead>
                              <TableHead className="font-semibold text-slate-700">Type</TableHead>
                              <TableHead className="font-semibold text-slate-700">Fee</TableHead>
                              <TableHead className="font-semibold text-slate-700">Duration</TableHead>
                              <TableHead className="font-semibold text-slate-700">Status</TableHead>
                              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {courses.map((course) => (
                              <TableRow key={course.courseId} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="py-4">
                                  <div className="space-y-1">
                                    <div className="font-semibold text-slate-900">{course.courseName}</div>
                                    <div
                                      className="text-sm text-slate-500 max-w-[300px] truncate"
                                      title={course.description}
                                    >
                                      {course.description}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={`text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap ${course.courseType?.toLowerCase() === "free"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                      }`}
                                  >
                                    {course.courseType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-slate-900">₹ {course.courseFee}</TableCell>
                                <TableCell className="text-slate-700">{course.durationInWeek} weeks</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={
                                      course.status
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 font-medium"
                                        : "bg-slate-100 text-slate-600 border-slate-200 font-medium"
                                    }
                                  >
                                    {getStatusBadge(course.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem className="cursor-pointer">Edit Course</DropdownMenuItem>
                                      <DropdownMenuItem className="cursor-pointer">Manage Students</DropdownMenuItem>
                                      <DropdownMenuItem className="cursor-pointer">View Analytics</DropdownMenuItem>
                                      <DropdownMenuItem className="cursor-pointer">
                                        Schedule Assessment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-rose-600 cursor-pointer focus:text-rose-600 focus:bg-rose-50"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteCourse(course.courseId)
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
  )
}
