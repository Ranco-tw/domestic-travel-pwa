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

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-end bg-[linear-gradient(180deg,rgba(247,243,234,0.25),rgba(247,243,234,0.98)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center px-5 py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-2xl bg-card shadow-soft">
            <span className="text-4xl">▣</span>
          </div>
          <h1 className="text-4xl font-black tracking-normal">旅途收藏</h1>
          <p className="mt-3 text-sm font-semibold text-muted">收藏回憶，規劃屬於我們的旅程</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card/95 p-5 shadow-soft backdrop-blur">
          <h2 className="mb-4 text-2xl font-bold">登入</h2>
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
        </form>
      </div>
    </main>
  );
}
