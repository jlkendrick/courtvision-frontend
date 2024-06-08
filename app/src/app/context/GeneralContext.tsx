"use client";
import { createContext, useContext, useState } from "react";

const GeneralContext = createContext({
  page: "home",
  setPage: (page: string) => {},
});

export const GeneralProvider = ({ children }: { children: React.ReactNode }) => {
  const [page, setPage] = useState("home");

  return (
    <GeneralContext.Provider value={{ page, setPage }}>
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneral = () => useContext(GeneralContext);
