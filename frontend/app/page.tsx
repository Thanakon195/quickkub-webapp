"use client";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";
import ThemedBody from "./components/ThemedBody";

export default function Home() {
  const { t } = useTranslation();
  return (
    <ThemedBody>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <LanguageSwitcher />
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4">{t("welcome")}</h1>
        <div className="flex gap-4 mt-8">
          <a href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">{t("dashboard")}</a>
          <a href="/pricing" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition">{t("pricing")}</a>
          <a href="/features" className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-cyan-700 transition">{t("features")}</a>
          <a href="/about" className="bg-gray-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-700 transition">{t("about")}</a>
          <a href="/contact" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition">{t("contact")}</a>
          <a href="/settings" className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition">{t("settings")}</a>
        </div>
      </main>
    </ThemedBody>
  );
}
