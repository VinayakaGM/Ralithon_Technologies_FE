"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";

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
      <div className="grid lg:grid-cols-5 min-h-[600px]">
        {/* Left Sidebar */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute top-8 right-8 w-32 h-32 border-2 border-white/20 rounded-full"></div>
          <div className="absolute top-12 right-12 w-24 h-24 border-2 border-white/10 rounded-full"></div>

          <div className="relative z-10 h-full flex flex-col justify-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Contact Us</h2>
            <p className="text-lg lg:text-xl text-blue-100 mb-12 leading-relaxed">
              Not sure what you need? The team at Ralithon Technologies will be
              happy to listen to you and suggest solutions you hadn't
              considered.
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Email</p>
                  <p className="text-white font-medium">
                    shivanshshivhare44@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Support</p>
                  <p className="text-white font-medium">+91 8109867611</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Address</p>
                  <p className="text-white font-medium">
                    PU-4 behind orbit mall, Indore [M.P.]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:col-span-3 p-8 lg:p-12 bg-gray-50">
          <div className="max-w-2xl">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              We'd love to hear from you!
            </h3>
            <p className="text-xl text-gray-600 mb-8">Let's get in touch</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone number
                  </label>
                  <div className="flex">
                    <select className="px-3 py-3 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm">
                      <option value="IN">IN</option>
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 border border-l-0 border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="olivia@untitledui.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                  placeholder="Type your message here"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
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
