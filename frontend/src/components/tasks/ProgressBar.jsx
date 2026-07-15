import React from "react";
import { useTranslation } from "react-i18next";

const ProgressBar = ({ percentage, accentColor }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-`10">
      <div className="flex justify-between items-end mb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            {t("tasks.progress_label", "Daily Progress")}
          </span>
          <p className="text-2xl font-bold font-serif text-stone-800 dark:text-stone-100">
            {percentage}%{" "}
            <span className="text-sm font-sans font-normal text-stone-500">
              {t("tasks.progress_complete", "Complete")}
            </span>
          </p>
        </div>
        <div
          className="text-xs font-bold px-3 py-1 rounded-full border"
          style={{
            borderColor: `${accentColor}40`,
            color: accentColor,
            backgroundColor: `${accentColor}10`,
          }}
        >
          {percentage === 100
            ? t("tasks.goal_reached", "Goal Reached! ✨")
            : t("tasks.staying_balanced", "Staying Balanced")}
        </div>
      </div>

      <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden shadow-inner-sm">
        <div
          className="h-full transition-all duration-700 ease-out relative"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${accentColor}dd, ${accentColor})`,
          }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
