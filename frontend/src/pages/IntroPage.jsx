import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { INTRO_FEATURES } from "@/constants/introData";
import { GLOBAL_GLOWS } from "@/constants/uiConfig";

export const IntroPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen px-4 py-16 sm:py-20 flex flex-col items-center justify-center relative overflow-x-hidden w-full">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {GLOBAL_GLOWS.intro.map((glow, i) => (
        <div key={i} className={`pointer-events-none ${glow.className}`} />
      ))}

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500 mb-3 sm:mb-4 tracking-tight drop-shadow-sm">
            {t("intro.title")}
          </h1>
          <p className="text-base sm:text-xl md:text-2xl font-medium text-amber-700 dark:text-amber-200/80 tracking-wide uppercase">
            {t("intro.tagline")}
          </p>
        </div>

        <p className="text-base sm:text-lg md:text-xl text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed mb-10 sm:mb-12 px-2">
          {t("intro.description")}
        </p>

        <div className="mb-14 sm:mb-20">
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg rounded-full bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-900/40 transition-all duration-300 hover:scale-105 hover:shadow-orange-900/60 border-0"
          >
            {t("intro.cta")}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full px-2 sm:px-4">
          {INTRO_FEATURES.map((feature) => (
            <div
              key={feature.key}
              className="bg-white/60 dark:bg-stone-800/40 backdrop-blur-md border border-stone-200/50 dark:border-stone-700/50 rounded-2xl p-5 sm:p-6 text-left hover:bg-white/80 dark:hover:bg-stone-800/60 transition-colors duration-300"
            >
              <div
                className={`w-10 h-10 rounded-full ${feature.bgColor} flex items-center justify-center mb-4 ${feature.iconColor}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={feature.path}
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-200 mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default IntroPage;
