import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import AuthTabs from "@/components/auth/AuthTabs";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <main className="min-h-screen px-4 py-16 sm:py-0 flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden w-full">
      <div className="pointer-events-none absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-amber-900/10 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-900/10 blur-3xl opacity-40" />

      <div className="absolute top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("auth.back")}
        </Button>
      </div>

      <div className="w-full max-w-md z-10 flex flex-col items-center justify-center my-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500 mb-2 mt-4">
            {t("auth.welcome")}
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            {t("auth.subtitle")}
          </p>
        </div>

        <AuthTabs />
      </div>
    </main>
  );
};

export default AuthPage;
