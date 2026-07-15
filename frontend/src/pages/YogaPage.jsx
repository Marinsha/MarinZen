import React from "react";
import RecommendationLayout from "@/components/recommendations/RecommendationLayout";
import { Zap } from "lucide-react";

const YogaPage = () => {
  return (
    <RecommendationLayout
      category="Yoga"
      title="Yoga & Movement"
      subtitle="Physical Equilibrium"
      icon={Zap}
      colorClass="blue"
      gradientFrom="from-blue-600"
      gradientTo="to-indigo-500"
      bgBlurColor="bg-blue-200/20"
      proTip="The best time for yoga is early morning when the world is still."
    />
  );
};

export default YogaPage;
