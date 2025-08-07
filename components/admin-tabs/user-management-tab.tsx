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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Search, MoreHorizontal, Filter } from "lucide-react";
import UserService from "@/services/users.service";
import { Pagination } from "../Pagination";

interface ApiUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "ROLE_STUDENT" | "ROLE_ADMIN";
  phoneNumber: string;
  status: boolean;
  coursesEnrolled: number | null;
  memberSince: string | null;
  certificatesEarned: number | null;
}

const USERS_PER_PAGE = 8;

export function UserManagementTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<
    "all" | "ROLE_STUDENT" | "ROLE_ADMIN"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserService.getAllUsers();
        if (response.success) {
          setUsers(response.data);
          setFilteredUsers(response.data);
        } else {
          setError(response.message || "Failed to fetch users");
        }
      } catch (err) {
        setError("An error occurred while fetching users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
    applyFilters(term, roleFilter, statusFilter);
  };

  const applyFilters = (
    searchTerm: string,
    role: typeof roleFilter,
    status: typeof statusFilter
  ) => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (role !== "all") {
      filtered = filtered.filter((user) => user.role === role);
    }

    if (status !== "all") {
      filtered = filtered.filter((user) =>
        status === "active" ? user.status : !user.status
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRoleFilterChange = (role: typeof roleFilter) => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page when changing role filter
    applyFilters(searchTerm, role, statusFilter);
  };

  const handleStatusFilterChange = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when changing status filter
    applyFilters(searchTerm, roleFilter, status);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate pagination data
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading users...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">
            Manage all registered users and their permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {users.length}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.role === "ROLE_STUDENT").length}
            </div>
            <div className="text-sm text-gray-600">Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 ">
              {users.filter((u) => u.role === "ROLE_ADMIN").length}
            </div>
            <div className="text-sm text-gray-600">Administrators</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {users.filter((u) => u.status).length}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Search, filter, and manage user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="p-2">
                  <h4 className="text-sm font-medium mb-2">Role</h4>
                  <div className="space-y-1">
                    <button
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors duration-75 ${
                        roleFilter === "all"
                          ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
                          : "text-gray-600 hover:bg-blue-50"
                      }`}
                      onClick={() => handleRoleFilterChange("all")}
                    >
                      All Roles
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors duration-75 ${
                        roleFilter === "ROLE_STUDENT"
                          ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
                          : "text-gray-600 hover:bg-blue-50"
                      }`}
                      onClick={() => handleRoleFilterChange("ROLE_STUDENT")}
                    >
                      Students
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors duration-75 ${
                        roleFilter === "ROLE_ADMIN"
                          ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
                          : "text-gray-600 hover:bg-blue-50"
                      }`}
                      onClick={() => handleRoleFilterChange("ROLE_ADMIN")}
                    >
                      Administrators
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <h4 className="text-sm font-medium mb-2">Status</h4>
                  <div className="space-y-1">
                    <button
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors duration-75 ${
                        statusFilter === "all"
                          ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
                          : "text-gray-600 hover:bg-blue-50"
                      }`}
                      onClick={() => handleStatusFilterChange("all")}
                    >
                      All Statuses
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors duration-75 ${
                        statusFilter === "active"
                          ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
                          : "text-gray-600 hover:bg-blue-50"
                      }`}
                      onClick={() => handleStatusFilterChange("active")}
                    >
                      Active
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors duration-75 ${
                        statusFilter === "inactive"
                          ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
                          : "text-gray-600 hover:bg-blue-50"
                      }`}
                      onClick={() => handleStatusFilterChange("inactive")}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ROLE_ADMIN" ? "default" : "secondary"
                        }
                        className={
                          user.role === "ROLE_ADMIN"
                            ? "bg-gradient-to-br from-blue-600 to-blue-800"
                            : ""
                        }
                      >
                        {user.role === "ROLE_ADMIN" ? "Admin" : "Student"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status ? "default" : "secondary"}
                        className={
                          user.status
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {user.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.coursesEnrolled ?? 0}</TableCell>
                    <TableCell>{formatDate(user.memberSince)}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            {user.status ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
