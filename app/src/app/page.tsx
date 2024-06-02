"use client";

import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Plus, User } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import YourTeam from "@/components/views/YourTeamDashView";
import Home from "@/components/views/HomeDashView";
import LineupGeneration from "@/components/views/LineupGenerationDashView";
import { ModeToggle } from "@/components/ui/toggle-mode";
import AccountDrawer from "@/components/AccountDrawer";
import { Separator } from "@/components/ui/separator";
import TextGradient from "@/components/ui/text-gradient";

import { Sansita_Swashed } from "next/font/google";
import TeamDropdown from "@/components/TeamDropdown";

const sansita_swashed = Sansita_Swashed({
  weight: "600",
  subsets: ["latin-ext"],
});


export default function Dashboard() {
  // This is the state that keeps track of which page the user is on and what to display
  const [page, setPage] = useState("home");
  
  // This is the state that keeps track of errors when logging in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginErrors, setLoginErrors] = useState({
    incorrectLoginInfo: false,
    emailInUse: false,
    notMatchingPasswords: false,
  })

  useEffect(() => {
    if (isLoggedIn) {
      toast.success("Successfully logged in!");
    } else if (loginErrors.incorrectLoginInfo) {
      toast.error("Incorrect login information. Please try again.");
    } else if (loginErrors.emailInUse) {
      toast.error("Email is already in use. Please try again.");
    } else if (loginErrors.notMatchingPasswords) {
      toast.error("Passwords do not match. Please try again.");
    }
    // Reset the login errors
    setLoginErrors({
      incorrectLoginInfo: false,
      emailInUse: false,
      notMatchingPasswords: false,
    });
  }, [isLoggedIn, loginErrors.incorrectLoginInfo, loginErrors.emailInUse, loginErrors.notMatchingPasswords]);

  // This is the state that is passed to the TeamDropdown to keep track of the selected team and the teams
  const [teamDropdownState, setTeamDropdownState] = useState({
    selectedTeam: "",
    teams: [],
    clickManageTeams: false,
  });

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

            {/* This is the nav bar that pops over on mobile or when the viewport gets small enough */}
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
                  {!isLoggedIn && (
                    <AccountDrawer setIsLoggedIn={setIsLoggedIn} loginErrors={loginErrors} setLoginErrors={setLoginErrors} />
                  )}
                  {isLoggedIn && (
                    <TeamDropdown teamDropdownState={teamDropdownState} setTeamDropdownState={setTeamDropdownState}/>
                  )}
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

            {/* This is the header that is visible when the viewport is at a regular size */}
            <div className="flex w-full justify-between items-center">
              <div
                className={`px-1 text-4xl md:text-5xl lg:text-6xl w-full text-center font-bold pb-3 ${sansita_swashed.className}`}
              >
                <TextGradient text="Court Visionaries" />
              </div>

              <div className="px-2 flex-col gap-1 hidden md:flex">
                <div className="flex gap-1 justify-center">
                  <Button className="hover:border-primary" variant="outline" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                  <ModeToggle />
                </div>
                <Separator className="" />
                {isLoggedIn && <AccountDrawer setIsLoggedIn={setIsLoggedIn} loginErrors={loginErrors} setLoginErrors={setLoginErrors} />}
                {!isLoggedIn && (<TeamDropdown teamDropdownState={teamDropdownState} setTeamDropdownState={setTeamDropdownState} />)}
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
