// Discover Page configurations

export const DISCOVER_OPTIONS = [
  {
    key: "quiz",
    titleKey: "discover.opt1_title",
    descKey: "discover.opt1_desc",
    ctaKey: "discover.start_quiz",
    defaultTitle: "Take the Prakriti Quiz",
    defaultDesc: "Answer a few guided questions to identify your Ayurvedic body constitution.",
    defaultCta: "Start Quiz",
    path: "/quiz",
    colorGradient: "from-teal-500 to-emerald-600",
    hoverGradient: "hover:from-teal-600 hover:to-emerald-700",
    shadowColor: "shadow-teal-900/30",
  },
  {
    key: "manual",
    titleKey: "discover.opt2_title",
    descKey: "discover.opt2_desc",
    defaultTitle: "I Already Know My Dosha",
    defaultDesc: "Select your dosha directly and continue to your personalized results.",
  },
];

export const DISCOVER_DOSHAS = [
  {
    dosha: "Vata",
    labelKey: "doshas.vata",
    defaultLabel: "Vata",
    icon: "🌬️",
    colorClass: "bg-violet-900/40 text-violet-400",
  },
  {
    dosha: "Pitta",
    labelKey: "doshas.pitta",
    defaultLabel: "Pitta",
    icon: "🔥",
    colorClass: "bg-orange-900/40 text-orange-400",
  },
  {
    dosha: "Kapha",
    labelKey: "doshas.kapha",
    defaultLabel: "Kapha",
    icon: "🌿",
    colorClass: "bg-teal-900/40 text-teal-400",
  },
];
