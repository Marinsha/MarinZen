import React, { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Calendar, 
  Loader2, 
  User,
  Activity,
  Slash
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

const CalendarWidget = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyTasks, setMonthlyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch 30-day task logs
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
    fetchMonthlyHistory();
  }, [user]);

  // Group tasks by date string (YYYY-MM-DD)
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

  // Get active tasks for the selected date
  const selectedDateStr = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const selectedTasks = taskMap[selectedDateStr] || [];

  // Toggle status of a history task record
  const handleUpdateStatus = async (taskId, newStatus) => {
    setActionLoading(taskId);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/history/${taskId}/${newStatus}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setMonthlyTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }
    } catch (err) {
      console.error("Error updating history status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper date generators
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevDaysInMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* 1. CALENDAR CARD (Fixed inside column, never floats or overlaps) */}
      <div 
        id="dashboard-calendar-widget" 
        className="w-full bg-white dark:bg-stone-900/40 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-[3.5rem] p-6 sm:p-8 shadow-xl flex flex-col gap-6 text-left transition-all duration-500"
      >
        {/* Header navigation */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tighter leading-none">
              {monthNames[month]}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-600 mt-1">{year}</p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-900 p-1 rounded-xl border border-stone-200/40 dark:border-stone-805">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-stone-800 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-stone-800 rounded-lg transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-stone-950/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          )}

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
              <span key={day} className="text-[9px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-600 py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Render Previous Month's trailing days */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => {
              const prevDay = prevDaysInMonth - firstDayIndex + idx + 1;
              return (
                <div 
                  key={`prev-${idx}`}
                  className="aspect-square flex items-center justify-center text-[11px] font-bold text-stone-300 dark:text-stone-800 pointer-events-none"
                >
                  {prevDay}
                </div>
              );
            })}

            {/* Render Current Month days */}
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

              let dotColor = "bg-stone-200 dark:bg-stone-850";
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
                  }}
                  className={`aspect-square relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300 font-bold text-[11px] ${
                    isSelected
                      ? "bg-stone-900 text-white dark:bg-white dark:text-stone-950 scale-105 shadow-md"
                      : isToday
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-500 hover:bg-stone-50 dark:hover:bg-stone-900"
                        : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 border border-transparent"
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasHistory && (
                    <span className={`w-1 h-1 rounded-full absolute bottom-2 ${dotColor}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. DAY DETAILS PANEL (Fixed container below calendar card inside column) */}
      <div className="w-full bg-white dark:bg-stone-900/40 backdrop-blur-xl border border-stone-200 dark:border-stone-850 rounded-[3.5rem] p-6 sm:p-8 shadow-xl flex flex-col gap-5 text-left transition-all duration-500">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h4 className="text-lg font-black text-stone-900 dark:text-white tracking-tight">
              {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
            </h4>
            <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-600 mt-1">Day Details</p>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-550 flex items-center gap-1 bg-stone-50 dark:bg-stone-900 px-2 py-1 rounded-lg border border-stone-200/50 dark:border-stone-800">
            History Log
          </span>
        </div>

        {selectedTasks.length > 0 ? (
          <div className="flex flex-col gap-5">
            {/* Daily Ayurveda Profile Summary */}
            <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-[2rem] border border-stone-100 dark:border-stone-850 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <User size={14} className="text-amber-500" />
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 block">Dosha</span>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {selectedTasks[0].dosha}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-amber-500" />
                <div className="text-right">
                  <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 block">State</span>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {selectedTasks[0].state}
                  </span>
                </div>
              </div>
            </div>

            {/* Tasks checklist panel */}
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
              {selectedTasks.map(task => {
                const isCompleted = task.status === "completed";
                const isSkipped = task.status === "skipped";

                return (
                  <div 
                    key={task.id} 
                    className={`p-4 rounded-2xl border transition-all duration-300 ${
                      isCompleted 
                        ? "bg-emerald-500/5 border-emerald-500/10" 
                        : isSkipped 
                          ? "bg-rose-500/5 border-rose-500/10"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className={`text-xs font-bold leading-tight ${
                          isCompleted 
                            ? "line-through text-stone-450 dark:text-stone-650" 
                            : isSkipped 
                              ? "text-stone-455 dark:text-stone-655"
                              : "text-stone-850 dark:text-stone-200"
                        }`}>
                          {task.text_en}
                        </p>
                        <p className="text-[10px] font-semibold text-stone-400/80 dark:text-stone-500/80 leading-tight mt-1">
                          {task.text_ta}
                        </p>
                      </div>

                      {/* Interactive Toggles */}
                      <div className="flex items-center justify-between border-t border-stone-50 dark:border-stone-850/30 pt-2 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          isCompleted 
                            ? "text-emerald-500" 
                            : isSkipped 
                              ? "text-rose-500"
                              : "text-stone-450"
                        }`}>
                          {task.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task.id, isCompleted ? "pending" : "completed");
                            }}
                            disabled={actionLoading === task.id}
                            className={`p-1.5 rounded-lg border transition-all duration-200 ${
                              isCompleted 
                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                : "border-stone-200/80 hover:border-emerald-500 text-stone-450 hover:text-emerald-500 dark:border-stone-800"
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task.id, isSkipped ? "pending" : "skipped");
                            }}
                            disabled={actionLoading === task.id}
                            className={`p-1.5 rounded-lg border transition-all duration-200 ${
                              isSkipped 
                                ? "bg-rose-500 border-rose-500 text-white" 
                                : "border-stone-200/80 hover:border-rose-505 text-stone-450 hover:text-rose-505 dark:border-stone-800"
                            }`}
                          >
                            <Slash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-stone-50 dark:bg-stone-900/30 rounded-3xl border border-stone-100 dark:border-stone-850">
            <Calendar className="w-8 h-8 text-stone-300 dark:text-stone-750 mb-3" />
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400 leading-tight">No tasks tracked for this day</p>
            <p className="text-[10px] text-stone-450 dark:text-stone-600 mt-1 max-w-[200px]">Complete today's ritual check-in to start building your calendar history!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CalendarWidget;
