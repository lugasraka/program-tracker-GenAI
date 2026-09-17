import type { Metadata } from "next";
import { Roboto, Open_Sans } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TIM Program Hub",
  description:
    "GenAI copilot for program synthesis — decisions, actions, risks, dependencies, and exec briefs for the Travel Impact Model program.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${openSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
