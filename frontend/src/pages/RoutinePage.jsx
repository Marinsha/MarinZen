import React from "react";
import RecommendationLayout from "@/components/recommendations/RecommendationLayout";
import { Clock } from "lucide-react";

const RoutinePage = () => {
  return (
    <RecommendationLayout
      category="Routine"
      title="Daily Routine"
      subtitle="The Rhythm of Life"
      icon={Clock}
      colorClass="amber"
      gradientFrom="from-amber-500"
      gradientTo="to-orange-600"
      bgBlurColor="bg-amber-200/20"
      proTip="Consistency in your daily ritual is the foundation of mental clarity."
    />
  );
};

export default RoutinePage;
