import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { AuthProvider } from "@/store/auth-context";
import { ThemeProvider } from "@/store/theme-context";
import { MSWProvider } from "@/mocks/MSWProvider";
import "./globals.css";

const displayFont = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bodyFont = Inter({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Breezy",
  description: "Des idées légères, partagées en 280 caractères.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-svh bg-bg text-text font-sans antialiased">
        <MSWProvider>
          <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
