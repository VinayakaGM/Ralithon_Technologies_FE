"use client";

import React, { useEffect, useState } from "react";
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
import { OTPVerificationModal } from "./otp-verification-modal-box";
import { ResetPasswordModal } from "./reset-password-modal";
import authService from "@/services/auth.service";
import forgetPasswordService from "@/services/forget-password.service";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [userId, setUserId] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgetPasswordService.generateOtp(email);

      if (response && response.data?.statusCode === 200) {
        setUserId(response.data?.userId);
        toast.success("Verification code sent", {
          description:
            "Please check your email for the 4-digit verification code",
        });
        setShowOTPModal(true);
      }
    } catch (error: any) {
      toast.error("Failed to send verification code", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setIsVerifyingOTP(true);
    setOtpError("");

    try {
      const response = await authService.verifyOTP({
        userId: userId,
        otp: otp,
      });

      if (response.statusCode === 200) {
        toast.success("Email verified successfully");
        setShowOTPModal(false);
        setShowResetModal(true);
      } else {
        setOtpError(response.message || "Invalid verification code");
      }
    } catch (error: any) {
      setOtpError(
        error.response?.data?.message ||
          error.response?.message ||
          error?.message ||
          "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleOTPModalClose = () => {
    setShowOTPModal(false);
  };

  const handleResetModalClose = () => {
    setShowResetModal(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Reset Password</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-br from-blue-600 to-blue-800 w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              We'll send a 4-digit verification code to your email address
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={handleOTPModalClose}
        onVerify={handleVerifyOTP}
        email={email}
        isLoading={isVerifyingOTP}
        error={otpError}
      />

      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={handleResetModalClose}
        email={email}
      />
    </>
  );
}
