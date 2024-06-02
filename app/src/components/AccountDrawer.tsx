'use client';

import UserLoginOrCreate from "./UserLoginOrCreate";
import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function AccountDrawer({ setIsLoggedIn, loginErrors, setLoginErrors } : 
  { setIsLoggedIn: (isLoggedIn: boolean) => void, 
    loginErrors: { incorrectLoginInfo: boolean, 
                   emailInUse: boolean, 
                   notMatchingPasswords: boolean }, 
    setLoginErrors: (loginErrors: { incorrectLoginInfo: boolean, emailInUse: boolean, notMatchingPasswords: boolean }) => void }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration check to ensure the drawer trigger button matches between server and client
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [isDrawerOpen]);
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email, password, confirmPassword);

    // Create account
    if (confirmPassword) {
      try {
        if (password !== confirmPassword) {
          setLoginErrors({ ...loginErrors, notMatchingPasswords: true });
          return;
        }
        // API call to create account
        const response = await fetch("/api/users/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password })
        })
        if (!response.ok) {
          throw new Error("Failed to create account.");
        }
        const data = await response.json();
        console.log(data);

        // Set logged in state
        if (!data.already_exists) {
          setIsLoggedIn(true);
          setIsDrawerOpen(false);

        } else {
          // Account already exists
          console.log("Account already exists.");
          setLoginErrors({ ...loginErrors, emailInUse: true });
        }

      } catch (error) {
        console.error(error);
      }

    } else {
      // Login to account
      try {
        // API call to login
        const response = await fetch("/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password })
        })
        if (!response.ok) {
          throw new Error("Failed to login.");
        }
        const data = await response.json();
        console.log(data);

        if (data.success) {
          setIsLoggedIn(true);
          setIsDrawerOpen(false);
        } else {
          // Login failed
          console.log("Login failed.");
          setLoginErrors({ ...loginErrors, incorrectLoginInfo: true });
        }

      } catch (error) {
        console.error(error);
      }
    }
  }

  if (!isHydrated) {
    return null;
  }

  return (
    <Drawer onOpenChange={setIsDrawerOpen} isOpen={isDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="mr-2 hover:border-primary">
          Sign In
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form onSubmit={handleFormSubmit}>
          <UserLoginOrCreate
            setEmail={setEmail}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}

          />
          <DrawerFooter>
            <Button type="submit">Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
