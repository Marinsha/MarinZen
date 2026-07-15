import React from "react";

const CategoryHeader = ({ title, description, icon, accentColor }) => {
  return (
    <div className="mb-8 p-6 rounded-3xl bg-white/50 dark:bg-stone-900/40 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 shadow-sm overflow-hidden relative group">
      {/* Decorative accent behind icon */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner-sm"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          {icon}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2 font-serif tracking-tight">
            {title}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;
