import React, { useState, useEffect } from "react";
import { Moon, Zap, Brain, Wind, ChevronRight, CheckCircle2, Loader2, Sparkles, X } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useTranslation } from "react-i18next";

const DailyTaskRitual = ({ user }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [inputs, setInputs] = useState({ sleep: "", stress: "", energy: "", bodyCondition: "" });

  const questions = [
    { 
      id: "sleep", 
      question: t("dashboard.checkin.sleep.question", "How was your sleep?"), 
      options: [
        { value: "good", label: t("dashboard.checkin.sleep.good", "Good") },
        { value: "average", label: t("dashboard.checkin.sleep.average", "Average") },
        { value: "poor", label: t("dashboard.checkin.sleep.poor", "Poor") }
      ], 
      icon: Moon 
    },
    { 
      id: "stress", 
      question: t("dashboard.checkin.stress.question", "Stress level?"), 
      options: [
        { value: "low", label: t("dashboard.checkin.stress.low", "Low") },
        { value: "medium", label: t("dashboard.checkin.stress.medium", "Medium") },
        { value: "high", label: t("dashboard.checkin.stress.high", "High") }
      ], 
      icon: Brain 
    },
    { 
      id: "energy", 
      question: t("dashboard.checkin.energy.question", "Energy level?"), 
      options: [
        { value: "high", label: t("dashboard.checkin.energy.high", "High") },
        { value: "normal", label: t("dashboard.checkin.energy.normal", "Normal") },
        { value: "low", label: t("dashboard.checkin.energy.low", "Low") }
      ], 
      icon: Zap 
    },
    { 
      id: "bodyCondition", 
      question: t("dashboard.checkin.body.question", "Body feel?"), 
      options: [
        { value: "light", label: t("dashboard.checkin.body.light", "Light") },
        { value: "heavy", label: t("dashboard.checkin.body.heavy", "Heavy") },
        { value: "uneasy", label: t("dashboard.checkin.body.uneasy", "Uneasy") }
      ], 
      icon: Wind 
    }
  ];

  useEffect(() => {
    const fetchTodayTasks = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/today-tasks?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setTasks(data.tasks);
            setCompletionRate(data.completionRate);
            setStep(6);

            data.tasks.forEach(t => {
              if (t.task) {
                const statusStr = t.status === "done" ? "done" : "pending";
                fetch(`${API_BASE_URL}/tasks/history/sync-status?user_id=${user.id}&task_text=${encodeURIComponent(t.task)}&status=${statusStr}`, {
                  method: "POST"
                }).catch(() => {});
              }
            });
          } else {
            setStep(0);
          }
        } else {
          setStep(0);
        }
      } catch (err) {
        setStep(0);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayTasks();
  }, [user]);

  const handleOptionSelect = (id, value) => {
    setInputs(prev => ({ ...prev, [id]: value }));
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      handleGenerateTasks();
    }
  };

  const handleGenerateTasks = async () => {
    setStep(5);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/generate-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, dosha: user.dosha, ...inputs })
      });
      if (response.ok) {
        const result = await response.json();
        setTasks(result.data.tasks);
        setCompletionRate(result.data.completionRate);
        setStep(6);

        result.data.tasks.forEach(t => {
          if (t.task) {
            fetch(`${API_BASE_URL}/tasks/history/sync-status?user_id=${user.id}&task_text=${encodeURIComponent(t.task)}&status=pending`, {
              method: "POST"
            }).catch(() => {});
          }
        });
      } else {
        const errorData = await response.json().catch(() => ({ message: "Could not parse error response" }));
        const errorMessage = errorData.details || errorData.detail || errorData.message || JSON.stringify(errorData);
        const mainError = errorData.error || "Generation Failed";
        alert(`${mainError}\n\nDetails: ${errorMessage}`);
        setStep(0);
      }
    } catch (err) {
      console.error("Generation Error:", err);
      alert(`Network Error: ${err.message}`);
      setStep(0);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    const taskObj = tasks.find(t => t.id === taskId);
    const taskText = taskObj ? taskObj.task : "";

    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/tasks/update-task-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, date: today, taskId, status: newStatus })
      });
      if (response.ok) {
        const data = await response.json();
        setCompletionRate(data.completionRate);
      }

      if (taskText && user?.id) {
        fetch(`${API_BASE_URL}/tasks/history/sync-status?user_id=${user.id}&task_text=${encodeURIComponent(taskText)}&status=${newStatus}`, {
          method: "POST"
        }).catch(err => console.error("Error syncing to history db:", err));
      }
    } catch (err) {}
  };

  if (loading) return null;

  return (
    <div className="w-full">
      {step === 0 && (
        <div 
          onClick={() => setStep(1)}
          className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3.5rem] p-10 md:p-14 cursor-pointer hover:shadow-2xl transition-all duration-700"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
             <Zap size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest mb-6">
                <Sparkles size={12} /> {t("dashboard.active_routine", "Active Routine")}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">{t("dashboard.ready_ritual", "Ready for your Ritual?")}</h2>
              <p className="text-amber-50/70 text-lg max-w-xl font-medium">{t("dashboard.generate_ritual_desc", "Generate today's personalized Ayurvedic actions.")}</p>
            </div>
            <button className="px-10 py-4 bg-white text-stone-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
              {t("dashboard.start_checkin", "Start Check-in")}
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="bg-white dark:bg-stone-900/40 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-[3.5rem] p-10 md:p-14 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-stone-900 dark:text-white leading-tight">{t("dashboard.daily_ritual_title", "Your Daily Ritual")}</h2>
              <p className="text-stone-400 text-sm mt-2 font-medium uppercase tracking-widest">
                {new Date().toLocaleDateString(i18n.language === "ta" ? "ta-IN" : "en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-6 bg-stone-50 dark:bg-stone-800/50 p-6 rounded-3xl border border-stone-100 dark:border-stone-700">
               <div className="text-center">
                 <div className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">{t("dashboard.progress", "Progress")}</div>
                 <div className="text-3xl font-black text-amber-600">{Math.round(completionRate)}%</div>
               </div>
               <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin-slow" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => toggleTaskStatus(task.id, task.status)}
                className={`group flex items-center gap-5 p-5 rounded-[2rem] border cursor-pointer transition-all duration-500 ${
                  task.status === "done" 
                  ? "bg-stone-50/50 dark:bg-stone-900/20 border-transparent opacity-60" 
                  : "bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:border-amber-500/50 hover:shadow-lg"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  task.status === "done" ? "bg-green-100 text-green-600" : "bg-stone-50 dark:bg-stone-800 text-stone-300 group-hover:text-amber-500"
                }`}>
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex-grow">
                  <p className={`text-sm font-bold ${task.status === "done" ? "text-stone-400 line-through" : "text-stone-800 dark:text-stone-100"}`}>
                    {i18n.language === "ta" ? (task.task_ta || task.task) : task.task}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(step >= 1 && step <= 5) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-[3rem] p-10 shadow-2xl border border-white/20 overflow-hidden">
            <button onClick={() => setStep(0)} className="absolute top-8 right-8 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
              <X size={24} />
            </button>

            {step <= 4 ? (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">
                    {t("dashboard.checkin.title", "Daily Check-in")} • {step}/4
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 dark:text-white">{questions[step-1].question}</h3>
                </div>
                <div className="grid gap-3">
                  {questions[step-1].options.map(opt => (
                    <button 
                      key={opt.value}
                      onClick={() => handleOptionSelect(questions[step-1].id, opt.value)}
                      className="flex items-center justify-between p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700 hover:border-amber-500 transition-all group"
                    >
                      <span className="font-bold text-stone-700 dark:text-stone-300 group-hover:text-amber-600">{opt.label}</span>
                      <ChevronRight size={18} className="text-stone-300 group-hover:text-amber-500" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 gap-6">
                <Loader2 className="animate-spin text-amber-500" size={48} />
                <div className="text-center">
                  <h3 className="text-xl font-black text-stone-900 dark:text-white">{t("dashboard.checkin.curating", "Curating Path...")}</h3>
                  <p className="text-stone-400 text-sm mt-1">{t("dashboard.checkin.aligning", "Aligning your Ayurvedic rituals")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTaskRitual;
