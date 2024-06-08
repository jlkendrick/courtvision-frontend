"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const AuthContext = createContext({
  isLoggedIn: false,
	setIsLoggedIn: (isLoggedIn: boolean) => {},
  login: (email: string, password: string, confirmPassword: string) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
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
          body: JSON.stringify({ email, password }),
        });

				if (!response.ok) {
					throw new Error("Failed to create account.");
				}
				const data = await response.json();
				if (data.already_exists) {
					// Account already exists
					toast.error("An account with this email already exists.");
				} else {
					// Account created successfully
					toast.success("Account created successfully.");
					const { access_token } = data;
					localStorage.setItem("token", access_token);
					setIsLoggedIn(true);
				}

			} catch (error) {
				toast.error("Internal server error. Please try again later.");
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
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          throw new Error("Failed to login.");
        }
        const data = await response.json();
        console.log(data);

        if (data.success) {
          // Login successful
          const { access_token } = data;
          localStorage.setItem("token", access_token);
          setIsLoggedIn(true);

          toast.success("Logged in successfully.");
        } else {
          // Login failed
          toast.error("Incorrect email or password. Please try again.");
        }
      } catch (error) {
        toast.error("Internal server error. Please try again later.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
