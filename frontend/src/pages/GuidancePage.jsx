import React from "react";
import RecommendationLayout from "@/components/recommendations/RecommendationLayout";
import { BookOpen } from "lucide-react";

const GuidancePage = () => {
  return (
    <RecommendationLayout
      category="Ayurvedic Guide"
      title="Ayurvedic Guidance"
      subtitle="Ancient Wisdom"
      icon={BookOpen}
      colorClass="rose"
      gradientFrom="from-rose-500"
      gradientTo="to-pink-600"
      bgBlurColor="bg-rose-200/20"
      proTip="Listen to your body; it speaks in whispers before it shouts in pain."
    />
  );
};

export default GuidancePage;
