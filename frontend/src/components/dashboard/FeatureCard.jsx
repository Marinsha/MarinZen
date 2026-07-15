import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FeatureCard = ({ icon: Icon, title, quote, points, color, link }) => {
  const { t } = useTranslation();
  const colorMap = {
    green: {
      bg: "bg-emerald-50/50 dark:bg-emerald-950/10",
      border: "border-emerald-100/50 dark:border-emerald-900/20",
      icon: "text-emerald-600 bg-emerald-100/50 dark:bg-emerald-900/30",
      accent: "bg-emerald-500",
      shadow: "hover:shadow-emerald-100/50 dark:hover:shadow-none"
    },
    blue: {
      bg: "bg-sky-50/50 dark:bg-sky-950/10",
      border: "border-sky-100/50 dark:border-sky-900/20",
      icon: "text-sky-600 bg-sky-100/50 dark:bg-sky-900/30",
      accent: "bg-sky-500",
      shadow: "hover:shadow-sky-100/50 dark:hover:shadow-none"
    },
    amber: {
      bg: "bg-amber-50/50 dark:bg-amber-950/10",
      border: "border-amber-100/50 dark:border-amber-900/20",
      icon: "text-amber-600 bg-amber-100/50 dark:bg-amber-900/30",
      accent: "bg-amber-500",
      shadow: "hover:shadow-amber-100/50 dark:hover:shadow-none"
    },
    rose: {
      bg: "bg-rose-50/50 dark:bg-rose-950/10",
      border: "border-rose-100/50 dark:border-rose-900/20",
      icon: "text-rose-600 bg-rose-100/50 dark:bg-rose-900/30",
      accent: "bg-rose-500",
      shadow: "hover:shadow-rose-100/50 dark:hover:shadow-none"
    }
  };

  const theme = colorMap[color] || colorMap.green;

  return (
    <div className={`group relative flex flex-col items-center justify-between p-6 sm:p-7 lg:p-8 rounded-[2.5rem] border ${theme.bg} ${theme.border} backdrop-blur-md transition-all duration-500 hover:-translate-y-2 ${theme.shadow} shadow-md overflow-hidden min-h-[420px] w-full`}>
      <div className={`absolute top-0 left-0 w-full h-1.5 ${theme.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${theme.accent} opacity-[0.04] group-hover:opacity-[0.1] blur-3xl transition-opacity duration-700`} />

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className={`w-14 h-14 rounded-2xl ${theme.icon} flex items-center justify-center mb-6 transition-transform group-hover:rotate-12 duration-500 shadow-sm`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-stone-800 dark:text-stone-100 mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-stone-400 dark:text-stone-500 text-center px-2">
          {quote}
        </p>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center gap-3 py-6 flex-grow justify-center">
        {points.map((point, i) => (
          <div key={i} className="text-[13px] font-semibold text-stone-600 dark:text-stone-300 transition-colors group-hover:text-stone-900 dark:group-hover:text-white text-center">
            {point}
          </div>
        ))}
      </div>

      <Link to={link || "#"} className="w-full flex justify-center">
        <Button 
          className="relative z-10 w-full max-w-[140px] rounded-2xl h-10 font-black text-[10px] uppercase tracking-widest bg-stone-900 dark:bg-white text-white dark:text-stone-900 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-stone-200/50 dark:shadow-none mb-2"
        >
          {t("dashboard.explore", "Explore")}
          <ArrowRight className="ml-2 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
};

export default FeatureCard;
