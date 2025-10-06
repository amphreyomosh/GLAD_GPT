import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GLAD GPT",
  description: "AI chat app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
