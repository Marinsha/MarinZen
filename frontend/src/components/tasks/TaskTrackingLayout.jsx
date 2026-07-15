import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Leaf, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPersonalization } from "@/utils/personalizationStorage";
import { API_BASE_URL } from "@/config/api";
import { DASHBOARD_PROFILES } from "@/constants/doshaData";
import { useTranslation } from "react-i18next";

import ProgressBar from "@/components/tasks/ProgressBar";
import TaskList from "@/components/tasks/TaskList";

const TaskTrackingLayout = ({ category, title, description, icon }) => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recContent, setRecContent] = useState(null);
  const [recLoading, setRecLoading] = useState(true);

  const personalization = getPersonalization();
  const dosha =
    localStorage.getItem("marinZenUserDosha")?.toLowerCase() || "vata";
  const profile = DASHBOARD_PROFILES[dosha];

  const scores = personalization?.scores || { vata: 33, pitta: 33, kapha: 34 };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/dashboard");
  };

  useEffect(() => {
    const lang = i18n.language || "en";
    const cacheKey = `marinZenRecommendations_${dosha}_${lang}`;
    const TTL = 60 * 60 * 1000;

    const readCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const { data, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < TTL) return data;
        localStorage.removeItem(cacheKey);
      } catch {
        localStorage.removeItem(cacheKey);
      }
      return null;
    };

    const cached = readCache();
    if (cached) {
      setRecContent(cached);
      setRecLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/recommendations/${dosha}`, {
          headers: { Authorization: `Bearer ${token}`, "X-Language": lang },
        });
        if (res.ok) {
          const d = await res.json();
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ data: d, timestamp: Date.now() })
            );
          } catch {}
          setRecContent(d);
        }
      } catch {
      } finally {
        setRecLoading(false);
      }
    })();
  }, [dosha, i18n.language]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const query = new URLSearchParams({
        vata: scores.vata || 0,
        pitta: scores.pitta || 0,
        kapha: scores.kapha || 0,
        dosha: dosha,
      }).toString();

      const response = await fetch(
        `${API_BASE_URL}/tasks/${category}?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError(
        `${t("tasks.error_prefix", "Unable to load your")} ${category} ${t("tasks.error_suffix", "plan. Please try again later.")}`
      );
    } finally {
      setLoading(false);
    }
  }, [category, scores.vata, scores.pitta, scores.kapha]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleTask = async (taskId, completed) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
    );

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) throw new Error("Failed to update task");
    } catch (err) {
      console.error(err);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: !completed } : t
        )
      );
    }
  };

  const progress = tasks.length
    ? Math.round(
        (tasks.filter((t) => t.completed).length / tasks.length) * 100
      )
    : 0;

  const recText = recContent?.[category] || null;
  const recLines = recText
    ? recText
        .split("\n")
        .map((l) => l.replace(/^[-•*✦▸►→]\s*/, "").trim())
        .filter((l) => l.length > 0)
    : [];

  return (
    <main
      className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20"
      style={{ fontFamily: "'DM Sans',sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("dashboard.back_to_dashboard", "Back to Dashboard")}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-md shrink-0"
            style={{ background: profile.gradient }}
          >
            {icon}
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-lg leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden min-h-136 flex flex-col">
            <div
              className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3"
              style={{ background: `${profile.accent}08` }}
            >
              <Leaf className="w-4 h-4" style={{ color: profile.accent }} />
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: profile.accent }}
              >
                {t("tasks.ayurvedic_guidance", "Ayurvedic Guidance")}
              </h2>
            </div>

            <div className="p-6 sm:p-8 flex-1">
              {recLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-xs">
                    {t("tasks.loading_recs", "Loading recommendations...")}
                  </p>
                </div>
              ) : recLines.length > 0 ? (
                <ul className="space-y-4" role="list">
                  {recLines.map((line, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="mt-1.75 w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: profile.accent }}
                        aria-hidden
                      />
                      <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
                        {line}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-stone-400 text-sm text-center italic">
                    {t("tasks.no_recs_for", "Personalized recommendations for your")} {" "}
                    <span
                      className="capitalize font-semibold"
                      style={{ color: profile.accent }}
                    >
                      {dosha}
                    </span>{" "}
                    {t("tasks.no_recs_suffix", "constitution will appear here.")}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden min-h-136 flex flex-col">
            <div
              className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3"
              style={{ background: `${profile.accent}08` }}
            >
              <ListChecks className="w-4 h-4" style={{ color: profile.accent }} />
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: profile.accent }}
              >
                {t("tasks.todays_actions", "Today's Actions")}
              </h2>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-medium animate-pulse">
                    {t("tasks.aligning_plan", "Aligning your plan...")}
                  </p>
                </div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button
                    onClick={fetchTasks}
                    variant="outline"
                    className="rounded-full"
                  >
                    {t("tasks.retry", "Retry")}
                  </Button>
                </div>
              ) : (
                <>
                  <ProgressBar
                    percentage={progress}
                    accentColor={profile.accent}
                  />
                  <div className="mt-5 flex-1">
                    <TaskList
                      tasks={tasks}
                      onTaskToggle={handleToggleTask}
                      accentColor={profile.accent}
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default TaskTrackingLayout;
