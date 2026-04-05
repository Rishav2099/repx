import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "@/lib/SessionProvider";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/lib/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ======== Viewport Config (Mobile & PWA) ========
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents auto-zoom on mobile inputs
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

// ======== SEO Metadata ========
export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"), // TODO: Replace with your actual deployed URL
  title: {
    default: "Repx - Your Ultimate Fitness Companion",
    template: "%s | Repx", // This makes child pages automatically output "Page Name | Repx"
  },
  description:
    "Track your workouts, build custom routines, analyze your progress, and challenge friends to fitness duels with Repx.",
  keywords: [
    "fitness",
    "workout tracker",
    "gym",
    "social fitness",
    "exercise log",
    "fitness challenges",
    "repx",
  ],
  authors: [{ name: "Repx Team" }],
  creator: "Repx",
  publisher: "Repx",
  openGraph: {
    title: "Repx - Your Ultimate Fitness Companion",
    description:
      "Track your workouts, build custom routines, analyze your progress, and challenge friends to fitness duels.",
    url: "https://your-domain.com", // TODO: Replace
    siteName: "Repx",
    images: [
      {
        url: "/og-image.png", // TODO: Add a 1200x630px promo image to your /public folder
        width: 1200,
        height: 630,
        alt: "Repx Fitness App Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Repx - Your Ultimate Fitness Companion",
    description:
      "Track your workouts, build custom routines, and challenge friends to fitness duels.",
    images: ["/og-image.png"], // Matches the OG image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <div className="min-h-dvh flex flex-col">
                <main className="flex-1 pb-20">{children}</main>
                <div className="fixed bottom-0 w-full z-50">
                  <Navbar />
                </div>
              </div>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}