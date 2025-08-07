"use client";

import type React from "react";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <>
      <style jsx global>{`
        [data-sonner-toast][data-type="success"] {
          background-color: #95ebb4 !important;
          color: white !important;
          border: none !important;
        }
        [data-sonner-toast][data-type="error"] {
          background-color: #c42d2d !important;
          color: white !important;
          border: none !important;
        }
        [data-sonner-toast][data-type="info"] {
          background-color: #2563eb !important;
          color: white !important;
          border: none !important;
        }
        [data-sonner-toast][data-type="warning"] {
          background-color: #f59e0b !important;
          color: white !important;
          border: none !important;
        }
        [data-sonner-toast] [data-description] {
          color: rgba(255, 255, 255, 0.9) !important;
        }
        [data-sonner-toast][data-type="default"] [data-description] {
          color: #6b7280 !important;
        }
        [data-sonner-toast] [data-close-button] {
          position: absolute !important;
          top: 8px !important;
          right: 8px !important;
          background-color: #ef4444 !important;
          color: white !important;
          border: none !important;
          border-radius: 50% !important;
          width: 20px !important;
          height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 12px !important;
          font-weight: bold !important;
          cursor: pointer !important;
          z-index: 10 !important;
        }
        [data-sonner-toast] [data-close-button]:hover {
          background-color: #dc2626 !important;
          transform: scale(1.1) !important;
        }
        [data-sonner-toast] {
          padding-right: 40px !important;
          position: relative !important;
        }
      `}</style>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        position="top-right"
        expand={false}
        visibleToasts={1}
        richColors={false}
        closeButton={true}
        duration={1000}
        toastOptions={{
          style: {},
          className: "",
          descriptionClassName: "",
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };
