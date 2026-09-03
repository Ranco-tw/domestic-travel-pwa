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
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-[#efe3cc] px-7 pb-8 pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[64%] bg-[linear-gradient(180deg,#fbf0dc_0%,#eff0df_25%,#bfd9d9_54%,#f2d6ad_100%)]" />
          <div className="absolute left-[-24%] top-[17%] h-44 w-80 rounded-[50%] bg-[#98a886]/55 blur-[2px]" />
          <div className="absolute right-[-26%] top-[19%] h-48 w-80 rounded-[50%] bg-[#879d98]/60 blur-[2px]" />
          <div className="absolute left-[-16%] top-[33%] h-20 w-[132%] rounded-[50%] bg-[#bad1ce]/85" />
          <div className="absolute left-[-14%] top-[38%] h-20 w-[128%] rounded-[50%] bg-[#d8e3d7]/85" />
          <div className="absolute right-[18%] top-[13%] h-[92px] w-10 rounded-t-full bg-[#f4f0e7] shadow-sm" />
          <div className="absolute right-[15.5%] top-[11.8%] h-4 w-14 rounded-sm bg-[#a86345]" />
          <div className="absolute right-[21%] top-[15.5%] h-3 w-5 rounded-sm bg-[#7f9a9a]" />
          <div className="absolute bottom-0 left-[-22%] h-[34%] w-[145%] rounded-t-[50%] bg-[#d8ba83]" />
          <div className="absolute bottom-0 left-[-10%] h-[25%] w-[124%] rounded-t-[48%] bg-[#87945c]" />
          <div className="absolute bottom-[8%] left-[12%] h-[3px] w-[78%] rounded-full bg-[#766e5e]" />
          <div className="absolute bottom-[9%] left-[10%] h-10 w-[76%] rounded-t-2xl bg-[#eee9dc] shadow-md" />
          <div className="absolute bottom-[10.2%] left-[13%] h-6 w-[28%] rounded-md bg-[#b6543f]" />
          <div className="absolute bottom-[10.2%] left-[43%] h-6 w-[34%] rounded-md bg-[#d9d8cf]" />
          <div className="absolute bottom-[10.2%] left-[79%] h-6 w-[8%] rounded-r-lg bg-[#32322e]" />
          <div className="absolute left-[12%] top-[9%] text-2xl text-[#8c8b7d]">⌁</div>
          <div className="absolute left-[25%] top-[12%] text-xl text-[#8c8b7d]">⌁</div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,243,234,0.03),rgba(247,243,234,0.28)_27%,rgba(247,243,234,0.82)_57%,rgba(247,243,234,0.74))]" />

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
