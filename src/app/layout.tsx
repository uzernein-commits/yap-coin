import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const description =
  "Not a meme. A whole movement. A frog with a mic, a chat that stays open, and no live token.";

export const metadata: Metadata = {
  metadataBase: new URL("https://yap-coin-tau.vercel.app"),
  title: {
    default: "$YAP",
    template: "%s · $YAP",
  },
  description,
  applicationName: "$YAP",
  openGraph: {
    title: "$YAP — Not a meme. A whole movement.",
    description,
    type: "website",
    url: "/",
    siteName: "$YAP",
    locale: "en_US",
    images: [
      {
        url: "/yap-frog.jpg",
        width: 784,
        height: 1013,
        alt: "Hooded $YAP frog holding a microphone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "$YAP — Not a meme. A whole movement.",
    description,
    images: ["/yap-frog.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050308",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
