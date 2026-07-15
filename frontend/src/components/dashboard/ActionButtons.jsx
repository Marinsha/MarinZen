import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CalendarModal from "./CalendarModal";

const ActionButtons = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarOpen && popoverRef.current && !popoverRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [calendarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("marinzen_auth");
    localStorage.removeItem("prakritiQuizState");
    navigate("/auth");
  };

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <div className="relative" ref={popoverRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCalendarOpen(!calendarOpen)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors rounded-xl font-medium px-2 sm:px-3"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden md:inline">{t("dashboard.ritual_tracker", "Ritual Tracker")}</span>
        </Button>

        <CalendarModal 
          isOpen={calendarOpen} 
          onClose={() => setCalendarOpen(false)} 
          user={user} 
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="flex items-center gap-2 text-stone-400 hover:text-rose-500 transition-colors rounded-xl font-medium px-2 sm:px-3"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">{t("dashboard.logout", "Logout")}</span>
      </Button>
    </div>
  );
};

export default ActionButtons;
