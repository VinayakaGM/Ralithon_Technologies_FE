import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/context/SessionContext";
import SessionExpiredModal from "@/components/SessionExpiredModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ralithon Technologies",
  description: "Your Trusted IT Solutions Partner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <SessionExpiredModal />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
