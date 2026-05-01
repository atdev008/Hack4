"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/context";
import { Map, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import OnboardingGuide from "./OnboardingGuide";

interface AuthScreenProps {
  onLoginEmail: (email: string, password: string) => void;
  onSignupEmail: (name: string, email: string, password: string) => void;
  onLoginProvider: (provider: "google" | "microsoft" | "apple") => void;
  error?: string | null;
}

export default function AuthScreen({ onLoginEmail, onSignupEmail, onLoginProvider, error }: AuthScreenProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      onSignupEmail(name, email, password);
    } else {
      onLoginEmail(email, password);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Onboarding Guide */}
      <OnboardingGuide onSwitchToSignup={() => setMode("signup")} mode={mode} />
      {/* Top section with gradient */}
      <div
        className="relative px-6 pt-14 pb-10"
        style={{ background: "linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #A78BFA 100%)" }}
      >
        {/* Language toggle */}
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            <Map size={24} strokeWidth={2} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">MoodQuest</h1>
            <p className="text-[12px] font-medium text-white" style={{ opacity: 0.8 }}>Thailand</p>
          </div>
        </div>

        {/* Welcome text */}
        <h2 className="text-xl font-bold text-white mb-1">
          {mode === "login"
            ? (isEn ? "Welcome back!" : "ยินดีต้อนรับกลับ!")
            : (isEn ? "Create account" : "สร้างบัญชีใหม่")}
        </h2>
        <p className="text-[14px] text-white" style={{ opacity: 0.8 }}>
          {mode === "login"
            ? (isEn ? "Sign in to continue your adventure" : "เข้าสู่ระบบเพื่อเที่ยวต่อ")
            : (isEn ? "Start your mood-based travel journey" : "เริ่มต้นการเที่ยวตาม mood")}
        </p>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white" style={{ borderRadius: "24px 24px 0 0" }} />
      </div>

      {/* Form section */}
      <div className="flex-1 px-6 -mt-1">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 animate-fade-in" style={{ background: "#FEF2F2", color: "#DC2626" }}>
            <AlertCircle size={16} strokeWidth={2} />
            <span className="text-[13px] font-medium">{error}</span>
          </div>
        )}

        {/* OAuth buttons */}
        <div className="space-y-2.5 mb-5">
          <button
            onClick={() => onLoginProvider("google")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
            style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border-light)" }}
          >
            <GoogleIcon />
            <span className="text-[14px] font-medium flex-1 text-left">
              {isEn ? "Continue with Google" : "ดำเนินการต่อด้วย Google"}
            </span>
            <ArrowRight size={16} strokeWidth={2} style={{ color: "var(--color-text-tertiary)" }} />
          </button>

          <button
            onClick={() => onLoginProvider("microsoft")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
            style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border-light)" }}
          >
            <MicrosoftIcon />
            <span className="text-[14px] font-medium flex-1 text-left">
              {isEn ? "Continue with Microsoft" : "ดำเนินการต่อด้วย Microsoft"}
            </span>
            <ArrowRight size={16} strokeWidth={2} style={{ color: "var(--color-text-tertiary)" }} />
          </button>

          <button
            onClick={() => onLoginProvider("apple")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
            style={{ background: "#000", color: "white" }}
          >
            <AppleIcon />
            <span className="text-[14px] font-medium flex-1 text-left">
              {isEn ? "Continue with Apple" : "ดำเนินการต่อด้วย Apple"}
            </span>
            <ArrowRight size={16} strokeWidth={2} style={{ opacity: 0.5 }} />
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
          <span className="text-[12px] font-medium" style={{ color: "var(--color-text-tertiary)" }}>
            {isEn ? "or use email" : "หรือใช้อีเมล"}
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative animate-fade-in">
              <User size={18} strokeWidth={1.8} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
              <input
                id="auth-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isEn ? "Full name" : "ชื่อ-นามสกุล"}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-[14px] outline-none transition-all focus:ring-2"
                style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border-light)",  }}
              />
            </div>
          )}

          <div className="relative">
            <Mail size={18} strokeWidth={1.8} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
            <input
              id="auth-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isEn ? "Email address" : "อีเมล"}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-[14px] outline-none transition-all focus:ring-2"
              style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border-light)",  }}
            />
          </div>

          <div className="relative">
            <Lock size={18} strokeWidth={1.8} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
            <input
              id="auth-password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEn ? "Password" : "รหัสผ่าน"}
              required
              minLength={6}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl text-[14px] outline-none transition-all focus:ring-2"
              style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border-light)",  }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword
                ? <EyeOff size={18} strokeWidth={1.8} style={{ color: "var(--color-text-tertiary)" }} />
                : <Eye size={18} strokeWidth={1.8} style={{ color: "var(--color-text-tertiary)" }} />}
            </button>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full py-4 rounded-2xl text-[15px] font-semibold text-white transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
            }}
          >
            {mode === "login"
              ? (isEn ? "Sign In" : "เข้าสู่ระบบ")
              : (isEn ? "Create Account" : "สร้างบัญชี")}
          </button>
        </form>

        {/* Toggle login/signup */}
        <div className="text-center mt-5 mb-8">
          <span className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
            {mode === "login"
              ? (isEn ? "Don't have an account? " : "ยังไม่มีบัญชี? ")
              : (isEn ? "Already have an account? " : "มีบัญชีอยู่แล้ว? ")}
          </span>
          <button
            id="auth-signup-link"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-[13px] font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            {mode === "login"
              ? (isEn ? "Sign Up" : "สมัครสมาชิก")
              : (isEn ? "Sign In" : "เข้าสู่ระบบ")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Provider Icons (SVG) ─── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

