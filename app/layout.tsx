import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApplyPro - AI-Powered Resume Tailoring",
  description:
    "Land your dream job with AI-tailored resumes. Beat ATS systems, get 85%+ match scores, and transform your resume in minutes. One-time payment of $4.99.",
  keywords: [
    "resume tailoring",
    "AI resume",
    "ATS optimization",
    "job application",
    "cover letter",
    "resume builder",
  ],
  authors: [{ name: "ApplyPro" }],
  openGraph: {
    title: "ApplyPro - AI-Powered Resume Tailoring",
    description:
      "Transform your resume with AI and land your dream job. $4.99 one-time payment.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-grow pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
