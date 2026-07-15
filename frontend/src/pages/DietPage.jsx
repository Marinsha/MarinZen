import React from "react";
import RecommendationLayout from "@/components/recommendations/RecommendationLayout";
import { Utensils } from "lucide-react";

const DietPage = () => {
  return (
    <RecommendationLayout
      category="Diet"
      title="Dietary Nourishment"
      subtitle="Nutritional Harmony"
      icon={Utensils}
      colorClass="green"
      gradientFrom="from-green-600"
      gradientTo="to-emerald-500"
      bgBlurColor="bg-green-200/20"
      proTip="Eating with gratitude and sitting down increases your Ojas (vitality)."
    />
  );
};

export default DietPage;
