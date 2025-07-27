"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

interface ModernContactFormProps {
  onSubmit: (data: ContactFormData) => void;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  message: string;
}

export function ModernContactForm({ onSubmit }: ModernContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit(formData);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      message: "",
    });
    setIsSubmitting(false);
    toast.success("Message Sent! ", {
      description: "Your message has been sent successfully.",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-5 min-h-[400px]">
        {/* Left Sidebar - Compact Gradient Section */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-6 lg:p-8 text-gray-300 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-20 h-20 border-2 border-gray-600 rounded-full"></div>
          <div className="absolute top-6 right-6 w-16 h-16 border-2 border-gray-700 rounded-full"></div>

          <div className="relative z-10 h-full flex flex-col justify-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-white">
              Contact Us
            </h2>
            <p className="text-base lg:text-lg text-gray-400 mb-6 leading-relaxed">
              Not sure what you need? The team at Ralithon Technologies will be
              happy to listen to you and suggest solutions you hadn't
              considered.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="text-white font-medium text-sm">
                    shivanshshivhare44@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Support</p>
                  <p className="text-white font-medium text-sm">
                    +91 8109867611
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Address</p>
                  <p className="text-white font-medium text-sm">
                    PU-4 behind orbit mall, Indore [M.P.]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section - Compact */}
        <div className="lg:col-span-3 p-6 lg:p-8 bg-gray-50">
          <div className="max-w-2xl">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              We'd love to hear from you!
            </h3>
            <p className="text-lg text-gray-600 mb-6">Let's get in touch</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone number
                  </label>
                  <div className="flex">
                    <select className="px-2 py-2 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm">
                      <option value="IN">IN</option>
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-l-0 border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="olivia@untitledui.com"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                  placeholder="Type your message here"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-br from-gray-800 to-gray-900 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
