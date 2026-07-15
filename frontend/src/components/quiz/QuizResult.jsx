import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { savePersonalization } from "@/utils/personalizationStorage";
import { API_BASE_URL } from "@/config/api";
import { useTranslation } from "react-i18next";

const doshaDescriptions = {
  vata: "Vata is associated with movement, lightness, creativity, and variability.",
  pitta: "Pitta is associated with heat, sharpness, intensity, and transformation.",
  kapha: "Kapha is associated with stability, strength, calmness, and endurance.",
  "vata+pitta": "Vata-Pitta blends the quick, creative energy of air with the focused intensity of fire.",
  "pitta+kapha": "Pitta-Kapha combines the sharp focus of fire with the steady, calm endurance of earth.",
  "vata+kapha": "Vata-Kapha is a unique combination of creative movement and grounded stability.",
};

const doshaConfig = {
  vata: {
    gradient: "from-violet-500 to-indigo-500",
    softBg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-700/50",
    text: "text-violet-700 dark:text-violet-400",
    badge: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700/50",
    emoji: "🌬️",
    element: "Air & Space",
    qualities: ["Creative", "Quick-minded", "Enthusiastic", "Variable"],
  },
  pitta: {
    gradient: "from-orange-500 to-rose-500",
    softBg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-700/50",
    text: "text-orange-700 dark:text-orange-400",
    badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700/50",
    emoji: "🔥",
    element: "Fire & Water",
    qualities: ["Driven", "Focused", "Intense", "Transformative"],
  },
  kapha: {
    gradient: "from-teal-500 to-emerald-500",
    softBg: "bg-teal-50 dark:bg-teal-900/20",
    border: "border-teal-200 dark:border-teal-700/50",
    text: "text-teal-700 dark:text-teal-400",
    badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700/50",
    emoji: "🌿",
    element: "Earth & Water",
    qualities: ["Calm", "Stable", "Nurturing", "Enduring"],
  },
  "vata+pitta": {
    gradient: "from-violet-500 to-orange-500",
    softBg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-700/50",
    text: "text-violet-700 dark:text-violet-400",
    badge: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700/50",
    emoji: "🌪️",
    element: "Air, Space & Fire",
    qualities: ["Dynamic", "Passionate", "Versatile", "Expressive"],
  },
  "pitta+kapha": {
    gradient: "from-orange-500 to-teal-500",
    softBg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-700/50",
    text: "text-orange-700 dark:text-orange-400",
    badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700/50",
    emoji: "🌋",
    element: "Fire, Water & Earth",
    qualities: ["Strong", "Determined", "Stable", "Productive"],
  },
  "vata+kapha": {
    gradient: "from-violet-500 to-teal-500",
    softBg: "bg-teal-50 dark:bg-teal-900/20",
    border: "border-teal-200 dark:border-teal-700/50",
    text: "text-teal-700 dark:text-teal-400",
    badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-violet-200 dark:border-teal-700/50",
    emoji: "☁️",
    element: "Air, Space & Earth",
    qualities: ["Adaptable", "Nurturing", "Gentle", "Enduring"],
  },
};

const QuizResult = ({ result, scores, percentages, onRestart }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const config = doshaConfig[result.toLowerCase()];

  const handleFinish = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    let normalizedScores = {};

    if (userId && token) {
      try {
        normalizedScores = {};
        Object.entries(scores).forEach(([key, val]) => {
          normalizedScores[key.toLowerCase()] = val;
        });

        await fetch(`${API_BASE_URL}/auth/dosha`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dosha: result.toLowerCase(),
            scores: normalizedScores,
          }),
        });
      } catch (err) {
        console.error("Failed to sync Dosha:", err);
      }
    } else {
      Object.entries(scores).forEach(([key, val]) => {
        normalizedScores[key.toLowerCase()] = val;
      });
    }

    const normalizedPercentages = {};
    Object.entries(percentages).forEach(([key, value]) => {
      normalizedPercentages[key.toLowerCase()] = value;
    });

    savePersonalization({
      mode: "quiz",
      dominantDosha: result.charAt(0).toUpperCase() + result.slice(1).toLowerCase(),
      scores: normalizedScores,
      percentages: normalizedPercentages,
    });

    localStorage.setItem("marinZenUserDosha", result.toLowerCase());
    navigate("/dashboard");
  };

  return (
    <div className="fixed inset-0 w-full h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl my-auto animate-in fade-in zoom-in duration-500">
        <div className="relative bg-white/90 dark:bg-stone-900/50 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden text-center">
          <div className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-linear-to-br ${config.gradient}`} />

          <div className="relative px-5 sm:px-6 py-8 sm:py-10 md:py-12">
            <div className={`mx-auto mb-4 sm:mb-5 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-linear-to-br ${config.gradient} flex items-center justify-center text-4xl sm:text-5xl shadow-xl`}>
              {config.emoji}
            </div>

            <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-2 sm:mb-3 border ${config.badge}`}>
              {t("discover.result.identified", "Constitution Identified")}
            </div>

            <h1 className={`text-4xl sm:text-5xl font-black bg-linear-to-r ${config.gradient} bg-clip-text text-transparent mb-2 sm:mb-3 capitalize tracking-tighter`}>
              {t(`doshas.${result.toLowerCase()}`, result)}
            </h1>

            <p className="text-zinc-600 dark:text-stone-400 text-sm sm:text-md leading-relaxed max-w-sm mx-auto mb-6 sm:mb-8 px-2">
              {t(`discover.result.desc_${result.toLowerCase()}`, doshaDescriptions[result.toLowerCase()] || "")}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
              {Object.entries(percentages).map(([dosha, percent]) => {
                const configKey = dosha.toLowerCase();
                const doshaCfg = doshaConfig[configKey];
                return (
                  <div key={dosha} className="flex flex-col items-center">
                    <div className={`text-xl sm:text-2xl font-black ${doshaCfg?.text || ""}`}>
                      {percent}%
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                      {t(`doshas.${configKey}`, dosha)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className={`inline-flex items-center gap-2 text-xs font-bold ${config.text} ${config.softBg} border ${config.border} px-5 py-2 rounded-full`}>
                {t(`discover.quiz.element_${result.toLowerCase()}`, config.element)} {t("discover.result.element", "Element")}
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-1">
                {config.qualities.map((q, idx) => (
                  <span key={q} className="text-[11px] font-medium text-stone-500">
                    • {t(`discover.quiz.quality_${result.toLowerCase()}_${idx}`, q)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-stone-50/50 dark:bg-white/5 border-t border-zinc-100 dark:border-white/10 p-6 sm:p-8 flex justify-center">
            <Button
              onClick={handleFinish}
              className={`w-full sm:w-64 rounded-2xl px-8 sm:px-10 h-14 sm:h-16 font-bold text-lg text-white bg-linear-to-r ${config.gradient} shadow-xl shadow-stone-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all border-0`}
            >
              {t("discover.result.go_dashboard", "Go to Dashboard")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
