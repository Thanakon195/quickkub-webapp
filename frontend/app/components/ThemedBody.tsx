"use client";
import { useSettings } from "../settings-context";

export default function ThemedBody({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  return (
    <body
      className="font-sans antialiased"
      style={{
        background: settings.primaryColor + "10",
        fontFamily: settings.font,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 16, padding: 24 }}>
        {settings.logo && <img src={settings.logo} alt="logo" style={{ height: 40 }} />}
        <span style={{ fontWeight: 800, fontSize: 28, color: settings.primaryColor }}>{settings.siteTitle}</span>
      </header>
      {children}
    </body>
  );
}
