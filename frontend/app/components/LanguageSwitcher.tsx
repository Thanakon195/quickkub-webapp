"use client";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => i18n.changeLanguage("th")}>TH</button>
      <button onClick={() => i18n.changeLanguage("en")}>EN</button>
    </div>
  );
}