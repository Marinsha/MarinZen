import React from "react";
import ProfileSection from "./ProfileSection";
import DoshaBadge from "./DoshaBadge";
import ActionButtons from "./ActionButtons";

const DashboardTopBar = ({ user }) => {
  return (
    <header className="w-full bg-white/70 dark:bg-stone-900/50 backdrop-blur-xl border-b border-stone-200 dark:border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <ProfileSection userName={user?.name} />
        </div>
        <div className="flex-1 flex justify-center">
          <DoshaBadge dosha={user?.dosha} />
        </div>
        <div className="flex-1 flex justify-end">
          <ActionButtons user={user} />
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
