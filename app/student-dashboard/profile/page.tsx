"use client"

import { useEffect, useState, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  Camera,
  Shield,
  Check,
  X,
  Edit3,
  Upload
} from "lucide-react";
import UserService from "@/services/users.service";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/student-sidebar";
import { StudentHeader } from "@/components/student-header";
import {formatDate} from "@/utils/dateFormat"

interface UserData {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "ROLE_STUDENT" | "ROLE_ADMIN";
  status: boolean;
  memberSince: string;
  coursesEnrolled: number;
  certificatesEarned: number;
  profileImage?: string;
}

export default function ProfileTab() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = currentUser?.userId;
        if (!userId) {
          setError("User not authenticated");
          return;
        }

        const response = await UserService.getUserById(userId);

        if (response.success) {
          setUser(response.data);
          setFormData({
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            phoneNumber: response.data.phoneNumber,
          });
          setImagePreview(response.data?.profileImage)
          if (response.data.profileImage) {
            setImagePreview(response.data.profileImage);
          }
        } else {
          setError(response.message || "Failed to fetch user data");
        }
      } catch (err) {
        setError("An error occurred while fetching user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser?.userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (id === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "");
      const truncatedValue = digitsOnly.slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [id]: truncatedValue,
      }));
      // Clear error when user starts typing
      if (fieldErrors.phoneNumber) {
        setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }));
      }
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    
    if (fieldErrors[id as keyof typeof formData]) {
      setFieldErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      // Check file type
      if (!file.type.match("image.*")) {
        toast.error("Only image files are allowed");
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Convert image to base64 for upload
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setProfileImage(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    const newErrors: typeof fieldErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name can only contain letters and spaces";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name can only contain letters and spaces";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});

    try {
      setIsUploading(true);

      const response = await UserService.updateUser(
        user.userId,
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
        },
        profileImage || null
      );

      if (response.success) {
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
            profileImage: response.data.profileImage || prev.profileImage,
          };
        });

        // Reset edit mode and clear temporary image state
        setEditMode(false);
        setProfileImage(null);

        // Update the image preview with the new URL if it was changed
        if (response.data.profileImage) {
          setImagePreview(response.data.profileImage);
        }

        toast.success("Profile updated successfully");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("An error occurred while updating profile");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelEdit = () => {
    if (!user) return;

    // Reset form to original user data
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });

    // Reset image preview to original
    setImagePreview(user.profileImage || null);
    setProfileImage(null);
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">No user data available</p>
      </div>
    );
  }

  const formattedRole = user.role === "ROLE_STUDENT" ? "Student" : "Admin";
  const formattedDate = formatDate(user.memberSince);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <StudentHeader />
          <main className="p-6 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your personal information and account preferences</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {/* Profile Card - Main Section */}
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center space-x-2">
                            <User className="w-5 h-5" />
                            <span>Personal Information</span>
                          </CardTitle>
                          <CardDescription className="text-blue-100 mt-1">
                            Update your personal details and profile picture
                          </CardDescription>
                        </div>
                        {!editMode && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditMode(true)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      {/* Profile Image Section */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                        <div className="relative group">
                          <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                            <AvatarImage
                              src={imagePreview || "/placeholder.svg"}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              {user.firstName?.charAt(0)}
                              {user.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {editMode && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={triggerFileInput}>
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-gray-600 mb-3">{user.email}</p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                            disabled={!editMode}
                          />
                          {editMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={triggerFileInput}
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Change Photo
                            </Button>
                          )}
                          {editMode && (
                            <p className="text-xs text-gray-500 mt-2">
                              JPG, PNG up to 2MB • Recommended: 400x400px
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>First Name</span>
                          </Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`transition-all duration-200 ${
                              fieldErrors.firstName ? 'border-red-500' : editMode ? 'border-blue-300' : 'border-gray-200'
                            } ${editMode
                                ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                : 'bg-gray-50 border-gray-200'
                              }`}
                          />
                          {fieldErrors.firstName && (
                            <p className="mt-1 text-red-600 text-sm">{fieldErrors.firstName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Last Name</span>
                          </Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`transition-all duration-200 ${
                              fieldErrors.lastName ? 'border-red-500' : editMode ? 'border-blue-300' : 'border-gray-200'
                            } ${editMode
                                ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                : 'bg-gray-50 border-gray-200'
                              }`}
                          />
                          {fieldErrors.lastName && (
                            <p className="mt-1 text-red-600 text-sm">{fieldErrors.lastName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Email Address</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="bg-gray-50 border-gray-200"
                          />
                          <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>Phone Number</span>
                          </Label>
                          <Input
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Enter your phone number"
                            className={`transition-all duration-200 ${
                              fieldErrors.phoneNumber ? 'border-red-500' : editMode ? 'border-blue-300' : 'border-gray-200'
                            } ${editMode
                                ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                : 'bg-gray-50 border-gray-200'
                              }`}
                          />
                          {fieldErrors.phoneNumber && (
                            <p className="mt-1 text-red-600 text-sm">{fieldErrors.phoneNumber}</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {editMode && (
                        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                          <Button
                            onClick={handleSaveChanges}
                            disabled={isUploading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            {isUploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={isUploading}
                            className="px-6 py-2 hover:bg-gray-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Account Status Card */}
                <div className="lg:col-span-1">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-fit">
                    <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Account Overview</span>
                      </CardTitle>
                      <CardDescription className="text-green-100">
                        Your account status and statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Role</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 font-medium px-3 py-1"
                        >
                          {formattedRole}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Status</span>
                        </div>
                        <Badge
                          className={`font-medium px-3 py-1 ${user.status
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }`}
                        >
                          {user.status ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Member Since</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{formattedDate}</span>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Courses Enrolled</p>
                              <p className="text-xs text-gray-500">Active learning</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{user.coursesEnrolled || 0}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                              <Award className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Certificates</p>
                              <p className="text-xs text-gray-500">Earned achievements</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-amber-600">{user.certificatesEarned || 0}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}