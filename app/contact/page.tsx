"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/ui/auth-modal";
import {
    Mail,
    Phone,
    MapPin,
    Send,
    Clock,
    MessageCircle,
    Globe,
    Building,
    Users
} from "lucide-react";
import { toast } from "sonner";
import * as yup from "yup";
import ContactService from "@/services/contact.service";

interface ContactFormData {
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
        .required("Email is required")
        .matches(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address (e.g., user@example.com)"
        ),
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

export default function ContactPage() {
    const [activeSection, setActiveSection] = useState("contact");
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
    const [formData, setFormData] = useState<ContactFormData>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<ContactFormData>>({});

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offsetTop = element.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth",
            });
        }
    };

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
                toast.success("Message Sent Successfully!", {
                    description: `Thank you ${formData.fullName}! We'll get back to you within 24 hours.`,
                });

                setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    address: "",
                    message: "",
                });
            } else {
                toast.error("Submission Failed", {
                    description: response.message || "Failed to send message. Please try again later.",
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
            
            if (errors.phone) {
                setErrors((prev) => ({ ...prev, phone: undefined }));
            }
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
            className="block text-sm font-medium text-slate-700 mb-2"
        >
            {label} <span className="text-red-500">*</span>
        </label>
    );

    const contactInfo = [
        {
            icon: <Mail className="h-6 w-6" />,
            title: "Email Us",
            description: "Send us an email anytime",
            details: "career@ralithontechnologies.in",
            link: "mailto:career@ralithontechnologies.in",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Phone className="h-6 w-6" />,
            title: "Call Us",
            description: "Mon to Fri from 10am to 8pm",
            details: "+91 7999751661",
            link: "tel:+917999751661",
            color: "from-green-500 to-emerald-500"
        },
        // {
        //     icon: <MapPin className="h-6 w-6" />,
        //     title: "Visit Us",
        //     description: "Come say hello at our office",
        //     details: "Indore, Madhya Pradesh",
        //     link: "https://maps.google.com/?q=Indore,Madhya+Pradesh",
        //     color: "from-purple-500 to-pink-500"
        // }
    ];

    const companyInfo = [
        {
            icon: <Building className="h-5 w-5" />,
            title: "Company",
            description: "Ralithon Technologies"
        },
        {
            icon: <Globe className="h-5 w-5" />,
            title: "Industry",
            description: "IT Services & Consulting"
        },
        {
            icon: <Users className="h-5 w-5" />,
            title: "Team Size",
            description: "10-50 Employees"
        },
        {
            icon: <Clock className="h-5 w-5" />,
            title: "Response Time",
            description: "Within 24 Hours"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                setShowAuthModal={setShowAuthModal}
                setAuthMode={setAuthMode}
                scrollToSection={scrollToSection}
            />

            {/* Hero Section */}
            <section className="pt-16 pb-18 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full -translate-y-36 translate-x-36"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full translate-y-48 -translate-x-48"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                            Get In <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Touch</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                            We'd love to hear from you. Let's start a conversation and explore how we can help you achieve your goals.
                        </p>
                        <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto"></div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Ways to Reach Us</h2>
                        <p className="text-gray-600 text-base">
                            Choose the most convenient way to get in touch with our team
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {contactInfo.map((item, index) => (
                            <a
                                key={index}
                                href={item.link}
                                target={item.link.startsWith('http') ? '_blank' : '_self'}
                                rel={item.link.startsWith('http') ? 'noopener noreferrer' : ''}
                                className="group flex items-center gap-5 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                            >
                                <div
                                    className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white text-xl`}
                                >
                                    {item.icon}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-snug">{item.description}</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                                        {item.details}
                                    </p>


                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>


            {/* Visual Divider */}
            <section className="py-8 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Let's Build Your Solution</h3>
                        <p className="text-gray-600">Share your project details and we'll create a customized plan</p>
                    </div>
                </div>
            </section>


            {/* Contact Form Section */}
            <section className="pb-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-5 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                            {/* Left Side - Contact Info */}
                            <div className="lg:col-span-2 bg-gradient-to-br from-slate-700 to-slate-800 p-8 lg:p-12 text-white relative overflow-hidden border-r border-slate-600">
                                <div className="absolute top-4 right-4 w-20 h-20 border-2 border-cyan-400/30 rounded-full"></div>
                                <div className="absolute top-6 right-6 w-16 h-16 border-2 border-blue-400/30 rounded-full"></div>

                                <div className="relative z-10 h-full flex flex-col justify-center">
                                    <h2 className="text-2xl font-bold mb-4 text-white">
                                        Get In Touch
                                    </h2>
                                    <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mb-6"></div>
                                    <p className="text-base lg:text-lg text-slate-200 mb-8 leading-relaxed">
                                        Have a project in mind? Looking for partnership opportunities? Or just want to learn more about our services? We're here to help you succeed.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 p-3 bg-slate-600/30 rounded-lg border border-slate-500/30">
                                            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-400/40">
                                                <Mail className="h-5 w-5 text-cyan-300" />
                                            </div>
                                            <div>
                                                <p className="text-slate-300 text-xs">Email</p>
                                                <p className="text-white font-medium text-sm">
                                                    career@ralithontechnologies.in
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-slate-600/30 rounded-lg border border-slate-500/30">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/40">
                                                <Phone className="h-5 w-5 text-blue-300" />
                                            </div>
                                            <div>
                                                <p className="text-slate-300 text-xs">Phone</p>
                                                <p className="text-white font-medium text-sm">
                                                    +91 7999751661
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-slate-600/30 rounded-lg border border-slate-500/30">
                                            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-400/40">
                                                <MapPin className="h-5 w-5 text-cyan-300" />
                                            </div>
                                            <div>
                                                <p className="text-slate-300 text-xs">Location</p>
                                                <p className="text-white font-medium text-sm">
                                                    Indore, Madhya Pradesh
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Form */}
                            <div className="lg:col-span-3 p-8 lg:p-12 bg-white">
                                <div className="max-w-2xl">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                        Send us a message
                                    </h3>
                                    <p className="text-slate-600 mb-6">We'll get back to you within 24 hours</p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <RequiredLabel name="fullName" label="Full Name" />
                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border ${errors.fullName ? "border-red-500" : "border-gray-300"
                                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors`}
                                                    placeholder="Enter your full name"
                                                />
                                                {errors.fullName && (
                                                    <p className="mt-1 text-red-600 text-sm">
                                                        {errors.fullName}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <RequiredLabel name="phone" label="Phone Number" />
                                                <div className="flex">
                                                    <div className="px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-700 text-sm flex items-center font-medium border-r-0">
                                                        +91
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        maxLength={10}
                                                        className={`flex-1 px-4 py-3 border ${errors.phone ? "border-red-500" : "border-gray-300"
                                                            } rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors`}
                                                        placeholder="Enter your phone number"
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="mt-1 text-red-600 text-sm">
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <RequiredLabel name="email" label="Email Address" />
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Mail className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className={`w-full pl-10 pr-4 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"
                                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors`}
                                                        placeholder="your.email@example.com"
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="mt-1 text-red-600 text-sm">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <RequiredLabel name="address" label="Your Address" />
                                                <input
                                                    type="text"
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border ${errors.address ? "border-red-500" : "border-gray-300"
                                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors`}
                                                    placeholder="Enter your complete address"
                                                />
                                                {errors.address && (
                                                    <p className="mt-1 text-red-600 text-sm">
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
                                                rows={5}
                                                value={formData.message}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border ${errors.message ? "border-red-500" : "border-gray-300"
                                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none transition-colors`}
                                                placeholder="Tell us about your project, requirements, or any questions you have..."
                                            />
                                            {errors.message && (
                                                <p className="mt-1 text-red-600 text-sm">
                                                    {errors.message}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 text-lg"
                                            style={{
                                                background: "linear-gradient(270deg, rgb(6 132 190) 0%, rgb(2 116 186) 100%)"
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    <span>Sending your message...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5 mr-2" />
                                                    <span>Send Message</span>
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            {/* <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Us Here</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Visit our office in Indore, Madhya Pradesh
                        </p>
                    </div>

                    <div className="bg-gray-200 rounded-2xl p-8 h-96 flex items-center justify-center">
                        <div className="text-center">
                            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Indore, Madhya Pradesh</h3>
                            <p className="text-gray-600">Our office location</p>
                            <Button
                                className="mt-4 text-white"
                                style={{
                                    background: "linear-gradient(270deg, rgb(6 132 190) 0%, rgb(2 116 186) 100%)"
                                }}
                                onClick={() => window.open('https://maps.google.com/?q=Indore,Madhya+Pradesh', '_blank')}
                            >
                                <MapPin className="h-4 w-4 mr-2" />
                                View on Google Maps
                            </Button>
                        </div>
                    </div>
                </div>
            </section> */}

            <Footer
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                scrollToSection={scrollToSection}
            />

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                mode={authMode}
                onModeChange={(mode) => setAuthMode(mode)}
            />
        </div>
    );
}