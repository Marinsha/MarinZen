import React, { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useTranslation } from "react-i18next";

const ProfileSection = ({ userName }) => {
  const { t } = useTranslation();
  const [avatar, setAvatar] = useState(() => localStorage.getItem("userAvatar"));
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setAvatar(base64String);
        localStorage.setItem("userAvatar", base64String);

        const token = localStorage.getItem("token");
        if (token) {
          try {
            await fetch(`${API_BASE_URL}/auth/avatar`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ avatar: base64String }),
            });
          } catch (err) {
            console.error("Failed to save avatar to backend:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 group">
      <div className="relative">
        <div 
          onClick={() => fileInputRef.current.click()}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-teal-50 to-emerald-50 dark:from-stone-800 dark:to-stone-700 border border-teal-100 dark:border-stone-600 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-500/30 transition-all shadow-sm"
        >
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-teal-600 dark:text-teal-400 font-bold text-lg">
              {userName?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wider">{t("dashboard.welcome_back", "Welcome back,")}</span>
        <span className="text-sm sm:text-md font-bold text-stone-800 dark:text-stone-100 truncate max-w-[120px] sm:max-w-[200px]">
          {userName || "User"}
        </span>
      </div>
    </div>
  );
};

export default ProfileSection;
