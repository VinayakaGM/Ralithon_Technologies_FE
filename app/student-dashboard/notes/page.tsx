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
  Download,
  FileText,
  BookOpen,
  Search,
  Eye,
  FileDown,
} from "lucide-react";
import UserService, {
  type UserCourseNotes,
  type Note,
  EnrolledCourse,
} from "@/services/users.service";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/student-sidebar";
import { StudentHeader } from "@/components/student-header";
import usersService from "@/services/users.service";

export default function StudentNotesPage() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<UserCourseNotes[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");

  const fetchUserNotes = async () => {
    const currentUser = localStorage.getItem("userDetails");
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const user = JSON.parse(currentUser);
      const response = await usersService.getUserNotes(user.userId);

      if (response.success && response.data) {
        setUserNotes(response.data);
      } else {
        setError(response.message || "Failed to fetch notes");
        toast.error(response.message || "Failed to fetch your notes");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch notes");
      toast.error("Failed to load your notes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserNotes();
  }, []);

  // Filter notes based on search term but keep all courses
  const filteredNotes = userNotes.map((course) => ({
    ...course,
    notes: course.notes.filter(
      (note) =>
        note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  const handleDownload = (note: Note) => {
    if (note.downloadUrl) {
      window.open(note.downloadUrl, "_blank");
      toast.success("Download started");
    } else {
      toast.error("Download link not available");
    }
  };

  const handlePreview = (note: Note) => {
    setSelectedNote(note);
    setIsPreviewOpen(true);
  };

  const totalNotes = userNotes.reduce(
    (total, course) => total + course.notes.length,
    0
  );

  // Count courses that actually have notes
  const coursesWithNotes = userNotes.filter(
    (course) => course.notes.length > 0
  ).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <StudentHeader />
          <main className="p-8 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      My Study Notes
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Access all your available study materials
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-slate-900">
                            {totalNotes}
                          </div>
                          <div className="text-sm font-medium text-slate-600">
                            Total Notes
                          </div>
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
                            {coursesWithNotes}
                          </div>
                          <div className="text-sm font-medium text-slate-600">
                            Courses with Notes
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/50 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-100 rounded-xl">
                          <Download className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-slate-900">
                            {userNotes.reduce(
                              (total, course) =>
                                total +
                                course.notes.filter((n) => n.downloadUrl)
                                  .length,
                              0
                            )}
                          </div>
                          <div className="text-sm font-medium text-slate-600">
                            Downloadable Notes
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900">
                          Available Notes
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                          Browse and download your study materials
                        </CardDescription>
                      </div>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search notes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 rounded-xl border-2 border-slate-200 focus-visible:border-blue-300"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                        <p className="text-slate-600 font-medium">
                          Loading your notes...
                        </p>
                      </div>
                    ) : userNotes.length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                          <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-slate-900 font-semibold text-lg">
                            No courses available
                          </p>
                          <p className="text-slate-600">
                            Courses will appear here once you enroll
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredNotes.map((course) => (
                          <div key={course.courseId} className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                              <h3 className="text-lg font-semibold text-slate-900">
                                {course.courseName}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800"
                              >
                                {course.notes.length} note
                                {course.notes.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>

                            {course.notes.length > 0 ? (
                              <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-slate-50/80 hover:bg-slate-50">
                                      <TableHead className="font-semibold text-slate-700">
                                        Course
                                      </TableHead>
                                      <TableHead className="font-semibold text-slate-700">
                                        Subject
                                      </TableHead>
                                      <TableHead className="font-semibold text-slate-700">
                                        Type
                                      </TableHead>
                                      <TableHead className="font-semibold text-slate-700 text-right">
                                        Actions
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {course.notes.map((note) => (
                                      <TableRow
                                        key={note.notesId}
                                        className="hover:bg-slate-50/50 transition-colors"
                                      >
                                        <TableCell className="font-medium text-slate-900">
                                          {course.courseName}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-900">
                                          {note.subject}
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant="secondary"
                                            className={
                                              note.notesType === "Paid"
                                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold"
                                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold"
                                            }
                                          >
                                            {note.notesType || "Free"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex justify-end space-x-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handlePreview(note)
                                              }
                                              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center gap-1"
                                            >
                                              <Eye className="h-4 w-4" />
                                              Preview
                                            </Button>
                                            <Button
                                              variant="default"
                                              size="sm"
                                              onClick={() =>
                                                handleDownload(note)
                                              }
                                              disabled={!note.downloadUrl}
                                              className="bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1"
                                            >
                                              <FileDown className="h-4 w-4" />
                                              Download
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-slate-200 p-6 text-center bg-slate-50/50">
                                <FileText className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-600 font-medium">
                                  {searchTerm
                                    ? "No matching notes found for this course"
                                    : "No notes available for this course yet"}
                                </p>
                                <p className="text-slate-500 text-sm mt-1">
                                  Notes will appear here once they are added
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="space-y-3 pb-6">
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {selectedNote?.subject} Notes
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-base">
                Preview of study materials for {selectedNote?.subject}
              </DialogDescription>
            </DialogHeader>

            {selectedNote && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">
                      Subject:
                    </span>
                    <p className="text-slate-900">{selectedNote.subject}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Type:</span>
                    <Badge
                      variant="secondary"
                      className={
                        selectedNote.notesType === "Paid"
                          ? "bg-amber-100 text-amber-800 font-semibold"
                          : "bg-emerald-100 text-emerald-800 font-semibold"
                      }
                    >
                      {selectedNote.notesType || "Free"}
                    </Badge>
                  </div>
                  {selectedNote.price && (
                    <div>
                      <span className="font-semibold text-slate-700">
                        Price:
                      </span>
                      <p className="text-slate-900">₹ {selectedNote.price}</p>
                    </div>
                  )}
                </div>

                {selectedNote.downloadUrl && (
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <Button
                      onClick={() => handleDownload(selectedNote)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    >
                      <FileDown className="h-4 w-4" />
                      Download Full Notes
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}
