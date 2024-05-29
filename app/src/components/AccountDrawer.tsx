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

export default function AccountDrawer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email, password, confirmPassword);
    // Perform additional form submission logic here
  }

  // Hydration check to ensure the drawer trigger button matches between server and client
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null; // or a loading spinner, or a placeholder element
  }

  return (
    <Drawer>
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
