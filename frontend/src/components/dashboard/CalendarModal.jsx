import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/api";

const CalendarModal = ({ isOpen, onClose, user }) => {
  const { i18n, t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDetails, setShowDetails] = useState(false);
  const [monthlyTasks, setMonthlyTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchMonthlyHistory = async () => {
    const activeUserId = user?.id || localStorage.getItem("userId");
    if (!activeUserId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/history/monthly?user_id=${activeUserId}`);
      if (response.ok) {
        const data = await response.json();
        setMonthlyTasks(data);
      }
    } catch (err) {
      console.error("Error fetching monthly history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMonthlyHistory();
      setShowDetails(false);
    }
  }, [isOpen, user]);

  const taskMap = useMemo(() => {
    const map = {};
    monthlyTasks.forEach(task => {
      const dStr = task.task_date;
      if (!map[dStr]) {
        map[dStr] = [];
      }
      map[dStr].push(task);
    });
    return map;
  }, [monthlyTasks]);

  const selectedDateStr = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const selectedTasks = taskMap[selectedDateStr] || [];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevDaysInMonth = new Date(year, month, 0).getDate();

  const monthNames = i18n.language === "ta"
    ? ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"]
    : [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
    setShowDetails(false);
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
    setShowDetails(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-[-12px] sm:right-[-20px] md:right-auto md:left-[-8px] top-full mt-3 z-50 w-[290px] sm:w-[320px] bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200/80 dark:border-stone-800 rounded-[2rem] p-4 sm:p-5 shadow-2xl shadow-stone-500/10 dark:shadow-black/70 transition-all duration-300 animate-in fade-in slide-in-from-top-4 flex flex-col gap-4 text-left">
      {!showDetails ? (
        <>
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-900">
            <div>
              <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-white tracking-tight">
                {monthNames[month]}
              </h4>
              <p className="text-[8px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-600">{year}</p>
            </div>
            <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-900 p-1 rounded-xl border border-stone-200/40 dark:border-stone-800">
              <button 
                onClick={handlePrevMonth}
                className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-stone-800 rounded-lg transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-stone-800 rounded-lg transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-stone-950/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
              </div>
            )}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, index) => {
                const localizedDays = i18n.language === "ta" 
                  ? ["ஞா", "தி", "செ", "பு", "வி", "வெ", "ச"] 
                  : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
                return (
                  <span key={day} className="text-[8px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 py-0.5">
                    {localizedDays[index]}
                  </span>
                );
              })}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayIndex }).map((_, idx) => {
                const prevDay = prevDaysInMonth - firstDayIndex + idx + 1;
                return (
                  <div 
                    key={`prev-${idx}`}
                    className="aspect-square flex items-center justify-center text-[9px] font-bold text-stone-300 dark:text-stone-800 pointer-events-none"
                  >
                    {prevDay}
                  </div>
                );
              })}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateObj = new Date(year, month, dayNum);
                const isSelected = selectedDate.getDate() === dayNum && 
                                   selectedDate.getMonth() === month && 
                                   selectedDate.getFullYear() === year;

                const isToday = new Date().getDate() === dayNum && 
                                new Date().getMonth() === month && 
                                new Date().getFullYear() === year;

                const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const dayTasks = taskMap[dStr] || [];
                const hasHistory = dayTasks.length > 0;

                let dotColor = "bg-stone-200 dark:bg-stone-800";
                if (hasHistory) {
                  const completedCount = dayTasks.filter(t => t.status === "completed").length;
                  if (completedCount === dayTasks.length) {
                    dotColor = "bg-emerald-500 shadow-sm shadow-emerald-500/20";
                  } else if (completedCount > 0) {
                    dotColor = "bg-amber-500 shadow-sm shadow-amber-500/20";
                  } else {
                    dotColor = "bg-stone-400 dark:bg-stone-600";
                  }
                }

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(dateObj);
                      setShowDetails(true);
                    }}
                    className={`aspect-square relative flex flex-col items-center justify-center rounded-xl transition-all duration-300 font-bold text-[9px] ${
                      isSelected && showDetails
                        ? "bg-stone-900 text-white dark:bg-white dark:text-stone-950 scale-105 shadow-md"
                        : isToday
                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-500 hover:bg-stone-50 dark:hover:bg-stone-900"
                          : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 border border-transparent"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasHistory && (
                      <span className={`w-0.5 h-0.5 rounded-full absolute bottom-1 ${dotColor}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-305">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-900">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDetails(false); }}
              className="flex items-center gap-1.5 text-stone-500 hover:text-stone-950 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{t("dashboard.calendar.title", "Calendar")}</span>
            </button>
            <div className="text-right">
              <span className="text-[7px] font-black uppercase tracking-widest text-amber-500 block mb-0.5">{t("dashboard.calendar.tracked_rituals", "Tracked Rituals")}</span>
              <span className="text-[10px] font-black text-stone-850 dark:text-white leading-tight block">
                {selectedDate.toLocaleDateString(i18n.language === "ta" ? "ta-IN" : "en-US", { month: "short", day: "numeric", weekday: "short" })}
              </span>
            </div>
          </div>

          {selectedTasks.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                {selectedTasks.map(task => {
                  const isCompleted = task.status === "completed";
                  const isSkipped = task.status === "skipped";
                  const taskText = i18n.language === "ta" ? (task.text_ta || task.text_en) : task.text_en;

                  return (
                    <div 
                      key={task.id} 
                      className={`flex items-center gap-3 p-3 rounded-2xl border ${
                        isCompleted 
                          ? "bg-emerald-500/5 border-emerald-500/10 opacity-80" 
                          : isSkipped 
                            ? "bg-rose-500/5 border-rose-500/10 opacity-80"
                            : "bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800"
                      }`}
                    >
                      <div 
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCompleted 
                            ? "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-500" 
                            : isSkipped 
                              ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-500"
                              : "bg-stone-50 dark:bg-stone-800 text-stone-300"
                        }`}
                      >
                        <CheckCircle2 size={14} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="text-[7px] font-black uppercase tracking-widest opacity-40 mb-0.5 block">
                          {task.task_type ? t(`dashboard.categories.${task.task_type.toLowerCase()}`, task.task_type) : t("dashboard.calendar.ritual", "Ritual")}
                        </span>
                        <p className={`text-[10px] font-bold leading-normal ${
                          isCompleted 
                            ? "text-stone-400 line-through dark:text-stone-500" 
                            : isSkipped 
                              ? "text-stone-450 line-through dark:text-stone-500"
                              : "text-stone-850 dark:text-stone-100"
                        }`}>
                          {taskText}
                        </p>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest shrink-0 ${
                        isCompleted 
                          ? "text-emerald-500" 
                          : isSkipped 
                            ? "text-rose-500"
                            : "text-stone-400"
                      }`}>
                        {task.status === "completed" 
                          ? t("dashboard.calendar.completed", "completed") 
                          : task.status === "skipped" 
                            ? t("dashboard.calendar.skipped", "skipped") 
                            : t("dashboard.calendar.pending", "pending")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-6 px-3 bg-stone-50 dark:bg-stone-900/30 rounded-[1.25rem] border border-stone-100 dark:border-stone-850">
              <Calendar className="w-8 h-8 text-stone-300 dark:text-stone-750 mb-2" />
              <h4 className="text-[10px] font-black text-stone-700 dark:text-stone-350">{t("dashboard.calendar.no_rituals", "No tracked rituals")}</h4>
              <p className="text-[8px] text-stone-400 mt-1 max-w-[160px] leading-tight">{t("dashboard.calendar.no_rituals_desc", "Complete check-in to build history!")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarModal;
