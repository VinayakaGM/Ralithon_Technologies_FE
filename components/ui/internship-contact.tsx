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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InternshipContact({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [instructionContactData, setInstructionContactData] = useState({
    emailId: "",
    description: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setInstructionContactData({
        emailId: "",
        description: "",
      });
    }
  }, [isOpen]);

  const handleChangeInstructionData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setInstructionContactData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmitData = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      toast({
        title: "Success",
        description: "Information send successfully!",
      });
      onClose();
    } catch (error) {
      console.error("Error while sending information:", error);
      toast({
        title: "Error",
        description: "Failed to sending information. Please try again.",
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
            Internship Inquiry
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmitData} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="emailId">Email ID</Label>
            <Input
              id="emailId"
              type="email"
              placeholder="m@example.com"
              required
              value={instructionContactData.emailId}
              onChange={handleChangeInstructionData}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Write your message or cover letter"
              required
              value={instructionContactData.description}
              onChange={handleChangeInstructionData}
              style={{ minHeight: "100px" }}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
