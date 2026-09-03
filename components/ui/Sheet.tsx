"use client";

import { X } from "lucide-react";
import { Button } from "./Button";

interface SheetProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sheet({ title, open, onClose, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 px-3 pb-3">
      <section className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button aria-label="關閉" variant="ghost" className="min-h-9 px-2" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
