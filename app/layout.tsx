import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relathon Technologies",
  description: "Created by Relathon Technologies",
  generator: "Relathon Technologies",
};

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={`${IMAGE_URL}logo.png`} type="image/png" />
        <title>Relathon Technologies</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
