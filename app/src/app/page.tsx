'use client';

import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  Plus,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import YourTeam from "@/components/views/YourTeamDashView";
import Home from "@/components/views/HomeDashView";
import LineupGeneration from "@/components/views/LineupGenerationDashView";

import { ModeToggle } from "@/components/ui/toggle-mode";
import { Sansita_Swashed } from "next/font/google";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AccountDrawer from "@/components/AccountDrawer";

const sansita_swashed = Sansita_Swashed({
  weight: "600",
  subsets: ["latin-ext"],
});

export default function Dashboard() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);

  const handlePageChange = (page: string) => {
    setPage(page);
  };

  return (
    <>
      <Head>
        <title>Court Visionaries - Dashboard</title>
        <meta
          name="description"
          content="Court Visionaries provides advanced tools to help you win your fantasy basketball league."
        />
        <meta
          name="keywords"
          content="fantasy basketball, fantasy sports, lineup optimization, fantasy streaming, fantasy dashboard"
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>

      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[200px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2 items-center">
            <div className="flex h-14 items-center border-b px-4 md:h-[120px] lg:h-[120px]">
              <Image src="/logo.png" alt="Logo" width={100} height={100} />
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
                    page === "home" ? "text-primary" : ""
                  }`}
                  onClick={() => setPage("home")}
                >
                  <Plus className="h-4 w-4" />
                  Home
                </div>
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
                    page === "your-team" ? "text-primary" : ""
                  }`}
                  onClick={() => setPage("your-team")}
                >
                  <Plus className="h-4 w-4" />
                  Your Teams
                </div>
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
                    page === "lineup-generation" ? "text-primary" : ""
                  }`}
                  onClick={() => setPage("lineup-generation")}
                >
                  <Plus className="h-4 w-4" />
                  Lineup Generation
                </div>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all"
                >
                  <Plus className="h-4 w-4" />
                  More Coming Soon
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center border-b bg-muted/40 px-4 md:h-[120px] lg:h-[120px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-1/2">
                <div className="flex flex-row gap-2 px-4 py-2">
                  { !loggedIn && 
                  <AccountDrawer />}
                  { loggedIn && 
                  <Select>
                    <SelectTrigger className="w-[170px] hover:border-primary">
                      <SelectValue placeholder="Sign in or Create Account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Your Teams</SelectLabel>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="banana">Banana</SelectItem>
                        <SelectItem value="blueberry">Blueberry</SelectItem>
                        <SelectItem value="grapes">Grapes</SelectItem>
                        <SelectItem value="pineapple">Pineapple</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>}
                </div>
                <nav className="grid gap-2 text-lg font-medium">
                  <SheetTrigger asChild>
                    <div
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
                        page === "home" ? "text-primary" : ""
                      }`}
                      onClick={() => setPage("home")}
                    >
                      <Plus className="h-4 w-4" />
                      Home
                    </div>
                  </SheetTrigger>
                  <SheetTrigger asChild>
                    <div
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
                        page === "your-team" ? "text-primary" : ""
                      }`}
                      onClick={() => setPage("your-team")}
                    >
                      <Plus className="h-4 w-4" />
                      Your Teams
                    </div>
                  </SheetTrigger>
                  <SheetTrigger asChild>
                    <div
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
                        page === "streaming-optimization" ? "text-primary" : ""
                      }`}
                      onClick={() => setPage("streaming-optimization")}
                    >
                      <Plus className="h-4 w-4" />
                      Lineup Generation
                    </div>
                  </SheetTrigger>
                  <Link
                    href="#"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    More Coming Soon
                  </Link>
                </nav>
                <div className="mt-auto flex">
                  <ModeToggle />
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex w-full justify-between items-center">
              <div
                className={`text-4xl md:text-5xl lg:text-6xl w-full text-center font-bold pb-3 ${sansita_swashed.className}`}
              >
                Court Visionaries
              </div>

              <div className="hidden md:flex">
                { !loggedIn &&
                <AccountDrawer />}
                { loggedIn && 
                <Select>
                  <SelectTrigger className="w-[190px] text-xs hover:border-primary">
                    <SelectValue placeholder="Select a Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Your Teams</SelectLabel>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="blueberry">Blueberry</SelectItem>
                      <SelectItem value="grapes">Grapes</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>}
                <ModeToggle />
              </div>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {page === "home" && <Home onPageChange={handlePageChange} />}
            {page === "your-team" && <YourTeam />}
            {page === "lineup-generation" && <LineupGeneration />}
          </main>
        </div>
      </div>
    </>
  );
}
