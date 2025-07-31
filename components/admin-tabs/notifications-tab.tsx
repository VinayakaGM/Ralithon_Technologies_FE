"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Send, Bell, Users, Calendar } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "New Course Available: Advanced JavaScript",
    message:
      "We're excited to announce a new advanced JavaScript course is now available for enrollment.",
    targetRole: "ROLE_STUDENT",
    status: "sent",
    sentDate: "2024-01-25",
    recipients: 298,
  },
  {
    id: 2,
    title: "System Maintenance Scheduled",
    message:
      "The platform will undergo maintenance on Sunday, February 4th from 2:00 AM to 4:00 AM EST.",
    targetRole: "all",
    status: "sent",
    sentDate: "2024-01-24",
    recipients: 342,
  },
  {
    id: 3,
    title: "Monthly Assessment Reports Available",
    message:
      "The monthly assessment reports for January are now available in the admin dashboard.",
    targetRole: "ROLE_ADMIN",
    status: "sent",
    sentDate: "2024-01-23",
    recipients: 5,
  },
  {
    id: 4,
    title: "Certificate Generation Update",
    message:
      "New automated certificate generation features have been added to the platform.",
    targetRole: "ROLE_ADMIN",
    status: "draft",
    sentDate: null,
    recipients: 0,
  },
];

export function NotificationsTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Notifications & Announcements
          </h2>
          <p className="text-gray-600">
            Send announcements and reminders to users
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-blue-600 to-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Send a notification to specific user roles or all users
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter announcement title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your announcement message..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Target Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="ROLE_STUDENT">
                        Students Only
                      </SelectItem>
                      <SelectItem value="ROLE_ADMIN">
                        Administrators Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Optional)</Label>
                <Input id="schedule" type="datetime-local" />
                <p className="text-xs text-gray-500">
                  Leave empty to send immediately
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Save as Draft
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
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
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {notifications.length}
              </div>
            </div>
            <div className="text-sm text-gray-600">Total Notifications</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter((n) => n.status === "sent").length}
              </div>
            </div>
            <div className="text-sm text-gray-600">Sent</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">
                {notifications.filter((n) => n.status === "draft").length}
              </div>
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {notifications.reduce((sum, n) => sum + n.recipients, 0)}
              </div>
            </div>
            <div className="text-sm text-gray-600">Total Recipients</div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            Manage your announcements and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {notification.message}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {notification.targetRole === "all"
                        ? "All Users"
                        : notification.targetRole === "ROLE_STUDENT"
                        ? "Students"
                        : "Admins"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      {notification.recipients}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        notification.status === "sent" ? "default" : "secondary"
                      }
                      className={
                        notification.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {notification.status.charAt(0).toUpperCase() +
                        notification.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{notification.sentDate || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      {notification.status === "draft" && (
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
