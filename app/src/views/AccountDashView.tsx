import { useState } from "react";

import UAuthForm from "@/components/UserLoginOrCreate";
import { useAuth } from "@/app/context/AuthContext";

import { Button } from "@/components/ui/button";

export default function Account() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { isLoggedIn, authEmail, login, logout } = useAuth();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    login(email, password, confirmPassword);
  };

  return (
    <>
      {!isLoggedIn ? (
        <>
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Your Account</h1>
          </div>
          <div className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1">
              <div className="flex-col items-center">
                <UAuthForm
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
            </div>
          </div>
        </>
      ) : (
        <>
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Your Account</h1>
        </div>
        <div className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1">
            <div className="flex-col items-center">
              <div className="flex flex-col gap-1">
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
