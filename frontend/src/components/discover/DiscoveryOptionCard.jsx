export const DiscoveryOptionCard = ({ title, description, children }) => {
  return (
    <div className="w-full bg-white/60 dark:bg-stone-800/40 backdrop-blur-md border border-stone-200/50 dark:border-stone-700/50 rounded-3xl p-8 flex flex-col shadow-xl hover:shadow-2xl transition-all duration-300 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-stone-800 to-stone-500 dark:from-stone-100 dark:to-stone-400 mb-3">
        {title}
      </h2>
      <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
        {description}
      </p>

      <div className="w-full flex-1 flex flex-col justify-end">{children}</div>
    </div>
  );
};

export default DiscoveryOptionCard;
