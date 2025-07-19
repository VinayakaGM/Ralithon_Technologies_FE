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
import { useToast } from "@/components/ui/use-toast";
import AuthService from "@/services/auth.service";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signup" | "signin";
  onAuthSuccess?: () => void;
  customMessage?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signup",
  onAuthSuccess,
  customMessage,
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    contact: "",
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

  useEffect(() => {
    if (!isOpen) {
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
    } else {
      setIsSignUp(initialMode === "signup");
    }
  }, [isOpen, initialMode]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!/^[a-zA-Z]+$/.test(value)) {
          return "Only alphabetic characters allowed";
        }
        return "";
      case "contact":
        if (!/^\+91\d{10}$/.test(value)) {
          return "Must be +91 followed by 10 digits";
        }
        return "";
      case "password":
        if (value.length < 8 || value.length > 15) {
          return "Password must be 8-15 characters";
        }
        if (!/[A-Z]/.test(value)) {
          return "At least 1 uppercase letter";
        }
        if (!/[a-z]/.test(value)) {
          return "At least 1 lowercase letter";
        }
        if (!/[0-9]/.test(value)) {
          return "At least 1 number";
        }
        if (!/[^A-Za-z0-9]/.test(value)) {
          return "At least 1 special character";
        }
        return "";
      case "checkPassword":
        if (value !== signUpData.password) {
          return "Passwords don't match";
        }
        return "";
      case "emailId":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Invalid email format";
        }
        return "";
      default:
        return "";
    }
  };

  const handleToggleMode = () => {
    setIsSignUp((prev) => !prev);
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
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "contact") {
      const cleanedValue = value.startsWith("+91")
        ? "+91" + value.substring(3).replace(/\D/g, "").slice(0, 10)
        : "+91" + value.replace(/\D/g, "").slice(0, 10);

      setSignUpData((prev) => ({ ...prev, [id]: cleanedValue }));
    } else if (id === "firstName" || id === "lastName") {
      const cleanedValue = value.replace(/[^a-zA-Z]/g, "");
      setSignUpData((prev) => ({ ...prev, [id]: cleanedValue }));
    } else {
      setSignUpData((prev) => ({ ...prev, [id]: value }));
    }

    setErrors((prev) => ({
      ...prev,
      [id]: validateField(id, id === "contact" ? value : value),
    }));
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUpForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    if (signUpData.password !== signUpData.checkPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await AuthService.register({
        emailId: signUpData.emailId,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        password: signUpData.password,
        contact: signUpData.contact,
        checkPassword: signUpData.checkPassword,
      });

      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      onClose();
      if (onAuthSuccess) onAuthSuccess();
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await AuthService.login({
        emailId: signInData.emailId,
        password: signInData.password,
      });

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      onClose();
      if (onAuthSuccess) onAuthSuccess();
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle style={{ display: "flex", justifyContent: "center" }}>
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </DialogTitle>
        </DialogHeader>{" "}
        {customMessage && (
          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 mb-4">
            {customMessage}
          </div>
        )}
        {isSignUp ? (
          <form onSubmit={handleSignUp} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
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
                  placeholder="Doe"
                  required
                  value={signUpData.lastName}
                  onChange={handleSignUpChange}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email & Phone Number in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailId">Email ID</Label>
                <Input
                  id="emailId"
                  type="email"
                  placeholder="m@example.com"
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
                  placeholder="+1234567890"
                  required
                  value={signUpData.contact}
                  onChange={handleSignUpChange}
                />
                {errors.contact && (
                  <p className="text-red-500 text-xs">{errors.contact}</p>
                )}
              </div>
            </div>

            {/* Password & Confirm Password in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
                {!errors.password && signUpData.password && (
                  <p className="text-xs text-gray-500">
                    8-15 chars, 1 upper, 1 lower, 1 number, 1 special
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkPassword">Confirm Password</Label>
                <Input
                  id="checkPassword"
                  type="password"
                  placeholder="********"
                  required
                  value={signUpData.checkPassword}
                  onChange={handleSignUpChange}
                />
                {errors.checkPassword && (
                  <p className="text-red-500 text-xs">{errors.checkPassword}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={signInData.password}
                onChange={handleSignInChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
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
  );
}
