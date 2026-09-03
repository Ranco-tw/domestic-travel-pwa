"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setAccount(localStorage.getItem("travel-pwa-account") ?? "");
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (remember) localStorage.setItem("travel-pwa-account", account);
    localStorage.setItem("travel-pwa-session", "true");
    onLogin();
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-[url('/login-background.png')] bg-cover bg-center px-7 pb-8 pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,243,234,0.04),rgba(247,243,234,0.18)_30%,rgba(247,243,234,0.58)_48%,rgba(247,243,234,0.42)_100%)]" />
        <div className="relative mt-[9vh] text-center">
          <div className="mx-auto mb-7 grid h-[86px] w-[86px] place-items-center rounded-[24px] bg-card shadow-soft">
            <div className="relative h-11 w-11 rounded-md bg-[#59683a] shadow-inner">
              <div className="absolute left-2 top-[-9px] h-4 w-7 rounded-t-lg border-[3px] border-[#59683a] bg-transparent" />
              <div className="absolute inset-y-0 left-[18px] w-[3px] bg-[#a87545]/70" />
              <div className="absolute bottom-2 right-1 text-lg leading-none text-[#d97b55]">♥</div>
            </div>
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
          <label className="my-5 flex items-center gap-3 text-[15px] font-bold text-[#74695c]">
            <input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" />
            記住帳號密碼
          </label>
          <Button className="h-[60px] w-full text-lg" type="submit">
            開始規劃
          </Button>
        </form>
      </div>
    </main>
  );
}
