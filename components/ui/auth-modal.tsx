"use client";

import React, { useState, useEffect } from "react";
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
import AuthService from "@/services/auth.service";
import { Eye, EyeOff } from "lucide-react";
import { OTPVerificationModal } from "../otp-verification-modal-box";
import authService from "@/services/auth.service";
import { Captcha } from "../captcha";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "signup" | "signin";
  onModeChange?: (mode: "signup" | "signin") => void;
  onAuthSuccess?: () => void;
  customMessage?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  mode = "signup",
  onModeChange,
  onAuthSuccess,
  customMessage,
}: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingForSignIn, setIsLoadingForSignIn] = useState(false);
  const [isLoadingForSignUp, setIsLoadingForSignUp] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [userId, setUserId] = useState<number>(0);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    contact: "+91",
    password: "",
    checkPassword: "",
  });

  const [signInData, setSignInData] = useState({
    emailId: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    contact: "",
    password: "",
    checkPassword: "",
  });

  const { login } = useSession();

  useEffect(() => {
    if (!isOpen) {
      resetFormState();
    }
  }, [isOpen]);

  const resetFormState = () => {
    setSignUpData({
      firstName: "",
      lastName: "",
      emailId: "",
      contact: "+91",
      password: "",
      checkPassword: "",
    });
    setSignInData({
      emailId: "",
      password: "",
    });
    setErrors({
      firstName: "",
      lastName: "",
      emailId: "",
      contact: "",
      password: "",
      checkPassword: "",
    });
    setAcceptedTerms(true);
    setShowOTPModal(false);
    setIsCaptchaValid(false);
    setCaptchaReset((prev) => prev + 1);
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
      case "lastName":
        return /^[a-zA-Z]+$/.test(value)
          ? ""
          : "Only alphabetic characters allowed";
      case "contact":
        return /^\+91\d{10}$/.test(value)
          ? ""
          : "Must be +91 followed by 10 digits";
      case "password":
        if (value.length < 8 || value.length > 15)
          return "Password must be 8-15 characters";
        if (!/[A-Z]/.test(value)) return "At least 1 uppercase letter";
        if (!/[a-z]/.test(value)) return "At least 1 lowercase letter";
        if (!/[0-9]/.test(value)) return "At least 1 number";
        if (!/[^A-Za-z0-9]/.test(value)) return "At least 1 special character";
        return "";
      case "checkPassword":
        return value === signUpData.password ? "" : "Passwords don't match";
      case "emailId":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Invalid email format";
      default:
        return "";
    }
  };

  const handleToggleMode = () => {
    if (onModeChange) {
      onModeChange(mode === "signup" ? "signin" : "signup");
    }
    resetFormState();
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let processedValue = value;

    if (id === "contact") {
      processedValue = value.startsWith("+91")
        ? "+91" + value.substring(3).replace(/\D/g, "").slice(0, 10)
        : "+91" + value.replace(/\D/g, "").slice(0, 10);
    } else if (id === "firstName" || id === "lastName") {
      processedValue = value.replace(/[^a-zA-Z]/g, "");
    }

    setSignUpData((prev) => ({ ...prev, [id]: processedValue }));
    setErrors((prev) => ({ ...prev, [id]: validateField(id, processedValue) }));
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSignInData((prev) => ({ ...prev, [id]: value }));
  };

  const validateSignUpForm = () => {
    const newErrors = {
      firstName: validateField("firstName", signUpData.firstName),
      lastName: validateField("lastName", signUpData.lastName),
      emailId: validateField("emailId", signUpData.emailId),
      contact: validateField("contact", signUpData.contact),
      password: validateField("password", signUpData.password),
      checkPassword: validateField("checkPassword", signUpData.checkPassword),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleCaptchaVerify = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error("You must accept the terms and conditions.");
      return;
    }

    if (!isCaptchaValid) {
      toast.error("Please complete the verification code");
      return;
    }

    if (!validateSignUpForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoadingForSignUp(true);

    try {
      const response = await AuthService.register({
        emailId: signUpData.emailId,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        password: signUpData.password,
        contact: signUpData.contact,
        checkPassword: signUpData.checkPassword,
        userConstraint: acceptedTerms,
      });

      if (response.userId) setUserId(response.userId);

      if (response.otpVerify === false) {
        setShowOTPModal(true);
        toast.success(
          response.message || "Verification code sent to your email",
          {
            description: "Please enter the 4-digit code to verify your account",
          }
        );
      }

      if (response.status_code === 201) {
        onClose();
        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (error: any) {
      setCaptchaReset((prev) => prev + 1);
      setIsCaptchaValid(false);

      if (
        error.response?.data?.statusCode === 400 &&
        error.response?.data?.otpVerify === false
      ) {
        setShowOTPModal(true);
        toast.success(
          error.response?.data?.message ||
          "Verification code sent to your email",
          {
            description: "Please enter the 4-digit code to verify your account",
          }
        );
      } else {
        toast.error("Registration Failed", {
          description:
            error.response?.data?.message ||
            error.message ||
            "Failed to create account. Please try again.",
        });
      }
    } finally {
      setIsLoadingForSignUp(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setIsVerifyingOTP(true);
    setOtpError("");

    localStorage.setItem("email", signUpData.emailId);
    try {
      const response = await authService.verifyOTP({
        userId: userId,
        otp: otp,
      });

      if (response.statusCode === 200 || response.statusCode === 208) {
        toast.success(response?.message || "Account Verified Successfully!");

        try {
          const loginResponse = await AuthService.login({
            emailId: signUpData.emailId,
            password: signUpData.password,
          });

          if (
            loginResponse.status_code === 200 ||
            loginResponse.message === "login successfully"
          ) {
            toast.success("Welcome! 👋", {
              description: `You've been automatically logged in. Welcome to Ralithon Technologies!`,
            });
            localStorage.setItem("authToken", loginResponse.token);
            login(response.token);
            setShowOTPModal(false);
            onClose();
            if (onAuthSuccess) onAuthSuccess();
          }
        } catch (loginError: any) {
          console.error("Auto login error:", loginError);
          toast.error("Auto Login Failed", {
            description: "Please sign in manually.",
          });
          setShowOTPModal(false);
          onClose();
        }
      } else {
        setOtpError(response.message || "Invalid verification code");
      }
    } catch (error: any) {
      setOtpError(
        error.response?.data?.message ||
        error.response?.message ||
        "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleOTPModalClose = () => {
    setShowOTPModal(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCaptchaValid) {
      toast.error("Please complete the verification code");
      return;
    }

    setIsLoadingForSignIn(true);

    try {
      const response = await AuthService.login({
        emailId: signInData.emailId,
        password: signInData.password,
      });

      if (
        response.status_code === 200 ||
        response.message === "login successfully"
      ) {
        toast.success("Welcome Back! 👋", {
          description: `${response.message || "You've successfully logged in."
            } Welcome to Ralithon Technologies!`,
        });
        localStorage.setItem("authToken", response.token);
        login(response.token);
        onClose();
        if (onAuthSuccess) onAuthSuccess();
      } else {
        toast.error("Login Failed", {
          description: response.message || "Login failed. Please try again.",
        });
      }
    } catch (error: any) {
      setCaptchaReset((prev) => prev + 1);
      setIsCaptchaValid(false);
      toast.error("Login Failed", {
        description:
          error.response?.data?.message ||
          error.response?.message ||
          "Invalid credentials. Please check your email and password.",
      });
    } finally {
      setIsLoadingForSignIn(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] w-[90vw] max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              {mode === "signup"
                ? "Create an account"
                : "Sign in to your account"}
            </DialogTitle>
          </DialogHeader>

          {customMessage && (
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 mb-4">
              {customMessage}
            </div>
          )}

          {mode === "signup" ? (
            <form onSubmit={handleSignUp} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    required
                    value={signUpData.firstName}
                    onChange={handleSignUpChange}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    required
                    value={signUpData.lastName}
                    onChange={handleSignUpChange}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailId">Email ID</Label>
                  <Input
                    id="emailId"
                    type="email"
                    placeholder="example@gmail.com"
                    required
                    value={signUpData.emailId}
                    onChange={handleSignUpChange}
                  />
                  {errors.emailId && (
                    <p className="text-red-500 text-xs">{errors.emailId}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Phone Number</Label>
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="+XXXXXXXXXXXX"
                    required
                    value={signUpData.contact}
                    onChange={handleSignUpChange}
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-xs">{errors.contact}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      required
                      value={signUpData.password}
                      onChange={handleSignUpChange}
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
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                  {!errors.password && signUpData.password && (
                    <p className="text-xs text-gray-500 mt-1">
                      8-15 chars, 1 upper, 1 lower, 1 number, 1 special
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="checkPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      required
                      value={signUpData.checkPassword}
                      onChange={handleSignUpChange}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.checkPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.checkPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium text-gray-700"
                >
                  I have read and agree to the&nbsp;
                  <Link
                    href="/policy"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                  >
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              <div className="mt-4">
                <Captcha onVerify={handleCaptchaVerify} reset={captchaReset} />
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-br from-blue-600 to-blue-800 w-full mt-2"
                disabled={
                  isLoadingForSignUp || !isCaptchaValid || !acceptedTerms
                }
              >
                {isLoadingForSignUp ? "Creating account..." : "Sign Up"}
              </Button>

              <div className="mt-4 text-center text-sm">
                Already a user?{" "}
                <Button
                  variant="link"
                  type="button"
                  onClick={handleToggleMode}
                  className="p-0 h-auto text-sm underline"
                >
                  Sign-in
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="emailId">Email</Label>
                <Input
                  id="emailId"
                  placeholder="m@example.com"
                  required
                  value={signInData.emailId}
                  onChange={handleSignInChange}
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  required
                  value={signInData.password}
                  onChange={handleSignInChange}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-7 h-4/5 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="mt-4">
                <Captcha onVerify={handleCaptchaVerify} reset={captchaReset} />
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-br from-blue-600 to-blue-800 w-full"
                disabled={isLoadingForSignIn || !isCaptchaValid}
              >
                {isLoadingForSignIn ? "Signing in..." : "Sign In"}
              </Button>

              <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  type="button"
                  onClick={handleToggleMode}
                  className="p-0 h-auto text-sm underline"
                >
                  Sign-up
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={handleOTPModalClose}
        onVerify={handleVerifyOTP}
        email={signUpData.emailId}
        isLoading={isVerifyingOTP}
        error={otpError}
      />
    </>
  );
}
