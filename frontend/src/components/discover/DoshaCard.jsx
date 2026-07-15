export const DoshaCard = ({ dosha, label, icon, colorClass, onClick }) => {
  return (
    <button
      onClick={() => onClick(dosha)}
      className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-4 rounded-xl border border-stone-200/50 dark:border-stone-700/50 bg-white/50 hover:bg-white/80 dark:bg-stone-800/40 dark:hover:bg-stone-800/80 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] group"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-colors duration-300 ${colorClass}`}
      >
        <span className="text-xl">{icon}</span>
      </div>
      <span className="text-stone-700 font-semibold tracking-wide group-hover:text-stone-900 dark:text-stone-300 dark:group-hover:text-stone-100 transition-colors">
        {label || dosha}
      </span>
    </button>
  );
};

export default DoshaCard;
