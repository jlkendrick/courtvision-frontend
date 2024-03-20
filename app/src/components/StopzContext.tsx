"use client";
import { createContext, useContext, useState } from "react";

const StopzContext = createContext({
    threshold: "",
    week: "",
    setThreshold: (threshold: string) => {},
    setWeek: (week: string) => {},
});

export function useStopz() {
    return useContext(StopzContext);
}

export function StopzProvider ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [threshold, setThreshold] = useState("");
    const [week, setWeek] = useState("");

    return (
        <StopzContext.Provider
            value={{
                threshold,
                week,
                setThreshold,
                setWeek,
            }}
        >
            {children}
        </StopzContext.Provider>
    );
}
