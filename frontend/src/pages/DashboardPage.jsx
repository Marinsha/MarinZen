import React, { useEffect, useState } from "react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import FeatureCard from "@/components/dashboard/FeatureCard";
import DailyTaskRitual from "@/components/dashboard/DailyTaskRitual";
import DoshaPieChart from "@/components/dashboard/DoshaPieChart";
import { Utensils, Zap, Clock, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

const DashboardPage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedDosha = localStorage.getItem("marinZenUserDosha");
    const userId = localStorage.getItem("userId");

    setUser({
      id: userId,
      name: storedName || "Explorer",
      dosha: storedDosha || "Vata",
    });
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-300 flex flex-col">
      <DashboardTopBar user={user} />

      <main className="flex-grow w-full flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 py-16">
        <div className="w-full max-w-[1800px] mx-auto">
          <DoshaPieChart />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24 w-full mb-24">
            <FeatureCard
              icon={Utensils}
              title={t("dashboard.features.diet.title", "Diet")}
              quote={t("dashboard.features.diet.quote", "Nourish your inner fire")}
              points={[
                t("dashboard.features.diet.p1", "Warm Rice"),
                t("dashboard.features.diet.p2", "Ginger Tea"),
                t("dashboard.features.diet.p3", "Fresh Fruit")
              ]}
              color="green"
              link="/diet"
            />
            <FeatureCard
              icon={Zap}
              title={t("dashboard.features.yoga.title", "Yoga")}
              quote={t("dashboard.features.yoga.quote", "Harmonize body and soul")}
              points={[
                t("dashboard.features.yoga.p1", "Morning Flow"),
                t("dashboard.features.yoga.p2", "Deep Breath"),
                t("dashboard.features.yoga.p3", "Sun Salutation")
              ]}
              color="blue"
              link="/yoga"
            />
            <FeatureCard
              icon={Clock}
              title={t("dashboard.features.routine.title", "Routine")}
              quote={t("dashboard.features.routine.quote", "The rhythm of wellness")}
              points={[
                t("dashboard.features.routine.p1", "Early Sleep"),
                t("dashboard.features.routine.p2", "Oil Massage"),
                t("dashboard.features.routine.p3", "Morning Ritual")
              ]}
              color="amber"
              link="/routine"
            />
            <FeatureCard
              icon={BookOpen}
              title={t("dashboard.features.guide.title", "Ayurvedic Guide")}
              quote={t("dashboard.features.guide.quote", "Ancient wisdom, modern life")}
              points={[
                t("dashboard.features.guide.p1", "Herbal Care"),
                t("dashboard.features.guide.p2", "Dosha Balance"),
                t("dashboard.features.guide.p3", "Self Love")
              ]}
              color="rose"
              link="/guidance"
            />
          </div>

          <DailyTaskRitual user={user} />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
