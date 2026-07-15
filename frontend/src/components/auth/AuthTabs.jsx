import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { useTranslation } from "react-i18next";

export const AuthTabs = () => {
  const [activeTab, setActiveTab] = useState("login");
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex bg-black/5 dark:bg-stone-900/50 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
            activeTab === "login"
              ? "bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-500 shadow-sm"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          }`}
        >
          {t("auth.tabs.login")}
        </button>
        <button
          onClick={() => setActiveTab("signup")}
          className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
            activeTab === "signup"
              ? "bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-500 shadow-sm"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          }`}
        >
          {t("auth.tabs.signup")}
        </button>
      </div>

      <div className="bg-white/60 dark:bg-stone-800/40 backdrop-blur-md border border-stone-200/50 dark:border-stone-700/50 rounded-2xl p-6 sm:p-8 shadow-xl">
        {activeTab === "login" ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
};

export default AuthTabs;
