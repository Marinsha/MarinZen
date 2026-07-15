import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "ta" : "en";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("marinZenLang", nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 bg-white/60 dark:bg-stone-800/60 backdrop-blur-md border border-stone-200 dark:border-stone-700 px-4 py-2 rounded-full text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 transition-all font-medium text-sm shadow-sm"
    >
      <Globe className="w-4 h-4" />
      <span>{i18n.language === "ta" ? "English" : "தமிழ்"}</span>
    </button>
  );
}
