import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/store/auth-context";
import { MSWProvider } from "@/mocks/MSWProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Breezy",
  description: "Ce qui compte, partagé simplement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-canvas text-ink font-sans antialiased">
        <MSWProvider>
          <AuthProvider>{children}</AuthProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
