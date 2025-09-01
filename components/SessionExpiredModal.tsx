"use client";

import { useState } from "react";
import { AuthModal } from "@/components/ui/auth-modal";
import { useRouter } from "next/navigation";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRedirect?: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onClose,
  onLoginRedirect,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/");
    onClose();
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (onLoginRedirect) {
      onLoginRedirect();
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  // Don't render anything if not open and auth modal is also not open
  if (!isOpen && !showAuthModal) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-2">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Session Expired
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your session has expired due to inactivity. Please log in again
                to continue.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                Close
              </button>
              <button
                onClick={handleLoginClick}
                className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex-1"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        mode="signin"
        onAuthSuccess={handleAuthSuccess}
        customMessage="Your session expired. Please sign in to continue."
      />
    </>
  );
};