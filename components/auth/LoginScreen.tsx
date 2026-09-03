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
    if (!account || !password) return;
    if (remember) localStorage.setItem("travel-pwa-account", account);
    localStorage.setItem("travel-pwa-session", "true");
    onLogin();
  }

  function handleDemoLogin() {
    localStorage.setItem("travel-pwa-account", "demo");
    localStorage.setItem("travel-pwa-session", "true");
    onLogin();
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-end overflow-hidden bg-[#efe3cc] px-5 pb-8 pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[63%] bg-[linear-gradient(180deg,#f8efd9_0%,#e9eddc_31%,#cddfdc_52%,#edd2b1_100%)]" />
          <div className="absolute left-[-20%] top-[18%] h-52 w-80 rounded-[55%] bg-[#9aa987]/55 blur-sm" />
          <div className="absolute right-[-28%] top-[19%] h-56 w-96 rounded-[55%] bg-[#899f9c]/60 blur-sm" />
          <div className="absolute left-[-8%] top-[35%] h-24 w-[120%] rounded-[50%] bg-[#b8cec8]/85" />
          <div className="absolute left-[-15%] top-[41%] h-20 w-[130%] rounded-[50%] bg-[#cfddd2]/85" />
          <div className="absolute right-12 top-[14%] h-24 w-10 rounded-t-full bg-[#f3f0e8] shadow-sm" />
          <div className="absolute right-10 top-[12.5%] h-4 w-14 rounded-sm bg-[#a96243]" />
          <div className="absolute bottom-0 left-[-18%] h-[32%] w-[135%] rounded-t-[50%] bg-[#d5b98a]" />
          <div className="absolute bottom-0 left-[-10%] h-[24%] w-[120%] rounded-t-[50%] bg-[#8e9862]" />
          <div className="absolute bottom-[8.5%] left-[15%] h-2 w-[76%] rounded-full bg-[#766d5f]" />
          <div className="absolute bottom-[9.5%] left-[13%] h-9 w-[72%] rounded-t-2xl bg-[#ede8dc] shadow-md" />
          <div className="absolute bottom-[10.8%] left-[15%] h-5 w-[25%] rounded-md bg-[#b6513d]" />
          <div className="absolute bottom-[10.8%] left-[42%] h-5 w-[33%] rounded-md bg-[#d8d8d0]" />
          <div className="absolute bottom-[10.8%] left-[77%] h-5 w-[8%] rounded-r-lg bg-[#32312d]" />
          <div className="absolute left-[14%] top-[8%] text-2xl text-[#8c8b7d]">⌁</div>
          <div className="absolute left-[26%] top-[12%] text-xl text-[#8c8b7d]">⌁</div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,243,234,0.02),rgba(247,243,234,0.58)_43%,rgba(247,243,234,0.92)_67%,rgba(247,243,234,0.86))]" />
        <div className="relative mb-9 text-center">
          <div className="mx-auto mb-5 grid h-[88px] w-[88px] place-items-center rounded-3xl bg-card shadow-soft">
            <span className="text-5xl">▣</span>
          </div>
          <h1 className="text-[42px] font-black leading-none tracking-normal">旅途收藏</h1>
          <p className="mt-3 text-sm font-semibold text-muted">收藏回憶，規劃屬於我們的旅程</p>
        </div>

        <form onSubmit={handleSubmit} className="relative mb-[29%] rounded-2xl border border-border bg-card/95 p-5 shadow-soft backdrop-blur">
          <h2 className="mb-5 text-2xl font-bold">登入</h2>
          <label className="mb-3 flex min-h-12 items-center gap-3 rounded-lg border border-border bg-white/50 px-3 dark:bg-black/10">
            <User size={18} className="text-muted" />
            <input
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="帳號"
            />
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-white/50 px-3 dark:bg-black/10">
            <Lock size={18} className="text-muted" />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full bg-transparent outline-none"
              placeholder="密碼"
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="顯示密碼">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>
          <label className="my-4 flex items-center gap-2 text-sm text-muted">
            <input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" />
            記住帳號密碼
          </label>
          <Button className="w-full" type="submit">
            開始規劃
          </Button>
          <Button className="mt-3 w-full border-dashed" type="button" variant="secondary" onClick={handleDemoLogin}>
            使用測試帳號進入
          </Button>
        </form>
      </div>
    </main>
  );
}
