import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DoshaCard from "@/components/discover/DoshaCard";
import { ChevronLeft } from "lucide-react";
import { savePersonalization } from "@/utils/personalizationStorage";
import { API_BASE_URL } from "@/config/api";
import { useTranslation } from "react-i18next";

export const DoshaSelectPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    navigate("/discover");
  };

  const handleDoshaSelect = async (dosha) => {
    const userId = localStorage.getItem("userId");
    const selectedDosha = dosha.toLowerCase();

    try {
      if (userId) {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/auth/dosha`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dosha: selectedDosha }),
        });
      }
    } catch (error) {
      console.error("Failed to sync Dosha to server:", error);
    }

    localStorage.setItem("marinZenUserDosha", selectedDosha);
    savePersonalization({
      mode: "manual",
      dominantDosha: dosha,
      scores: { vata: null, pitta: null, kapha: null },
    });
    navigate("/dashboard");
  };

  const doshaOptions = [
    { dosha: "vata", label: "Vata", icon: "🌬️", colorClass: "bg-violet-900/40 text-violet-400" },
    { dosha: "pitta", label: "Pitta", icon: "🔥", colorClass: "bg-orange-900/40 text-orange-400" },
    { dosha: "kapha", label: "Kapha", icon: "🌿", colorClass: "bg-teal-900/40 text-teal-400" },
    { dosha: "vata+pitta", label: "Vata+Pitta", icon: "🌪️", colorClass: "bg-fuchsia-900/40 text-fuchsia-400" },
    { dosha: "pitta+kapha", label: "Pitta+Kapha", icon: "🌋", colorClass: "bg-amber-900/40 text-amber-400" },
    { dosha: "vata+kapha", label: "Vata+Kapha", icon: "🌊", colorClass: "bg-indigo-900/40 text-indigo-400" },
  ];

  return (
    <main className="min-h-screen px-4 py-16 sm:py-24 flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden w-full">
      <div className="pointer-events-none absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-teal-900/10 blur-3xl opacity-50" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-orange-900/10 blur-3xl opacity-40" />

      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("discover.back", "Back")}
        </Button>
      </div>

      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        <div className="mb-10 sm:mb-14 text-center px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500 mb-3 sm:mb-4 tracking-tight">
            {t("discover.select_title", "Select Your Profile")}
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
            {t(
              "discover.select_subtitle",
              "Choose your dominant dosha or dual-dosha to begin.",
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full px-2 sm:px-4">
          {doshaOptions.map((opt) => (
            <DoshaCard
              key={opt.dosha}
              dosha={opt.dosha}
              label={t(`discover.dosha_${opt.dosha.replace("+", "_")}`, opt.label)}
              icon={opt.icon}
              colorClass={opt.colorClass}
              onClick={handleDoshaSelect}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default DoshaSelectPage;
