"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import * as yup from "yup";
import ContactService from "@/services/contact.service";

interface ModernContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  message: string;
}

const contactFormSchema = yup.object().shape({
  fullName: yup
    .string()
    .required("Full name is required")
    .matches(/^[a-zA-Z\s]+$/, "Only alphabets and spaces are allowed"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(10, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  address: yup.string().required("Address is required"),
  message: yup
    .string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
});

export function ModernContactForm({ onSubmit }: ModernContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await contactFormSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setIsSubmitting(true);

      const response = await ContactService.submitContactForm({
        ...formData,
        phone: `+91${formData.phone}`,
      });

      if (response.success) {
        toast.success("Message Sent!", {
          description:
            "We've received your message and will get back to you soon.",
        });

        onSubmit?.(formData);

        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          message: "",
        });
      } else {
        toast.error("Submission Failed", {
          description:
            response.message ||
            "Failed to send message. Please try again later.",
        });
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: Partial<ContactFormData> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path as keyof ContactFormData] = err.message;
          }
        });
        setErrors(validationErrors);

        if (error.inner.length > 0) {
          toast.error("Validation Error", {
            description: error.inner[0].message,
          });
        }
      } else {
        console.error("Submission error:", error);
        toast.error("Submission Failed", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      const truncatedValue = digitsOnly.slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: truncatedValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const RequiredLabel = ({ name, label }: { name: string; label: string }) => (
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-5 min-h-[400px]">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-6 lg:p-8 text-gray-300 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-20 h-20 border-2 border-gray-600 rounded-full"></div>
          <div className="absolute top-6 right-6 w-16 h-16 border-2 border-gray-700 rounded-full"></div>

          <div className="relative z-10 h-full flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 text-white">
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
                    career@ralithontechnologies.in
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
                    +91 7999751661
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
                  Indore, Madhya Pradesh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 p-6 lg:p-8 bg-gray-50">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              We'd love to hear from you!
            </h3>
            <p className="text-lg text-gray-600 mb-6">Let's get in touch</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <RequiredLabel name="fullName" label="Full Name" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.fullName ? "border-red-500" : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                    placeholder="Enter your full name"
                    style={{ fontSize: "13px" }}
                  />
                  {errors.fullName && (
                    <p
                      className="mt-1 text-red-600"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <RequiredLabel name="phone" label="Phone number" />
                  <div className="flex">
                    <div className="px-3 py-2 border border-gray-200 rounded-l-lg bg-gray-100 text-sm flex items-center">
                      +91
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      className={`flex-1 px-3 py-2 border ${
                        errors.phone ? "border-red-500" : "border-gray-200"
                      } border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                      placeholder="Enter your phone"
                      style={{ fontSize: "13px" }}
                    />
                  </div>
                  {errors.phone && (
                    <p
                      className="mt-1 text-red-600"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <RequiredLabel name="email" label="Email" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3 py-2 border ${
                        errors.email ? "border-red-500" : "border-gray-200"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                      placeholder="abc@example.com"
                      style={{ fontSize: "13px" }}
                    />
                  </div>
                  {errors.email && (
                    <p
                      className="mt-1 text-red-600"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <RequiredLabel name="address" label="Address" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.address ? "border-red-500" : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                    placeholder="Enter your address"
                    style={{ fontSize: "13px" }}
                  />
                  {errors.address && (
                    <p
                      className="mt-1 text-red-600"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <RequiredLabel name="message" label="Your Message" />
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.message ? "border-red-500" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none`}
                  placeholder="How can we help you?"
                  style={{ fontSize: "13px" }}
                />
                {errors.message && (
                  <p className="mt-1 text-red-600" style={{ fontSize: "12px" }}>
                    {errors.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-900 text-white px-6 py-2 rounded-lg font-medium items-center space-x-2 transition-all duration-200 text-sm"
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
