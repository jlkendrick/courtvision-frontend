// "use client";

// import { useAuth } from "@/app/context/AuthContext";

// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import Head from "next/head";
// import { Menu, Plus, User, Minus } from "lucide-react";
// import Image from "next/image";

// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// import YourTeam from "@/app/pages/YourTeamDashView";
// import Home from "@/app/pages/HomeDashView";
// import LineupGeneration from "@/app/pages/LineupGenerationDashView";
// import Account from "@/app/pages/AccountDashView";
// import ManageTeams from "@/app/pages/ManageTeamsDashView";
// import { SkeletonCard } from "@/pages/LoadingView";

// import { ModeToggle } from "@/components/ui/toggle-mode";
// import { Separator } from "@/components/ui/separator";

// import { Sansita_Swashed } from "next/font/google";
// import { TeamDropdown } from "@/components/ManageTeamsComponents";

// const sansita_swashed = Sansita_Swashed({
//   weight: "600",
//   subsets: ["latin-ext"],
// });

// import React, { ReactNode } from "react";

// export default function Dashboard({ children }: { children: ReactNode }) {
//   const { isLoggedIn, loading } = useAuth();
//   const router = useRouter();

//   return (
//     <>
//       <Head>
//         <title>Court Visionaries - Dashboard</title>
//         <meta
//           name="description"
//           content="Court Visionaries provides advanced tools to help you win your fantasy basketball league."
//         />
//         <meta
//           name="keywords"
//           content="fantasy basketball, fantasy sports, lineup optimization, fantasy streaming, fantasy dashboard"
//         />
//         <link rel="icon" type="image/x-icon" href="/favicon.ico" />
//       </Head>

