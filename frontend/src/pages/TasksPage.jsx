import React, { useState, useEffect } from "react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { 
  Moon, 
  Zap, 
  Brain, 
  Wind, 
  ChevronRight, 
  CheckCircle2, 
  Loader2, 
  PlusCircle,
  Sparkles
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

const TasksPage = () => {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0); // 0: Check, 1-4: Questions, 5: Generating, 6: Tasks
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  
  const [inputs, setInputs] = useState({
    sleep: "",
    stress: "",
    energy: "",
    bodyCondition: ""
  });

  const questions = [
    {
      id: "sleep",
      question: "How was your sleep last night?",
      options: ["Good", "Average", "Poor"],
      icon: Moon,
      color: "blue"
    },
    {
      id: "stress",
      question: "What is your current stress level?",
      options: ["Low", "Medium", "High"],
      icon: Brain,
      color: "rose"
    },
    {
      id: "energy",
      question: "How would you rate your energy?",
      options: ["High", "Normal", "Low"],
      icon: Zap,
      color: "amber"
    },
    {
      id: "bodyCondition",
      question: "How does your body feel today?",
      options: ["Light", "Heavy", "Uneasy"],
      icon: Wind,
      color: "green"
    }
  ];

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedDosha = localStorage.getItem("marinZenUserDosha") || "Vata";
    const userId = localStorage.getItem("userId");
    
    setUser({ name: storedName, dosha: storedDosha, id: userId });

    // Step 12: Check if tasks already exist
    const fetchTodayTasks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/today-tasks?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks);
          setCompletionRate(data.completionRate);
          setStep(6); // Go straight to tasks
        } else {
          setStep(1); // Start check-in
        }
      } catch (err) {
        console.error("Error checking today tasks:", err);
        setStep(1);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTodayTasks();
    }
  }, []);

  const handleOptionSelect = (id, value) => {
    setInputs(prev => ({ ...prev, [id]: value }));
    if (step < 4) {
      setTimeout(() => setStep(prev => prev + 1), 300);
    } else {
      handleGenerateTasks();
    }
  };

  const handleGenerateTasks = async () => {
    setStep(5); // Loading state
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/generate-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          dosha: user.dosha,
          ...inputs
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(result.data.tasks);
        setCompletionRate(result.data.completionRate);
        setStep(6);
      } else {
        throw new Error("Failed to generate tasks");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setStep(1); // Fallback
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    
    // Optimistic Update
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/tasks/update-task-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          date: today,
          taskId,
          status: newStatus
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCompletionRate(data.completionRate);
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <Loader2 className="animate-spin text-amber-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0C0C0C] transition-colors duration-500">
      <DashboardTopBar user={user} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Step 8-9: Conversational Check-in Flow */}
        {step >= 1 && step <= 4 && (
          <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-4">
                <Sparkles size={12} />
                Daily Ritual
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-stone-900 dark:text-white">
                How are you <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">really</span> feeling?
              </h1>
              <p className="text-stone-400 text-sm mt-3">Step {step} of 4</p>
              
              {/* Progress Bar */}
              <div className="mt-8 w-full h-1.5 bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500 ease-out" 
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>

            {questions.map((q, idx) => step === idx + 1 && (
              <div key={q.id} className="space-y-6">
                <div className="flex flex-col items-center gap-6">
                  <div className={`p-5 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-sm text-stone-800 dark:text-stone-200`}>
                    <q.icon size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-center text-stone-800 dark:text-stone-100 leading-tight">
                    {q.question}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-8">
                  {q.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(q.id, option.toLowerCase())}
                      className="group flex items-center justify-between p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl hover:border-amber-500 dark:hover:border-amber-500 transition-all shadow-sm hover:shadow-md text-left"
                    >
                      <span className="font-bold text-stone-700 dark:text-stone-300 group-hover:text-amber-600 transition-colors">
                        {option}
                      </span>
                      <ChevronRight className="text-stone-300 group-hover:text-amber-500 transition-colors" size={20} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generating State */}
        {step === 5 && (
          <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-2xl animate-pulse rounded-full" />
              <Loader2 className="animate-spin text-amber-500 relative z-10" size={64} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-2">Curating Your Path</h2>
              <p className="text-stone-400 text-sm italic font-medium">Aligning ancient wisdom with your daily energy...</p>
            </div>
          </div>
        )}

        {/* Step 10-11: Tasks Display UI */}
        {step === 6 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-stone-900 dark:text-white leading-tight">
                  Your Daily <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">Task Ritual</span>
                </h1>
                <p className="text-stone-400 text-sm mt-4 font-medium uppercase tracking-widest">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="bg-stone-100 dark:bg-stone-900/50 p-6 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 min-w-[200px] text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">Completion Rate</div>
                <div className="text-4xl font-black text-amber-600">
                  {Math.round(completionRate)}%
                </div>
                <div className="mt-4 w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {tasks.map((task, idx) => (
                <div 
                  key={task.id} 
                  className={`group flex items-center gap-6 p-6 rounded-3xl border transition-all duration-500 ${
                    task.status === "done" 
                    ? "bg-stone-50/50 dark:bg-stone-900/20 border-transparent opacity-60" 
                    : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-500/50 hover:shadow-xl"
                  }`}
                >
                  {/* Status Toggle */}
                  <button 
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      task.status === "done" 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 shadow-inner" 
                      : "bg-stone-50 dark:bg-stone-800 text-stone-300 group-hover:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20"
                    }`}
                  >
                    <CheckCircle2 size={24} className={task.status === "done" ? "scale-110" : "scale-100"} />
                  </button>

                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${
                        task.type === "diet" ? "bg-green-100 text-green-700 dark:bg-green-900/40" :
                        task.type === "yoga" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40" :
                        task.type === "routine" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40" :
                        "bg-rose-100 text-rose-700 dark:bg-rose-900/40"
                      }`}>
                        {task.type}
                      </span>
                    </div>
                    <p className={`text-lg font-bold leading-tight ${
                      task.status === "done" ? "text-stone-400 line-through" : "text-stone-800 dark:text-stone-100"
                    }`}>
                      {task.task}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Motivation Section */}
            <div className="mt-16 p-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-900/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                  <PlusCircle size={120} />
               </div>
               <div className="relative z-10 flex-grow">
                  <h3 className="text-3xl font-black mb-3">Balance is a Daily Practice</h3>
                  <p className="text-amber-50/80 leading-relaxed max-w-xl">
                    Every small action counts. By completing these simple rituals, you are tuning your body to its natural frequency. Consistency is the secret to radiant health.
                  </p>
               </div>
               <div className="relative z-10 flex-shrink-0 bg-white/10 backdrop-blur-md px-8 py-6 rounded-[2rem] border border-white/20">
                  <div className="text-xs font-black tracking-widest uppercase mb-2 opacity-60">PRO TIP</div>
                  <p className="text-sm font-bold">Try to complete at least 3 tasks before noon.</p>
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Decorative Blurs */}
      <div className="fixed top-1/4 -right-24 w-96 h-96 bg-amber-200/20 dark:bg-amber-900/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-1/4 -left-24 w-80 h-80 bg-orange-200/20 dark:bg-orange-900/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
};

export default TasksPage;
