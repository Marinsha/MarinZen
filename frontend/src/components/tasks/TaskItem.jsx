import React from "react";
import { Check } from "lucide-react";

/**
 * TaskItem
 * Purely presentational component for a daily task.
 */
const TaskItem = ({ id, name, completed, onToggle, accentColor }) => {
  return (
    <button
      onClick={() => onToggle(id, !completed)}
      className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group text-left ${
        completed
          ? "bg-stone-50/50 dark:bg-white/5 border-stone-200 dark:border-white/10 opacity-60"
          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 hover:shadow-md active:scale-[0.98]"
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
          completed
            ? "border-transparent"
            : "border-stone-200 dark:border-stone-700 group-hover:border-stone-400"
        }`}
        style={{ backgroundColor: completed ? accentColor : "transparent" }}
      >
        {completed && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
      </div>

      {/* Task Text */}
      <span
        className={`text-base font-medium transition-all duration-300 ${
          completed
            ? "text-stone-400 line-through decoration-2"
            : "text-stone-700 dark:text-stone-200"
        }`}
      >
        {name}
      </span>
    </button>
  );
};

export default TaskItem;
