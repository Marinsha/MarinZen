// Data & UI Configurations for Doshas

export const QUIZ_QUESTION_CONFIG = {
  vata: {
    border: "border-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    ring: "ring-violet-400",
    text: "text-violet-700 dark:text-violet-400",
    dot: "bg-violet-500",
    icon: "🌬️",
  },
  pitta: {
    border: "border-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    ring: "ring-orange-400",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
    icon: "🔥",
  },
  kapha: {
    border: "border-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
    ring: "ring-teal-400",
    text: "text-teal-700 dark:text-teal-400",
    dot: "bg-teal-500",
    icon: "🌿",
  },
};

export const DOSHA_DESCRIPTIONS = {
  vata: "Vata is associated with movement, lightness, creativity, and variability.",
  pitta:
    "Pitta is associated with heat, sharpness, intensity, and transformation.",
  kapha:
    "Kapha is associated with stability, strength, calmness, and endurance.",
  "vata+pitta": "Vata-Pitta blends creative movement with sharp intensity and transformation.",
  "pitta+kapha": "Pitta-Kapha combines fiery focus with enduring stability and nurturing calm.",
  "vata+kapha": "Vata-Kapha integrates light adaptability with grounded strength and endurance.",
};

export const QUIZ_RESULT_CONFIG = {
  vata: {
    gradient: "from-violet-500 to-indigo-500",
    softBg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-700/50",
    text: "text-violet-700 dark:text-violet-400",
    badge:
      "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700/50",
    emoji: "🌬️",
    element: "Air & Space",
    qualities: ["Creative", "Quick-minded", "Enthusiastic", "Variable"],
  },
  pitta: {
    gradient: "from-orange-500 to-rose-500",
    softBg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-700/50",
    text: "text-orange-700 dark:text-orange-400",
    badge:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700/50",
    emoji: "🔥",
    element: "Fire & Water",
    qualities: ["Driven", "Focused", "Intense", "Transformative"],
  },
  kapha: {
    gradient: "from-teal-500 to-emerald-500",
    softBg: "bg-teal-50 dark:bg-teal-900/20",
    border: "border-teal-200 dark:border-teal-700/50",
    text: "text-teal-700 dark:text-teal-400",
    badge:
      "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700/50",
    emoji: "🌿",
    element: "Earth & Water",
    qualities: ["Calm", "Stable", "Nurturing", "Enduring"],
  },
  "vata+pitta": {
    gradient: "from-violet-500 to-orange-500",
    softBg: "bg-fuchsia-50 dark:bg-fuchsia-900/20",
    border: "border-fuchsia-200 dark:border-fuchsia-700/50",
    text: "text-fuchsia-700 dark:text-fuchsia-400",
    badge:
      "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-700/50",
    emoji: "🌪️",
    element: "Air, Space & Fire",
    qualities: ["Dynamic", "Passionate", "Versatile"],
  },
  "pitta+kapha": {
    gradient: "from-orange-500 to-teal-500",
    softBg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-700/50",
    text: "text-amber-700 dark:text-amber-400",
    badge:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/50",
    emoji: "🌋",
    element: "Fire, Water & Earth",
    qualities: ["Driven", "Nurturing", "Powerful"],
  },
  "vata+kapha": {
    gradient: "from-violet-500 to-teal-500",
    softBg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-200 dark:border-indigo-700/50",
    text: "text-indigo-700 dark:text-indigo-400",
    badge:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700/50",
    emoji: "🌊",
    element: "Air, Space, Earth & Water",
    qualities: ["Adaptable", "Steady", "Harmonious"],
  },
};

export const DASHBOARD_PROFILES = {
  vata: {
    gradient: "linear-gradient(to bottom right, #8b5cf6, #6366f1)",
    accent: "#8b5cf6",
  },
  pitta: {
    gradient: "linear-gradient(to bottom right, #f97316, #ef4444)",
    accent: "#f97316",
  },
  kapha: {
    gradient: "linear-gradient(to bottom right, #14b8a6, #10b981)",
    accent: "#14b8a6",
  },
  "vata+pitta": {
    gradient: "linear-gradient(to bottom right, #8b5cf6, #f97316)",
    accent: "#d946ef",
  },
  "pitta+kapha": {
    gradient: "linear-gradient(to bottom right, #f97316, #14b8a6)",
    accent: "#f59e0b",
  },
  "vata+kapha": {
    gradient: "linear-gradient(to bottom right, #8b5cf6, #14b8a6)",
    accent: "#6366f1",
  },
};
