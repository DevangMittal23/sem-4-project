import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/lib/profileContext";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Career Mentor",
  description: "Find your perfect career path with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#050508] text-white antialiased">
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
