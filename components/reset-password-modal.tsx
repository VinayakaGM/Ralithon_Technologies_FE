// components/reset-password-modal.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import forgetPasswordService from "@/services/forget-password.service";
import { Eye, EyeOff } from "lucide-react";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  email,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8 || password.length > 15) {
      return "Password must be 8-15 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "At least 1 uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "At least 1 lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "At least 1 number";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "At least 1 special character";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error("Invalid password", {
        description: passwordError,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgetPasswordService.setPassword({
        emailId: email,
        password: password,
      });

      if (result.success) {
        toast.success("Password reset successfully");
        onClose();
      } else {
        toast.error("Failed to reset password", {
          description: result.message || "Please try again later",
        });
      }
    } catch (error: any) {
      toast.error("Failed to reset password", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Set New Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="opacity-70"
            />
            <p className="text-xs text-muted-foreground">
              This is the email address associated with your account
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {password && validatePassword(password) && (
              <p className="text-red-500 text-xs mt-1">
                {validatePassword(password)}
              </p>
            )}
            {!validatePassword(password) && password && (
              <p className="text-green-500 text-xs mt-1">
                Password meets requirements
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
            )}
          </div>

          <Button
            type="submit"
            className="bg-gradient-to-br from-blue-600 to-blue-800 w-full"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
