"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface LoginScreenProps {
  onLogin: () => void | Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAccount(localStorage.getItem("travel-pwa-account") ?? "");
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const normalizedAccount = account.trim();
    const email = normalizedAccount.includes("@") ? normalizedAccount : `${normalizedAccount}@example.com`;
    const supabase = createBrowserSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("帳號或密碼不正確");
      setIsSubmitting(false);
      return;
    }

    if (remember) localStorage.setItem("travel-pwa-account", account.trim());
    else localStorage.removeItem("travel-pwa-account");
    await onLogin();
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-[url('/login-background.png')] bg-cover bg-center px-7 pb-8 pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,243,234,0.04),rgba(247,243,234,0.18)_30%,rgba(247,243,234,0.58)_48%,rgba(247,243,234,0.42)_100%)]" />
        <div className="relative mt-[9vh] text-center">
          <div className="mx-auto mb-7 h-[86px] w-[86px] overflow-hidden rounded-[24px] bg-card shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/login-icon.png" alt="旅途收藏" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-[40px] font-black leading-none tracking-normal text-[#2f261f]">旅途收藏</h1>
          <p className="mt-4 text-[15px] font-bold text-[#64594d]">收藏回憶，規劃屬於我們的旅程</p>
        </div>

        <form onSubmit={handleSubmit} className="relative mt-11 rounded-[18px] border border-[#e4d7c4] bg-[#fffdf8]/95 p-5 shadow-soft backdrop-blur">
          <h2 className="mb-6 text-[28px] font-black text-[#2f261f]">登入</h2>
          <label className="mb-4 flex min-h-[58px] items-center gap-3 rounded-lg border border-[#ddd2c4] bg-white/55 px-4">
            <User size={18} className="text-muted" />
            <input
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#8b8277]"
              placeholder="帳號"
            />
          </label>
          <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#ddd2c4] bg-white/55 px-4">
            <Lock size={18} className="text-muted" />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#8b8277]"
              placeholder="密碼"
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="顯示密碼">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>
          {error ? <p className="mt-3 text-sm font-bold text-red-700">{error}</p> : null}
          <label className="my-5 flex items-center gap-3 text-[15px] font-bold text-[#74695c]">
            <input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" />
            記住帳號密碼
          </label>
          <Button className="h-[60px] w-full text-lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登入中..." : "開始規劃"}
          </Button>
        </form>
      </div>
    </main>
  );
}
