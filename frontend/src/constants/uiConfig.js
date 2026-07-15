export const FONT_URL = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap";

export const GLOBAL_GLOWS = {
  intro: [
    { className: "absolute -top-32 -left-32 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-orange-900/20 blur-3xl opacity-60" },
    { className: "absolute bottom-10 right-10 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full bg-amber-900/10 blur-3xl opacity-50" },
  ],
  discover: [
    { className: "absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-teal-900/10 blur-3xl opacity-50" },
    { className: "absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-orange-900/10 blur-3xl opacity-40" },
  ],
  auth: [
    { className: "absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-amber-900/10 blur-3xl opacity-60" },
    { className: "absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-900/10 blur-3xl opacity-40" },
  ],
  quiz: [
    { className: "absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-violet-200/30 dark:bg-violet-900/20 blur-3xl" },
    { className: "absolute -bottom-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-orange-200/30 dark:bg-orange-900/20 blur-3xl" },
    { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-amber-100/20 dark:bg-amber-900/10 blur-3xl" },
  ]
};
