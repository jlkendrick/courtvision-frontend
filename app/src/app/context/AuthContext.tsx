"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
	setIsLoggedIn: (isLoggedIn: boolean) => {},
  authEmail: "",
  loading: true,
  setLoading: (loading: boolean) => {},
  setAuthEmail: (email: string) => {},
  page: "home",
  setPage: (page: string) => {},
  login: (email: string, password: string, confirmPassword: string) => {},
  logout: () => {},
});

interface JwtPaylaod {
  sub: number;
  exp: number;
  email: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [page, setPage] = useState("home");

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      const decoded = jwtDecode<JwtPaylaod>(token);
      const exp = decoded.exp;
      const currentTime = Date.now() / 1000;
      if (exp < currentTime) {
        console.log("Token expired");
        logout();
        return;
      }
      console.log("Token found");
      setIsLoggedIn(true);
      setToken(token);
      setLoading(false);

      setAuthEmail(decoded.email);
    } else {
      setLoading(false)
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
					const decoded = jwtDecode<JwtPaylaod>(access_token);
          setAuthEmail(decoded.email);

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

        if (data.success) {
          // Login successful
          const { access_token } = data;
          localStorage.setItem("token", access_token);
          const decoded = jwtDecode<JwtPaylaod>(access_token);
          setAuthEmail(decoded.email);

          setIsLoggedIn(true);

          toast.success("Logged in successfully.");
        } else {
          // Login failed
          toast.error("Incorrect email or password. Please try again.");
        }
      } catch (error) {
        console.log(error);
        toast.error("Internal server error. Please try again later.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, setIsLoggedIn, loading, setLoading, authEmail, setAuthEmail, page, setPage, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
