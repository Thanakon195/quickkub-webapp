"use client";
import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext({
  settings: {
    primaryColor: "#2563eb",
    font: "Inter",
    logo: "",
    siteTitle: "QuickKub Payment Gateway"
  },
  setSettings: (_: any) => {}
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState({
    primaryColor: "#2563eb",
    font: "Inter",
    logo: "",
    siteTitle: "QuickKub Payment Gateway"
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
