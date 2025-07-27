"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import authService from "@/services/auth.service";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  email: string;
  isLoading: boolean;
  error: string;
}

export function OTPVerificationModal({
  isOpen,
  onClose,
  onVerify,
  email,
  isLoading,
  error,
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(["", "", "", ""]); // Changed to 4 digits
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(4).fill(null)); // Changed to 4

  useEffect(() => {
    if (isOpen && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [isOpen, resendTimer]);

  useEffect(() => {
    if (isOpen) {
      // Reset OTP when modal opens
      setOtp(["", "", "", ""]); // Changed to 4 digits
      setResendTimer(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      // Changed to 3 (since we have 4 digits now)
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length === 4) {
      // Changed to 4
      onVerify(otpString);
    }
  };

  const handleResend = async () => {
    try {
      setResendTimer(60);
      setCanResend(false);

      const response = await authService.generateOTP(email);

      toast.success(
        response.message || "New verification code sent to your email",
        {
          description: "Please enter the new 4-digit code",
        }
      );
    } catch (error: any) {
      console.error("Error resending OTP:", error);

      let errorMessage = "Failed to resend OTP. Please try again later.";
      if (error.response?.status === 404) {
        errorMessage = "Email not found. Please check your email address.";
      } else if (error.response?.status === 429) {
        errorMessage = "Too many requests. Please wait before trying again.";
      }

      toast.error("Failed to resend OTP", {
        description: errorMessage,
      });

      setCanResend(true);
      setResendTimer(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Verify Your Email</DialogTitle>
        </DialogHeader>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            We've sent a 4-digit verification code to {/* Changed to 4-digit */}
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-center block">Enter verification code</Label>
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-br from-gray-800 to-gray-900"
            disabled={isLoading || otp.join("").length !== 4} // Changed to 4
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Code
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {"Didn't receive the code? "}
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-blue-600 hover:underline font-medium"
                disabled={isLoading}
              >
                Resend Code
              </button>
            ) : (
              <span className="text-gray-400">Resend in {resendTimer}s</span>
            )}
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            Change email address
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
