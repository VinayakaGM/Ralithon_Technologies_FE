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
import UserService from "@/services/users.service";
import authService from "@/services/auth.service";
import { toast } from "sonner";

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

export function ProfileTab() {
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast("Error", {
          description: "Image size should be less than 2MB",
        });
        return;
      }

      // Check file type
      if (!file.type.match("image.*")) {
        toast("Error", {
          description: "Only image files are allowed",
        });
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

    try {
      setIsUploading(true);
      const response = await UserService.updateUser(
        user.userId,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
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
        setEditMode(false);
        setProfileImage(null);
        toast("Success", {
          description: "Profile updated successfully",
        });
      } else {
        setError(response.message || "Failed to update user data");
        toast("Error", {
          description: response.message || "Failed to update profile",
        });
      }
    } catch (err) {
      setError("An error occurred while updating user data");
      console.error(err);
      toast("Error", {
        description: "An error occurred while updating profile",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-8 text-center">{error}</div>;
  }

  if (!user) {
    return <div className="py-8 text-center">No user data available</div>;
  }

  const formattedRole = user.role === "ROLE_STUDENT" ? "Student" : "Admin";
  const formattedDate = new Date(user.memberSince).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-600">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={imagePreview || "/placeholder.svg"}
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <AvatarFallback className="text-lg">
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  disabled={!editMode}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={!editMode}
                >
                  Change Photo
                </Button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={editMode ? formData.firstName : user.firstName}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={editMode ? formData.lastName : user.lastName}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={editMode ? formData.phoneNumber : user.phoneNumber}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button
                    className="bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700"
                    onClick={handleSaveChanges}
                    disabled={isUploading}
                  >
                    {isUploading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setImagePreview(user.profileImage || null);
                      setProfileImage(null);
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your current account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role</span>
              <Badge variant="secondary">{formattedRole}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Status</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {user.status ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm text-gray-600">{formattedDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Courses Enrolled</span>
              <span className="text-sm font-semibold">
                {user.coursesEnrolled || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Certificates Earned</span>
              <span className="text-sm font-semibold">
                {user.certificatesEarned || 0}{" "}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
