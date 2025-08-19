"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Filter, Users, UserCheck, Shield, Activity } from "lucide-react"
import UserService from "@/services/users.service"
import { Pagination } from "@/components/Pagination"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { toast } from "sonner"

interface ApiUser {
  userId: number
  firstName: string
  lastName: string
  email: string
  role: "ROLE_STUDENT" | "ROLE_ADMIN"
  phoneNumber: string
  status: boolean
  coursesEnrolled: number | null
  memberSince: string | null
  certificatesEarned: number | null
}

const USERS_PER_PAGE = 8

export default function UserManagementTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<ApiUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<"all" | "ROLE_STUDENT" | "ROLE_ADMIN">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("users")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await UserService.getAllUsers()
        if (response.success) {
          setUsers(response.data)
          setFilteredUsers(response.data)
          if (response.data.length === 0) {
            toast.info("No users found in the system")
          }
        } else {
          setError(response.message || "Failed to fetch users")
          toast.error(response.message || "Failed to fetch users")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching users"
        setError(errorMessage)
        toast.error(errorMessage)
        console.error("Error fetching users:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
    applyFilters(term, roleFilter, statusFilter)
  }

  const applyFilters = (searchTerm: string, role: typeof roleFilter, status: typeof statusFilter) => {
    let filtered = [...users]

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (role !== "all") {
      filtered = filtered.filter((user) => user.role === role)
    }

    if (status !== "all") {
      filtered = filtered.filter((user) => (status === "active" ? user.status : !user.status))
    }

    setFilteredUsers(filtered)
  }

  const handleRoleFilterChange = (role: typeof roleFilter) => {
    setRoleFilter(role)
    setCurrentPage(1)
    applyFilters(searchTerm, role, statusFilter)
  }

  const handleStatusFilterChange = (status: typeof statusFilter) => {
    setStatusFilter(status)
    setCurrentPage(1)
    applyFilters(searchTerm, roleFilter, status)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Calculate pagination data
  const totalUsers = filteredUsers.length
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE)
  const startIndex = (currentPage - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  if (loading) {
    return (
      <LoadingSpinner message="Loading Users..."/>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      User Management
                    </h1>
                    <p className="text-slate-600 text-lg">Manage all registered users and their permissions</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                  <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-blue-600 mb-1">{users.length}</div>
                          <div className="text-sm font-medium text-slate-600">Total Users</div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-emerald-600 mb-1">
                            {users.filter((u) => u.role === "ROLE_STUDENT").length}
                          </div>
                          <div className="text-sm font-medium text-slate-600">Students</div>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-xl">
                          <UserCheck className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-indigo-600 mb-1">
                            {users.filter((u) => u.role === "ROLE_ADMIN").length}
                          </div>
                          <div className="text-sm font-medium text-slate-600">Administrators</div>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-xl">
                          <Shield className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-orange-600 mb-1">
                            {users.filter((u) => u.status).length}
                          </div>
                          <div className="text-sm font-medium text-slate-600">Active Users</div>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-xl">
                          <Activity className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold text-slate-900">All Users</CardTitle>
                        <CardDescription className="text-slate-600 mt-1">
                          Search, filter, and manage user accounts
                        </CardDescription>
                      </div>
                      <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                        {totalUsers} {totalUsers === 1 ? "user" : "users"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          placeholder="Search users by name, email, or role..."
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 bg-transparent">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                            {(roleFilter !== "all" || statusFilter !== "all") && (
                              <div className="ml-2 h-2 w-2 bg-blue-600 rounded-full"></div>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 border-slate-200 shadow-lg">
                          <div className="p-3">
                            <h4 className="text-sm font-semibold mb-3 text-slate-900">Role</h4>
                            <div className="space-y-2">
                              <button
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  roleFilter === "all"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                                onClick={() => handleRoleFilterChange("all")}
                              >
                                All Roles
                              </button>
                              <button
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  roleFilter === "ROLE_STUDENT"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                                onClick={() => handleRoleFilterChange("ROLE_STUDENT")}
                              >
                                Students
                              </button>
                              <button
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  roleFilter === "ROLE_ADMIN"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                                onClick={() => handleRoleFilterChange("ROLE_ADMIN")}
                              >
                                Administrators
                              </button>
                            </div>
                          </div>
                          <DropdownMenuSeparator />
                          <div className="p-3">
                            <h4 className="text-sm font-semibold mb-3 text-slate-900">Status</h4>
                            <div className="space-y-2">
                              <button
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  statusFilter === "all"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                                onClick={() => handleStatusFilterChange("all")}
                              >
                                All Statuses
                              </button>
                              <button
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  statusFilter === "active"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                                onClick={() => handleStatusFilterChange("active")}
                              >
                                Active
                              </button>
                              <button
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  statusFilter === "inactive"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
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

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/80 hover:bg-slate-50">
                            <TableHead className="font-semibold text-slate-700">User</TableHead>
                            <TableHead className="font-semibold text-slate-700">Role</TableHead>
                            <TableHead className="font-semibold text-slate-700">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700">Courses</TableHead>
                            <TableHead className="font-semibold text-slate-700">Join Date</TableHead>
                            <TableHead className="font-semibold text-slate-700">Phone</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-12">
                                <div className="flex flex-col items-center justify-center">
                                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                  <div className="font-medium text-slate-700 mb-1">
                                    {searchTerm || roleFilter !== "all" || statusFilter !== "all" 
                                      ? "No users match your search criteria" 
                                      : "No users found in the system"}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                                      ? "Try adjusting your search or filter settings"
                                      : "Please check back later or add new users"}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedUsers.map((user) => (
                              <TableRow
                                key={user.userId}
                                className="hover:bg-slate-50/50 transition-colors duration-150"
                              >
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                        {user.firstName.charAt(0)}
                                        {user.lastName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-semibold text-slate-900">
                                        {user.firstName} {user.lastName}
                                      </div>
                                      <div className="text-sm text-slate-500">{user.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={user.role === "ROLE_ADMIN" ? "default" : "secondary"}
                                    className={
                                      user.role === "ROLE_ADMIN"
                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-sm"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-0"
                                    }
                                  >
                                    {user.role === "ROLE_ADMIN" ? "Admin" : "Student"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={
                                      user.status
                                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-0"
                                    }
                                  >
                                    {user.status ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-slate-700">
                                  {user.coursesEnrolled ?? 0}
                                </TableCell>
                                <TableCell className="text-slate-600">{formatDate(user.memberSince)}</TableCell>
                                <TableCell className="text-slate-600">{user.phoneNumber}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="border-slate-200 shadow-lg">
                                      <DropdownMenuItem className="hover:bg-slate-50">View Profile</DropdownMenuItem>
                                      <DropdownMenuItem className="hover:bg-slate-50">Edit User</DropdownMenuItem>
                                      <DropdownMenuItem className="hover:bg-slate-50">Reset Password</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                        {user.status ? "Deactivate" : "Activate"}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {totalPages > 1 && filteredUsers.length > 0 && (
                      <div className="flex justify-center pt-4">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
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