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
  NotesFormData,
  Notes,
} from "@/services/admin.service";
import { toast } from "sonner";

export function NotesManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Notes[]>([]);
  const [editingNote, setEditingNote] = useState<Notes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<NotesFormData>({
    subject: "",
    topic: "",
    notesType: "Free",
    price: 0,
  });

  const [fileData, setFileData] = useState<File | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await AdminCourseService.getAllNotes();
      if (response.success && response.notes) {
        setNotes(response.notes);
      } else {
        setError(response.message || "Failed to fetch notes");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileData(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!editingNote && !fileData) {
        toast.error("Please upload a file");
        return;
      }

      let response;
      if (editingNote) {
        // Note: Update functionality needs to be implemented in the service
        // For now, we'll just show a message
        toast.info("Update functionality will be implemented soon");
        return;
      } else {
        response = await AdminCourseService.uploadNotes(formData, {
          file: fileData!,
        });
      }

      if (response.success) {
        toast.success(
          editingNote
            ? "Note updated successfully"
            : "Note created successfully"
        );
        setIsAddDialogOpen(false);
        setFormData({
          subject: "",
          topic: "",
          notesType: "Free",
          price: 0,
        });
        setFileData(null);
        setEditingNote(null);
        await fetchNotes();
      } else {
        setError(
          response.message ||
            `Failed to ${editingNote ? "update" : "create"} note`
        );
      }
    } catch (error: any) {
      setError(
        error.message || `Failed to ${editingNote ? "update" : "create"} note`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (note: Notes) => {
    setEditingNote(note);
    setFormData({
      subject: note.subject,
      topic: note.topic || "",
      notesType: note.notesType,
      price: note.price,
    });
    setIsAddDialogOpen(true);
  };

  const RequiredLabel = ({ name, label }: { name: string; label: string }) => (
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} <span className="text-red-500">*</span>
    </label>
  );

  const handleDeleteNote = async (notesId: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        // You'll need to implement deleteNote in your service
        toast.info("Delete functionality will be implemented soon");
      } catch (error: any) {
        setError(error.message || "Failed to delete note");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notes Management</h2>
          <p className="text-gray-600">Create and manage all study notes</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setEditingNote(null);
              setFormData({
                subject: "",
                topic: "",
                notesType: "Free",
                price: 0,
              });
              setFileData(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-blue-600 to-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Notes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? "Edit Notes" : "Create New Notes"}
              </DialogTitle>
              <DialogDescription>
                {editingNote
                  ? "Update the notes details"
                  : "Add new study notes to the platform"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel name="subject" label="Subject" />
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Enter subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel name="topic" label="Topic" />
                  <Input
                    id="topic"
                    name="topic"
                    placeholder="Enter topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <RequiredLabel name="notesType" label="Notes Type" />
                  <select
                    id="notesType"
                    name="notesType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.notesType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notesType: e.target.value as "Free" | "Paid",
                      }))
                    }
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
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={formData.notesType === "Free"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <RequiredLabel name="file" label="Notes Material" />
                {editingNote?.downloadUrl && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Current file:</p>
                    <a
                      href={editingNote.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {editingNote.downloadUrl.split("/").pop()}
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
                  {editingNote && " (Leave empty to keep current file)"}
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingNote(null);
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {notes.length}
            </div>
            <div className="text-sm text-gray-600">Total Notes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {notes.filter((n) => n.notesType === "Free").length}
            </div>
            <div className="text-sm text-gray-600">Free Notes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {notes.filter((n) => n.notesType === "Paid").length}
            </div>
            <div className="text-sm text-gray-600">Paid Notes</div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notes</CardTitle>
          <CardDescription>Manage study notes and materials</CardDescription>
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
                  <TableHead>Download</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.notesId}>
                    <TableCell className="font-medium">
                      {note.subject}
                    </TableCell>
                    <TableCell>{note.topic}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          note.notesType === "Paid" ? "default" : "secondary"
                        }
                        className={
                          note.notesType === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {note.notesType}
                      </Badge>
                    </TableCell>
                    <TableCell>₹ {note.price || 0}</TableCell>
                    <TableCell>
                      {note.downloadUrl && (
                        <a
                          href={note.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Download
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(note)}
                          >
                            Edit Notes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.notesId);
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
