import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthInput } from "./AuthInput";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useTranslation } from "react-i18next";

export const SignupForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = t("auth.signup.errors.name_req");
    if (!formData.email) {
      newErrors.email = t("auth.signup.errors.email_req");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("auth.signup.errors.email_inv");
    }
    if (!formData.password) {
      newErrors.password = t("auth.signup.errors.password_req");
    } else if (formData.password.length < 6) {
      newErrors.password = t("auth.signup.errors.password_len");
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.signup.errors.confirm_req");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.signup.errors.confirm_match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setErrors({
            submit: errorData.detail || t("auth.signup.errors.failed"),
          });
          return;
        }

        try {
          const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });

          if (loginRes.ok) {
            const loginData = await loginRes.json();

            localStorage.setItem("token", loginData.access_token);
            localStorage.setItem("userId", String(loginData.user_id));
            localStorage.setItem("userName", loginData.name);
            localStorage.setItem("userEmail", loginData.email);
            localStorage.setItem("marinzen_auth", "true");

            localStorage.removeItem("prakritiQuizState");
            navigate("/discover");
          } else {
            console.error("Auto-login failed after signup");
            setErrors({ submit: t("auth.signup.errors.success_login") });
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Auto-login request failed:", err);
          setErrors({ submit: t("auth.signup.errors.success_login") });
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Signup request failed:", error);
        setErrors({ submit: t("auth.signup.errors.network") });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center">
      {errors.submit && (
        <div className="w-full mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
          {errors.submit}
        </div>
      )}
      <AuthInput
        label={t("auth.signup.name_label")}
        id="name"
        type="text"
        placeholder={t("auth.signup.name_placeholder")}
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />
      <AuthInput
        label={t("auth.signup.email_label")}
        id="email"
        type="email"
        placeholder={t("auth.signup.email_placeholder")}
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />
      <AuthInput
        label={t("auth.signup.password_label")}
        id="password"
        type="password"
        placeholder={t("auth.signup.password_placeholder")}
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />
      <AuthInput
        label={t("auth.signup.confirm_label")}
        id="confirmPassword"
        type="password"
        placeholder={t("auth.signup.confirm_placeholder")}
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full py-6 text-md font-semibold shadow-md shadow-orange-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t("auth.signup.signing_up")}
          </>
        ) : (
          t("auth.signup.sign_up")
        )}
      </Button>
    </form>
  );
};

export default SignupForm;
