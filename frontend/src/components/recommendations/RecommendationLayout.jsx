import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Sparkles, ArrowLeft, Sun, Moon, Wind, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const RecommendationLayout = ({ 
  category, 
  icon: Icon, 
  colorClass = "green", 
  bgBlurColor = "bg-green-200/10",
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const language = i18n.language || "en"; 

  const insights = {
    "Diet": {
      tip: t("recommendations.diet.tip_title", "Agni Check"),
      detail: t("recommendations.diet.tip_detail", "Eat only when truly hungry for optimal digestion."),
      icon: Sun
    },
    "Yoga": {
      tip: t("recommendations.yoga.tip_title", "Best Time"),
      detail: t("recommendations.yoga.tip_detail", "Brahma Muhurta (4:00 AM - 6:00 AM) for spiritual growth."),
      icon: Wind
    },
    "Routine": {
      tip: t("recommendations.routine.tip_title", "Daily Ritual"),
      detail: t("recommendations.routine.tip_detail", "Tongue scraping removes toxins (Ama) from the body."),
      icon: Moon
    },
    "Ayurvedic Guide": {
      tip: t("recommendations.guide.tip_title", "Holistic Tip"),
      detail: t("recommendations.guide.tip_detail", "Self-Abhyanga (oil massage) calms the nervous system."),
      icon: Leaf
    }
  };

  const currentInsight = insights[category] || insights["Diet"];
  const categoryKeyMap = {
    "Diet": "diet",
    "Yoga": "yoga",
    "Routine": "routine",
    "Ayurvedic Guide": "ayurvedic_guide"
  };
  const categoryKey = categoryKeyMap[category] || "diet";

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedDosha = localStorage.getItem("marinZenUserDosha") || "Vata";
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    setUser({
      name: storedName || "Explorer",
      dosha: storedDosha,
    });

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/recommendations/${storedDosha}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-Language": language,
            "Content-Type": "application/json"
          }
        });

        if (response.status === 401) {
          throw new Error("Session expired.");
        }

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        const fieldMap = {
          "Diet": "diet",
          "Yoga": "yoga",
          "Routine": "routine",
          "Ayurvedic Guide": "ayurvedic_guidance"
        };
        setContent(data[fieldMap[category]] || "");
      } catch (err) {
        console.error(`Error fetching ${category}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (storedDosha) {
      fetchRecommendations();
    }
  }, [category, language]);

  if (!user) return null;

  const points = content ? content.split("\n\n").filter(p => p.trim() !== "") : [];

  const colorMap = {
    green: {
      bg: "bg-emerald-50/20 dark:bg-emerald-950/5",
      border: "border-emerald-100/30 dark:border-emerald-900/10",
      icon: "text-emerald-600 bg-emerald-100/50 dark:bg-emerald-900/30",
      accent: "bg-emerald-500",
      glow: "shadow-emerald-500/10"
    },
    blue: {
      bg: "bg-sky-50/20 dark:bg-sky-950/5",
      border: "border-sky-100/30 dark:border-sky-900/10",
      icon: "text-sky-600 bg-sky-100/50 dark:bg-sky-900/30",
      accent: "bg-sky-500",
      glow: "shadow-sky-500/10"
    },
    amber: {
      bg: "bg-amber-50/20 dark:bg-amber-950/5",
      border: "border-amber-100/30 dark:border-amber-900/10",
      icon: "text-amber-600 bg-amber-100/50 dark:bg-amber-900/30",
      accent: "bg-amber-500",
      glow: "shadow-amber-500/10"
    },
    rose: {
      bg: "bg-rose-50/20 dark:bg-rose-950/5",
      border: "border-rose-100/30 dark:border-rose-900/10",
      icon: "text-rose-600 bg-rose-100/50 dark:bg-rose-900/30",
      accent: "bg-rose-500",
      glow: "shadow-rose-500/10"
    }
  };

  const theme = colorMap[colorClass] || colorMap.green;

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0C0C0C] text-stone-800 dark:text-stone-200 transition-colors duration-500 flex flex-col font-sans overflow-hidden">
      
      <header className="fixed top-0 left-0 w-full z-50 px-10 py-8 flex justify-between items-center backdrop-blur-sm bg-white/5 dark:bg-black/5">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 group text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center group-hover:bg-stone-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
            <ArrowLeft size={14} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t("recommendations.back_to_dashboard", "Dashboard")}</span>
        </button>

        <div className="flex flex-col items-end">
          <h1 className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-600 mb-1">
            {t("recommendations.profile_title", "MarinZen Profile")}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-900 dark:text-white tracking-tight">{user.name}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${theme.accent} animate-pulse`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${theme.icon.split(' ')[0]}`}>{t(`doshas.${user.dosha.toLowerCase()}`, user.dosha)}</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24">
        <div className="w-full max-w-6xl">
          {loading ? (
            <div className="flex justify-center items-center py-40">
              <Loader2 className={`animate-spin ${theme.icon.split(' ')[0]}`} size={32} />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-rose-50/20 rounded-[2rem] border border-rose-100 dark:border-rose-900/20">
              <AlertCircle className="mx-auto text-rose-500 mb-4" size={32} />
              <p className="text-stone-500 text-xs font-medium">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-[10px] font-black uppercase tracking-widest underline underline-offset-4">{t("recommendations.retry", "Retry Session")}</button>
            </div>
          ) : (
            <div className={`relative flex flex-row items-stretch p-10 rounded-[2.5rem] border ${theme.bg} ${theme.border} backdrop-blur-md ${theme.glow} overflow-hidden w-full transition-all duration-700 animate-in fade-in slide-in-from-bottom-6`}>
              
              <div className="flex flex-col items-center justify-between min-w-[180px] border-r border-stone-200/50 dark:border-stone-800/50 pr-10">
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-[2rem] ${theme.icon} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-1 tracking-tighter uppercase italic">
                    {t(`dashboard.categories.${categoryKey}`, category)}
                  </h2>
                  <div className="h-0.5 w-6 bg-stone-200 dark:bg-stone-800 my-4" />
                </div>
                
                <div className="w-full bg-white/40 dark:bg-stone-900/40 p-4 rounded-2xl border border-white/50 dark:border-stone-800/50 flex flex-col items-center text-center">
                   <currentInsight.icon size={14} className={`${theme.icon.split(' ')[0]} mb-2`} />
                   <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">{currentInsight.tip}</h4>
                   <p className="text-[10px] font-bold text-stone-700 dark:text-stone-300 leading-tight">
                     {currentInsight.detail}
                   </p>
                </div>
              </div>

              <div className="flex-grow flex flex-col justify-center pl-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {points.map((point, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-xl ${theme.accent} text-white text-[10px] flex items-center justify-center font-black mt-0.5 shadow-md shadow-stone-900/5 transition-transform group-hover:scale-110`}>
                        {i + 1}
                      </div>
                      <p className="text-[13px] leading-relaxed font-bold text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 flex items-center justify-between opacity-30">
                  <div className="flex gap-2">
                    <Sparkles size={14} className={theme.icon.split(' ')[0]} />
                    <span className="text-[8px] font-black uppercase tracking-[0.4em]">{t("recommendations.wisdom_guidelines", "Wisdom Guidelines")}</span>
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-[0.4em]">© MarinZen 2026</div>
                </div>
              </div>

              <div className={`absolute top-0 right-0 w-32 h-1.5 ${theme.accent} rounded-bl-full`} />
            </div>
          )}
        </div>
      </main>

      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full ${bgBlurColor} blur-[120px] rounded-full -z-10 pointer-events-none opacity-40`} />
    </div>
  );
};

export default RecommendationLayout;
