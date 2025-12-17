"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Plus, MoreHorizontal, X, FileText, Download, BookOpen, DollarSign } from "lucide-react"
import AdminCourseService, { type NotesFormData, type Notes, type Course } from "@/services/admin.service"
import { toast } from "sonner"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"

export default function NotesManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<Notes[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [editingNote, setEditingNote] = useState<Notes | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("notes")
  const [formData, setFormData] = useState<NotesFormData>({
    courseId: 0,
    subject: "",
    topic: "",
    notesType: "Free",
    price: 0,
  })

  const [fileData, setFileData] = useState<File | null>(null)

  useEffect(() => {
    fetchNotes()
    fetchCourses()
  }, [])

  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      const response = await AdminCourseService.getAllNotes()
      if (response.success && response.notes) {
        setNotes(response.notes)
      } else {
        setError(response.message || "Failed to fetch notes")
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch notes")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await AdminCourseService.getAllCourses()
      if (response.success && response.courses) {
        setCourses(response.courses)
      }
    } catch (error: any) {
      console.error("Failed to fetch courses:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "courseId" ? Number(value) : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileData(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    // Validate required fields
    if (!formData.courseId) {
      toast.error("Please select a course")
      setIsSubmitting(false)
      return
    }

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject")
      setIsSubmitting(false)
      return
    }

    if (!formData.topic.trim()) {
      toast.error("Please enter a topic")
      setIsSubmitting(false)
      return
    }

    if (formData.notesType === "Paid" && formData.price <= 0) {
      toast.error("Please enter a valid price for paid notes")
      setIsSubmitting(false)
      return
    }

    if (!editingNote && !fileData) {
      toast.error("Please upload a file")
      setIsSubmitting(false)
      return
    }

    try {
      let response
      if (editingNote) {
        // Note: Update functionality needs to be implemented in the service
        // For now, we'll just show a message
        toast.info("Update functionality will be implemented soon")
        return
      } else {
        // If notesType is Free, set price to 0 regardless of input
        const submissionData = {
          ...formData,
          price: formData.notesType === "Free" ? 0 : formData.price,
        }

        response = await AdminCourseService.uploadNotes(submissionData, {
          file: fileData!,
        })
      }

      if (response.success) {
        toast.success(editingNote ? "Note updated successfully" : "Note created successfully")
        setIsAddDialogOpen(false)
        setFormData({
          courseId: 0,
          subject: "",
          topic: "",
          notesType: "Free",
          price: 0,
        })
        setFileData(null)
        setEditingNote(null)
        await fetchNotes()
      } else {
        setError(response.message || `Failed to ${editingNote ? "update" : "create"} note`)
      }
    } catch (error: any) {
      setError(error.message || `Failed to ${editingNote ? "update" : "create"} note`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (note: Notes) => {
    setEditingNote(note)
    setFormData({
      courseId: note.courseId || 0,
      subject: note.subject,
      topic: note.topic || "",
      notesType: note.notesType,
      price: note.price,
    })
    setIsAddDialogOpen(true)
  }

  const handleClearPrice = () => {
    setFormData((prev) => ({ ...prev, price: 0 }))
  }

  const RequiredLabel = ({ name, label }: { name: string; label: string }) => (
    <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-2">
      {label} <span className="text-rose-500">*</span>
    </label>
  )

  const OptionalLabel = ({ name, label }: { name: string; label: string }) => (
    <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
    </label>
  )

  const handleDeleteNote = async (notesId: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        // You'll need to implement deleteNote in your service
        toast.info("Delete functionality will be implemented soon")
      } catch (error: any) {
        setError(error.message || "Failed to delete note")
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
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Notes Management
                    </h1>
                    <p className="text-slate-600 text-lg">Create and manage all study materials with ease</p>
                  </div>
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={(open) => {
                      setIsAddDialogOpen(open)
                      if (!open) {
                        setEditingNote(null)
                        setFormData({
                          courseId: 0,
                          subject: "",
                          topic: "",
                          notesType: "Free",
                          price: 0,
                        })
                        setFileData(null)
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white font-semibold px-6 py-3 h-auto">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Notes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="space-y-3 pb-6">
                        <DialogTitle className="text-2xl font-bold text-slate-900">
                          {editingNote ? "Edit Notes" : "Create New Notes"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 text-base">
                          {editingNote
                            ? "Update the notes details and materials"
                            : "Add new study notes and materials to the platform"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            Unable to load the note(s) at the moment. Please try again later.
                          </div>
                        )}

                        <div className="space-y-3">
                          <RequiredLabel name="courseId" label="Course" />
                          <select
                            id="courseId"
                            name="courseId"
                            className="flex h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            value={formData.courseId}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                              <option key={course.courseId} value={course.courseId}>
                                {course.courseName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <RequiredLabel name="subject" label="Subject" />
                            <Input
                              id="subject"
                              name="subject"
                              placeholder="Enter subject name"
                              value={formData.subject}
                              onChange={handleInputChange}
                              className="h-12 rounded-xl border-2 border-slate-200 focus-visible:border-blue-300 font-medium"
                              required
                            />
                          </div>
                          <div className="space-y-3">
                            <RequiredLabel name="topic" label="Topic" />
                            <Input
                              id="topic"
                              name="topic"
                              placeholder="Enter topic name"
                              value={formData.topic}
                              onChange={handleInputChange}
                              className="h-12 rounded-xl border-2 border-slate-200 focus-visible:border-blue-300 font-medium"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <RequiredLabel name="notesType" label="Notes Type" />
                            <select
                              id="notesType"
                              name="notesType"
                              className="flex h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                              value={formData.notesType}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="Free">Free</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            {formData.notesType === "Paid" ? (
                              <>
                                <RequiredLabel name="price" label="Price (₹)" />
                                <div className="relative">
                                  <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    placeholder="Enter price"
                                    value={formData.price || ""}
                                    onChange={handleInputChange}
                                    min={0}
                                    className="h-12 rounded-xl border-2 border-slate-200 focus-visible:border-blue-300 font-medium pr-10"
                                    required={formData.notesType === "Paid"}
                                  />
                                  {formData.price > 0 && (
                                    <button
                                      type="button"
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                      onClick={handleClearPrice}
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <OptionalLabel name="price" label="Price (₹)" />
                                <Input
                                  id="price"
                                  name="price"
                                  type="number"
                                  placeholder="Free content"
                                  value={0}
                                  disabled
                                  className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 font-medium"
                                />
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <RequiredLabel name="file" label="Notes Material" />
                          {editingNote?.downloadUrl && (
                            <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                              <p className="text-sm font-semibold text-blue-900 mb-2">Current file:</p>
                              <a
                                href={editingNote.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                {editingNote.downloadUrl.split("/").pop()}
                              </a>
                            </div>
                          )}
                          <Input
                            id="file"
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="h-12 rounded-xl border-2 border-slate-200 focus-visible:border-blue-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            required={!editingNote}
                          />
                          <p className="text-xs text-slate-500 mt-2">
                            Accepted formats: PDF, Word, PowerPoint, Excel, Images
                            {editingNote && " (Leave empty to keep current file)"}
                          </p>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsAddDialogOpen(false)
                              setEditingNote(null)
                            }}
                            disabled={isSubmitting}
                            className="px-6 py-3 h-auto font-semibold border-2 hover:bg-slate-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            {isSubmitting
                              ? editingNote
                                ? "Updating..."
                                : "Creating..."
                              : editingNote
                                ? "Update Notes"
                                : "Create Notes"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-slate-900">{notes.length}</div>
                          <div className="text-sm font-medium text-slate-600">Total Notes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/50 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                          <BookOpen className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-slate-900">
                            {notes.filter((n) => n.notesType === "Free").length}
                          </div>
                          <div className="text-sm font-medium text-slate-600">Free Notes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/50 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-100 rounded-xl">
                          <DollarSign className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-slate-900">
                            {notes.filter((n) => n.notesType === "Paid").length}
                          </div>
                          <div className="text-sm font-medium text-slate-600">Paid Notes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-bold text-slate-900">All Notes</CardTitle>
                    <CardDescription className="text-slate-600">Manage study notes and materials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                        <p className="text-slate-600 font-medium">Loading notes...</p>
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                          <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-slate-900 font-semibold text-lg">No notes found</p>
                          <p className="text-slate-600">Create your first note to get started</p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/80 hover:bg-slate-50">
                              <TableHead className="font-semibold text-slate-700">Subject</TableHead>
                              <TableHead className="font-semibold text-slate-700">Type</TableHead>
                              <TableHead className="font-semibold text-slate-700">Price</TableHead>
                              <TableHead className="font-semibold text-slate-700">Download</TableHead>
                              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {notes.map((note) => (
                              <TableRow key={note.notesId} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-medium text-slate-900">{note.subject}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={
                                      note.notesType === "Paid"
                                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold"
                                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold"
                                    }
                                  >
                                    {note.notesType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900">₹ {note.price || 0}</TableCell>
                                <TableCell>
                                  {note.downloadUrl && (
                                    <a
                                      href={note.downloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download
                                    </a>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem onClick={() => handleEditClick(note)} className="font-medium">
                                        Edit Notes
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-rose-600 font-medium focus:text-rose-600"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteNote(note.notesId)
                                        }}
                                      >
                                        Delete Notes
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
