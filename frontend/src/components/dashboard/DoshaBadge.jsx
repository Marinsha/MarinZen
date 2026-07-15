import React from "react";
import { useTranslation } from "react-i18next";

const doshaStyles = {
  vata: "from-violet-500 to-indigo-500 text-violet-700 bg-violet-50 border-violet-100 dark:bg-violet-900/20 dark:border-violet-700/50 dark:text-violet-400",
  pitta: "from-orange-500 to-rose-500 text-orange-700 bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-700/50 dark:text-orange-400",
  kapha: "from-teal-500 to-emerald-500 text-teal-700 bg-teal-50 border-teal-100 dark:bg-teal-900/20 dark:border-teal-700/50 dark:text-teal-400",
  "vata+pitta": "from-violet-500 to-orange-500 text-indigo-700 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400",
  "pitta+kapha": "from-orange-500 to-teal-500 text-orange-700 bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-700/50 dark:text-orange-400",
  "vata+kapha": "from-violet-500 to-teal-500 text-teal-700 bg-teal-50 border-teal-100 dark:bg-teal-900/20 dark:border-teal-700/50 dark:text-teal-400",
};

const DoshaBadge = ({ dosha }) => {
  const { t } = useTranslation();
  const normalizedDosha = dosha?.toLowerCase() || "vata";
  const style = doshaStyles[normalizedDosha] || doshaStyles.vata;

  return (
    <div className={`flex items-center gap-2 px-2 sm:px-4 py-1.5 rounded-full border transition-all duration-500 ${style}`}>
      <div className={`w-2 h-2 rounded-full bg-linear-to-br ${style.split(' ').slice(0,2).join(' ')} shadow-xs`} />
      <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">
        {t(`doshas.${normalizedDosha}`, normalizedDosha)}
      </span>
    </div>
  );
};

export default DoshaBadge;
