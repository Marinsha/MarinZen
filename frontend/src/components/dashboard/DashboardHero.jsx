import React from "react";
import { useTranslation } from "react-i18next";

const DashboardHero = ({ dosha }) => {
  const { t } = useTranslation();
  const normalizedDosha = dosha?.toLowerCase() || "vata";
  
  const doshaMeta = {
    vata: { title: "Vata", sub: "The Creative Energy", quote: "Balance movement with stillness." },
    pitta: { title: "Pitta", sub: "The Intense Energy", quote: "Cool the fire within." },
    kapha: { title: "Kapha", sub: "The Steady Energy", quote: "Find movement in stability." },
    "vata+pitta": { title: "Vata-Pitta", sub: "Dynamic Intensity", quote: "Patience leads to true power." },
    "pitta+kapha": { title: "Pitta-Kapha", sub: "Strong Endurance", quote: "Cool focus meets steady ground." },
    "vata+kapha": { title: "Vata-Kapha", sub: "Grounded Creativity", quote: "Structure allows freedom." },
  };

  const meta = doshaMeta[normalizedDosha] || doshaMeta.vata;

  return (
    <div className="text-center mb-12 sm:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="inline-flex flex-col items-center mb-6">
        <h1 className="text-4xl sm:text-6xl font-black text-stone-800 dark:text-stone-100 tracking-tighter mb-2">
          {meta.title}
        </h1>
        <div className="h-1 w-12 bg-linear-to-r from-teal-500 to-emerald-500 rounded-full mb-3" />
        <p className="text-stone-400 dark:text-stone-500 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs">
          {meta.sub}
        </p>
      </div>
      
      <p className="text-sm sm:text-md italic text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
        "{meta.quote}"
      </p>
    </div>
  );
};

export default DashboardHero;
