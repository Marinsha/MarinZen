import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const AuthInput = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col space-y-1.5 mb-4 w-full">
      <label
        htmlFor={id}
        className="text-sm font-medium text-stone-700 dark:text-stone-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-white/50 dark:bg-stone-900/50 border ${
            error
              ? "border-rose-500"
              : "border-stone-200/50 dark:border-stone-700/50"
          } text-stone-900 dark:text-stone-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-rose-400 mt-1">{error}</span>}
    </div>
  );
};

export default AuthInput;
