import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReadAloud — Interactive Text-to-Speech Dictation",
  description:
    "Paste your script, chunk it into word sets, and control playback for note-taking and studying. Spotify-inspired dictation experience.",
  keywords: ["text-to-speech", "dictation", "studying", "note-taking", "speech synthesis"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f5f5f5] antialiased">
        {children}
      </body>
    </html>
  );
}
