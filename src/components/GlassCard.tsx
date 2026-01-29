import { ReactNode } from "react";

export default function GlassCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        backdropFilter: "blur(var(--blur))",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: "2rem",
        boxShadow: "var(--shadow)",
      }}
    >
      {children}
    </div>
  );
}
