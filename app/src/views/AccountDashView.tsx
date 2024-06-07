import { useState } from "react";
import { toast } from "sonner"

import UserLoginOrCreate from "@/components/UserLoginOrCreate";

import { Button } from "@/components/ui/button";

export default function Account({ setIsLoggedIn } : { setIsLoggedIn: (isLoggedIn: boolean) => void } ) {
	
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email, password, confirmPassword);

    // Create account
    if (confirmPassword) {
      try {
        if (password !== confirmPassword) {
          // Passwords do not match
          toast.error("Passwords do not match. Please try again.");
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

        // Set logged in state
        if (!data.already_exists) {
          setIsLoggedIn(true);

        } else {
          // Account already exists
          toast.error("Email already in use. Please login.");
        }

      } catch (error) {
        toast.error("Internal server error. Please try again later.")
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
        } else {
          // Login failed
          toast.error("Incorrect email or password. Please try again.");
        }

      } catch (error) {
        toast.error("Internal server error. Please try again later.")
      }
    }
  }

  return (
    <>
      <div className="flex-col items-center">
        <UserLoginOrCreate
          setEmail={setEmail}
          setPassword={setPassword}
          setConfirmPassword={setConfirmPassword}
        />
        <div className="flex mt-2 justify-center">
          <Button
						className="w-full max-w-md"
            onClick={handleFormSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
}
