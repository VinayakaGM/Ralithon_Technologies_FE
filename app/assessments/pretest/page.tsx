"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/ui/auth-modal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import usersService from "@/services/users.service";
import { toast } from "sonner";

export default function PreTestPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [activeSection, setActiveSection] = useState("tests");
  const [isStarting, setIsStarting] = useState(false);

  const MAX_ATTEMPTS = 2;

  const loadUserAttempts = async (userId: number) => {
    try {
      const res = await usersService.getUserById(userId);
      if (res?.success && typeof res.data.examAttempt === "number") {
        const rawCount = res.data.examAttempt;
        const allowed = rawCount > MAX_ATTEMPTS ? MAX_ATTEMPTS : rawCount;
        setRemainingAttempts(allowed);
      } else {
        setRemainingAttempts(0);
      }
    } catch (err) {
      console.log("Failed to fetch attempts", err);
      setRemainingAttempts(0);
    }
  };

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user ?? null);
    if (user?.userId) loadUserAttempts(user.userId);
  }, []);

  const handleAuthSuccess = () => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user ?? null);
    if (user?.userId) loadUserAttempts(user.userId);
    setShowAuthModal(false);
  };

  const incrementAttemptAndStart = async () => {
    if (!currentUser) {
      openAuthModal("signin");
      return;
    }

    if (remainingAttempts <= 0) return;

    setIsStarting(true);
    try {
      // Call attemptTest which returns the assessment data
      const response = await usersService.attemptTest(currentUser.userId);

      if (response?.success && response.data) {
        // Deduct attempt count
        setRemainingAttempts((prev) => prev - 1);

        // Prepare assessment data with assessmentId
        const assessmentData = {
          assessment: response.data.assessment || [],
          assessmentId: response.data.assessmentId || 0,
          attemptId: response.data.attemptId,
          userId: currentUser.userId
        };

        // Validate that we have assessmentId
        if (!assessmentData.assessmentId) {
          toast.error("Assessment ID is missing from response");
          console.error("Response data:", response.data);
          return;
        }
        sessionStorage.setItem('assessmentData', JSON.stringify(assessmentData));
        router.push("/assessments/take");
      } else {
        toast.error(response?.message || "Failed to start assessment");
      }
    } catch (error) {
      console.error("Failed to start test", error);
      toast.error("Failed to start assessment. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleToggleAuthMode = (newMode: "signin" | "signup") => {
    setAuthMode(newMode);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setShowAuthModal={setShowAuthModal}
        setAuthMode={setAuthMode}
        scrollToSection={scrollToSection}
      />

      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="md:flex gap-10">
              <div className="flex-1 text-sm text-gray-700">
                <h1 className="text-xl font-semibold mb-4 text-red-600 tracking-wide">
                  IMPORTANT INSTRUCTIONS
                </h1>

                <ul className="list-disc pl-5 leading-relaxed space-y-1">
                  <li>Objective (MCQ) online test</li>
                  <li>Duration: 30–45 minutes</li>
                  <li>Timer continues after start</li>
                  <li>Do not refresh or close the browser</li>
                  <li>Switching tabs may auto-submit</li>
                  <li>Attempt will be deducted once you click start</li>
                  <li>Scores will be shown after submission</li>
                </ul>

                {!currentUser && (
                  <div className="mt-4 p-3 rounded bg-blue-50 border-l-4 border-blue-600 text-blue-900 text-xs">
                    Login required to start the test
                  </div>
                )}
              </div>

              <aside className="w-full md:w-72 border-l md:pl-6 mt-8 md:mt-0">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Attempts
                </h4>

                <div className="p-4 bg-blue-50 rounded-md border border-blue-100 text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600">
                    {MAX_ATTEMPTS}
                  </div>
                  <div className="text-sm text-gray-600">Total Allowed</div>
                </div>

                {!currentUser ? (
                  <>
                    <Button
                      onClick={() => openAuthModal("signin")}
                      className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                    >
                      Sign in to Start
                    </Button>
                  </>
                ) : remainingAttempts > 0 ? (
                  <>
                    <Button
                      onClick={incrementAttemptAndStart}
                      disabled={isStarting}
                      className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
                    >
                      {isStarting ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⏳</span>
                          Starting...
                        </>
                      ) : (
                        `Start Test (${remainingAttempts} left)`
                      )}
                    </Button>

                    <Link
                      href="/assessments/result"
                      className="block w-full text-center text-sm text-blue-600 hover:underline"
                    >
                      View previous results
                    </Link>
                  </>
                ) : (
                  <>
                    <Button disabled className="w-full mb-3 bg-gray-300 text-gray-700">
                      No Attempts Left
                    </Button>
                    <Link
                      href="/contact"
                      className="block w-full text-center text-sm text-indigo-700 bg-indigo-50 py-2 rounded hover:bg-indigo-100"
                    >
                      Contact Admin
                    </Link>
                  </>
                )}
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        scrollToSection={scrollToSection}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onAuthSuccess={handleAuthSuccess}
        onModeChange={handleToggleAuthMode}
      />
    </div>
  );
}