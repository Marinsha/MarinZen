import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DiscoveryOptionCard from "@/components/discover/DiscoveryOptionCard";
import DoshaCard from "@/components/discover/DoshaCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { savePersonalization } from "@/utils/personalizationStorage";
import { API_BASE_URL } from "@/config/api";
import { useTranslation } from "react-i18next";

export const DiscoverPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    navigate("/auth");
  };


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
          {t("discover.back")}
        </Button>
      </div>

      <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        <div className="mb-10 sm:mb-14 text-center px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500 mb-3 sm:mb-4 tracking-tight">
            {t("discover.main_title", "Discover Your Wellness Path")}
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
            {t(
              "discover.main_subtitle",
              "Choose how you want to begin your personalized Ayurvedic journey.",
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full px-2 sm:px-4">
          <DiscoveryOptionCard
            title={t("discover.opt1_title", "Take the Prakriti Quiz")}
            description={t(
              "discover.opt1_desc",
              "Answer a few guided questions to identify your Ayurvedic body constitution.",
            )}
          >
            <Button
              onClick={() => {
                localStorage.removeItem("prakritiQuizState");
                navigate("/quiz");
              }}
              className="w-full h-auto min-h-[48px] sm:min-h-[56px] py-3 px-4 bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl text-sm sm:text-base md:text-lg font-semibold shadow-lg shadow-teal-900/30 transition-all duration-300 hover:scale-[1.02] border-0 mt-4 group flex items-center justify-center leading-snug"
            >
              <span className="text-center">{t("discover.start_quiz", "Start Quiz")}</span>
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
            </Button>
          </DiscoveryOptionCard>

          <DiscoveryOptionCard
            title={t("discover.opt2_title", "I Already Know My Dosha")}
            description={t(
              "discover.opt2_desc",
              "Select your dosha directly to continue.",
            )}
          >
            <div className="flex justify-center mt-4 w-full">
              <Button
                onClick={() => navigate("/dosha-select")}
                variant="outline"
                className="w-full h-auto min-h-[48px] sm:min-h-[56px] py-3 px-4 border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center text-center leading-snug whitespace-normal"
              >
                {t("discover.select_dosha", "Select Dosha Manually")}
              </Button>
            </div>
          </DiscoveryOptionCard>
        </div>
      </div>
    </main>
  );
};

export default DiscoverPage;