//       <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[200px_1fr]">
//         <div className="hidden border-r bg-muted/40 md:block">
//           <div className="flex h-full max-h-screen flex-col gap-2 items-center">
//             <div className="flex h-14 items-center border-b px-8 md:h-[120px] lg:h-[120px]">
//               <Image src="/logo.png" alt="Logo" width={100} height={100} />
//             </div>
//             <div className="flex-1">
//               <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
//                 <Link href="/" passHref>
//                   <div
//                     className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
//                       router.pathname === "/" ? "text-primary" : ""
//                     }`}
//                   >
//                     <Plus className="h-4 w-4" />
//                     Home
//                   </div>
//                 </Link>
//                 <Link href="/your-teams" passHref>
//                   <div
//                     className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
//                       router.pathname === "your-team" ? "text-primary" : ""
//                     }`}
//                   >
//                     <Plus className="h-4 w-4" />
//                     Your Teams
//                   </div>
//                 </Link>
//                 <Link href="/lineup-generation" passHref>
//                   <div
//                     className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
//                       router.pathname === "lineup-generation"
//                         ? "text-primary"
//                         : ""
//                     }`}
//                   >
//                     <Plus className="h-4 w-4" />
//                     Lineup Generation
//                   </div>
//                 </Link>
//                 <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer">
//                   <Plus className="h-4 w-4" />
//                   More Coming Soon
//                 </div>
//                 <Separator className="my-2" />
//                 <Link href="/account" passHref>
//                   <div
//                     className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer 
//                     ${router.pathname === "account" ? "text-primary" : ""}`}
//                   >
//                     <Plus className="h-4 w-4" />
//                     Account
//                   </div>
//                 </Link>
//                 <Link href="/manage-teams" passHref>
//                   {(location.pathname === "account" ||
//                     location.pathname === "manage-teams") &&
//                     isLoggedIn && (
//                       <div
//                         className={`flex items-center gap-3 rounded-lg pl-8 text-xs text-muted-foreground transition-all hover:text-primary cursor-pointer 
//                       ${
//                         router.pathname === "manage-teams" ? "text-primary" : ""
//                       }`}
//                       >
//                         <Minus size={10} />
//                         Manage Teams
//                       </div>
//                     )}
//                 </Link>
//               </nav>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col">
//           <header className="flex h-14 items-center border-b bg-muted/40 px-4 md:h-[120px] lg:h-[120px] lg:px-6">
//             {/* This is the nav bar that pops over on mobile or when the viewport gets small enough */}
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="shrink-0 md:hidden"
//                 >
//                   <Menu className="h-5 w-5" />
//                   <span className="sr-only">Toggle navigation menu</span>
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="left" className="flex flex-col w-1/2">
//                 <SheetTrigger asChild>
//                   <Link href="/account" passHref>
//                     <div className="flex flex-row gap-2 px-4 py-2">
//                       {!isLoggedIn && (
//                         <Button
//                           variant="outline"
//                           className="hover:border-primary"
//                         >
//                           Sign In
//                         </Button>
//                       )}
//                       {isLoggedIn && <TeamDropdown />}
//                     </div>
//                   </Link>
//                 </SheetTrigger>
//                 <nav className="grid gap-2 text-[0.9rem] font-medium">
//                   <Link href="/" passHref>
//                     <SheetTrigger asChild>
//                       <div
//                         className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
//                           router.pathname === "home" ? "text-primary" : ""
//                         }`}
//                       >
//                         <Plus className="h-4 w-4" />
//                         Home
//                       </div>
//                     </SheetTrigger>
//                   </Link>
//                   <Link href="/your-team">
//                     <SheetTrigger asChild>
//                       <div
//                         className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
//                           router.pathname === "your-team" ? "text-primary" : ""
//                         }`}
//                       >
//                         <Plus className="h-4 w-4" />
//                         Your Teams
//                       </div>
//                     </SheetTrigger>
//                   </Link>
//                   <Link href="/lineup-generation">
//                     <SheetTrigger asChild>
//                       <div
//                         className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
//                           router.pathname === "lineup-generation"
//                             ? "text-primary"
//                             : ""
//                         }`}
//                       >
//                         <Plus className="h-4 w-4" />
//                         Lineup Generation
//                       </div>
//                     </SheetTrigger>
//                   </Link>
//                   <Separator />
//                   <Link href="/account">
//                     <SheetTrigger asChild>
//                       <div
//                         className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer ${
//                           router.pathname === "account" ? "text-primary" : ""
//                         }`}
//                       >
//                         <Plus className="h-4 w-4" />
//                         Account
//                       </div>
//                     </SheetTrigger>
//                   </Link>
//                   <Link href="/manage-teams">
//                     {isLoggedIn && (
//                       <SheetTrigger asChild>
//                         <div
//                           className={`flex items-center gap-3 rounded-lg pl-8 text-sm text-muted-foreground transition-all hover:text-primary cursor-pointer ${
//                             router.pathname === "manage-teams"
//                               ? "text-primary"
//                               : ""
//                           }`}
//                         >
//                           <Minus size={10} />
//                           Manage Teams
//                         </div>
//                       </SheetTrigger>
//                     )}
//                   </Link>
//                 </nav>
//                 <div className="mt-auto flex">
//                   <ModeToggle />
//                 </div>
//               </SheetContent>
//             </Sheet>

//             {/* This is the header that is visible when the viewport is at a regular size */}
//             <div className="flex w-full items-center">
//               <div
//                 className={`text-4xl ml-[-2%] md:text-5xl lg:text-6xl lg:ml-[7%] w-full text-center font-bold pb-3 ${sansita_swashed.className}`}
//               >
//                 Court Visionaries
//               </div>
//               <div className="px-2 flex-col gap-1 hidden md:flex">
//                 <Link href="/account">
//                   <div className="flex gap-1 justify-center">
//                     <Button
//                       className="hover:border-primary"
//                       variant="outline"
//                       size="icon"
//                     >
//                       <User className="h-5 w-5" />
//                     </Button>
//                     <ModeToggle />
//                   </div>
//                 </Link>
//                 <Separator />
//                 <Link href="/account">
//                   {!isLoggedIn && (
//                     <Button variant="outline" className="hover:border-primary">
//                       Sign In
//                     </Button>
//                   )}
//                 </Link>
//                 {isLoggedIn && <TeamDropdown />}
//               </div>
//             </div>
//           </header>
//           <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
//             {loading && <SkeletonCard />}
//             {!loading && children}
//           </main>
//         </div>
//       </div>
//     </>
//   );
// }
