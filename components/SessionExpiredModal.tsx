// components/session-modal.tsx
"use client";

import { useSession } from "@/context/SessionContext";
import { useEffect } from "react";

export default function SessionExpiredModal() {
  const { sessionExpired, dismissExpired, logout } = useSession();

  useEffect(() => {
    if (sessionExpired) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [sessionExpired]);

  if (!sessionExpired) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Session Expired</h2>
        <p className="mb-6">Your session has expired. Please log in again.</p>
        <div className="flex justify-end">
          <button
            onClick={() => {
              dismissExpired();
              logout();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
