"use client";
import React from "react";

import { useRouter } from "next/navigation";

import UAuthForm from "@/components/UserLoginOrCreate";
import { useAuth } from "@/app/context/AuthContext";

import { Button } from "@/components/ui/button";

export default function Account() {
  const { setEmail, setPassword, isLoggedIn, authEmail, login, logout, sendVerificationEmail } = useAuth();
  const router = useRouter();

  const handleFormSubmit = async (typeSumbit: string, email: string, password: string) => {
    
    setEmail(email);
    setPassword(password);

    // If we are creating an account, we must send an email to verify the account
    if (typeSumbit === "CREATE") {
      
      // Redirect to verify email page and send the verification email
      const success = await sendVerificationEmail(email, password);
      if (!success) {
        return;
      }

      router.push("/account/verify-email?email=" + email);
    } else {
      // If we are logging in, we must call the login function
      login(email, password, "LOGIN");
    }
  };

  return (
    <>
      {!isLoggedIn ? (
        <>
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Your Account</h1>
          </div>
          <div className="flex flex-1 items-start justify-center rounded-lg border border-primary border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1">
              <div className="flex-col items-center">
                <UAuthForm
                  handleFormSubmit={handleFormSubmit}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Your Account</h1>
        </div>
        <div className="flex flex-1 items-start justify-center rounded-lg border border-primary border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1">
            <div className="flex-col items-center">
              <div className="flex flex-col gap-1 mt-5">
                <h3 className="text-2xl font-bold tracking-tight">
                  Welcome, {authEmail}!
                </h3>
                <Button
                  className="w-full max-w-md"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
      )}
    </>
  );
}
