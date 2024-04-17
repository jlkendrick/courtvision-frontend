import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LeagueProvider } from "@/components/LeagueContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Court Visionaries",
  description: "Advanced tools to help you win your fantasy basketball league",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Court Visionaries</title>
        <meta name="description" content="Court Visionaries provides advanced tools to help you win your fantasy basketball league." />
        <meta name="keywords" content="fantasy basketball, fantasy sports, lineup optimization, fantasy streaming" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <LeagueProvider><ThemeProvider attribute="class" defaultTheme="dark">{children}</ThemeProvider></LeagueProvider>
      </body>
    </html>
  );
}
