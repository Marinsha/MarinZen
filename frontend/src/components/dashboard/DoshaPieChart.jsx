import React, { useEffect, useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { getPersonalization } from "@/utils/personalizationStorage";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DoshaPieChart = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [personalization, setPersonalization] = useState(null);
  const [percentages, setPercentages] = useState({ vata: 0, pitta: 0, kapha: 0 });
  const [hasQuizData, setHasQuizData] = useState(false);

  useEffect(() => {
    const data = getPersonalization();
    setPersonalization(data);

    if (data && data.scores) {
      const v = Number(data.scores.vata || 0);
      const p = Number(data.scores.pitta || 0);
      const k = Number(data.scores.kapha || 0);
      const total = v + p + k;

      if (total > 0 && data.mode === "quiz") {
        setHasQuizData(true);
        if (data.percentages) {
          const rawPercentages = data.percentages;
          setPercentages({
            vata: Math.round(Number(rawPercentages.vata ?? rawPercentages.Vata ?? 0)),
            pitta: Math.round(Number(rawPercentages.pitta ?? rawPercentages.Pitta ?? 0)),
            kapha: Math.round(Number(rawPercentages.kapha ?? rawPercentages.Kapha ?? 0)),
          });
        } else {
          const vPct = Math.round((v / total) * 100);
          const pPct = Math.round((p / total) * 100);
          const kPct = 100 - vPct - pPct;
          setPercentages({ vata: vPct, pitta: pPct, kapha: kPct });
        }
      }
    }
  }, []);

  const handleStartQuiz = () => {
    navigate("/quiz?retake=true");
  };

  const radius = 50;
  const strokeWidth = 14;
  const circ = 2 * Math.PI * radius;

  const vataStroke = (percentages.vata / 100) * circ;
  const pittaStroke = (percentages.pitta / 100) * circ;
  const kaphaStroke = (percentages.kapha / 100) * circ;

  const doshasData = [
    {
      key: "vata",
      name: t("doshas.vata", "Vata"),
      percent: percentages.vata,
      element: t("discover.quiz.element_vata", "Air & Space"),
      gradient: "from-violet-500 to-indigo-500",
      textColor: "text-violet-600 dark:text-violet-400",
      strokeColor: "url(#vataGrad)",
      glowColor: "shadow-violet-500/20",
      barColor: "bg-linear-to-r from-violet-500 to-indigo-500",
      bgClass: "bg-violet-500/5 border-violet-500/10",
      description: t("discover.result.qualities_vata", "Light, Creative, Energetic, Adaptable")
    },
    {
      key: "pitta",
      name: t("doshas.pitta", "Pitta"),
      percent: percentages.pitta,
      element: t("discover.quiz.element_pitta", "Fire & Water"),
      gradient: "from-orange-500 to-rose-500",
      textColor: "text-orange-600 dark:text-orange-400",
      strokeColor: "url(#pittaGrad)",
      glowColor: "shadow-orange-500/20",
      barColor: "bg-linear-to-r from-orange-500 to-rose-500",
      bgClass: "bg-orange-500/5 border-orange-500/10",
      description: t("discover.result.qualities_pitta", "Focused, Intelligent, Courageous, Sharp")
    },
    {
      key: "kapha",
      name: t("doshas.kapha", "Kapha"),
      percent: percentages.kapha,
      element: t("discover.quiz.element_kapha", "Earth & Water"),
      gradient: "from-teal-500 to-emerald-500",
      textColor: "text-teal-600 dark:text-teal-400",
      strokeColor: "url(#kaphaGrad)",
      glowColor: "shadow-teal-500/20",
      barColor: "bg-linear-to-r from-teal-500 to-emerald-500",
      bgClass: "bg-teal-500/5 border-teal-500/10",
      description: t("discover.result.qualities_kapha", "Calm, Grounded, Compassionate, Stable")
    }
  ];

  if (!hasQuizData) return null;

  return (
    <div className="w-full mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="w-full bg-white/80 dark:bg-stone-900/60 backdrop-blur-2xl border border-stone-200/60 dark:border-stone-850 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-xl shadow-stone-200/40 dark:shadow-black/40 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-left">
        <div className="relative shrink-0 w-[220px] h-[220px] flex items-center justify-center">
          <svg 
            viewBox="0 0 140 140" 
            className="w-full h-full drop-shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_8px_30px_rgba(0,0,0,0.3)] animate-in spin-in-12 duration-1000 ease-out"
          >
            <defs>
              <linearGradient id="vataGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="pittaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <linearGradient id="kaphaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="transparent"
              strokeWidth={strokeWidth}
            />
            {percentages.vata > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke="url(#vataGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${vataStroke} ${circ}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                className="transition-all duration-1000 ease-out hover:stroke-[16px] cursor-pointer"
              />
            )}
            {percentages.pitta > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke="url(#pittaGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${pittaStroke} ${circ}`}
                strokeDashoffset={-vataStroke}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                className="transition-all duration-1000 ease-out hover:stroke-[16px] cursor-pointer"
              />
            )}
            {percentages.kapha > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke="url(#kaphaGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${kaphaStroke} ${circ}`}
                strokeDashoffset={-(vataStroke + pittaStroke)}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                className="transition-all duration-1000 ease-out hover:stroke-[16px] cursor-pointer"
              />
            )}
            <circle cx="70" cy="70" r="36" className="fill-white dark:fill-stone-900 transition-colors duration-300" />
            <text x="70" y="66" textAnchor="middle" className="text-[6px] font-black uppercase tracking-[0.2em] fill-stone-400 dark:fill-stone-500">
              Prakriti
            </text>
            <text x="70" y="82" textAnchor="middle" className="text-[10px] font-black fill-stone-850 dark:fill-stone-100 capitalize">
              {personalization?.dominantDosha || "Vata"}
            </text>
          </svg>
          <div className="absolute top-3 right-3 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-500/70" />
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col gap-6">
          <div>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-500 mb-1 block">{t("dashboard.constitution_proportions", "Constitution Proportions")}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight leading-tight">
              {t("discover.result.title", "Your Ayurvedic Profile")}
            </h2>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              {t("dashboard.constitution_proportions_desc", "Ayurveda classifies your unique mind-body bio-elements. Discover your specific balance of Vata (Air), Pitta (Fire), and Kapha (Earth).")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {doshasData.map(dosha => (
              <div 
                key={dosha.key}
                className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 ${dosha.bgClass}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${dosha.textColor}`}>
                    {dosha.name}
                  </span>
                  <span className="text-lg font-black text-stone-850 dark:text-stone-100">{dosha.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${dosha.barColor}`}
                    style={{ width: `${dosha.percent}%` }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[6.5px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 block mb-1">
                    {t("discover.result.element", "Element")}: {dosha.element}
                  </span>
                  <p className="text-[8px] font-bold text-stone-500 dark:text-stone-400 leading-normal line-clamp-2">
                    {dosha.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end border-t border-stone-100 dark:border-stone-800 pt-4 mt-1">
            <button 
              onClick={handleStartQuiz}
              className="text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1"
            >
              {t("discover.result.retake_quiz", "Retake Questionnaire")}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoshaPieChart;
