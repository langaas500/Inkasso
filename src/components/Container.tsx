import { ReactNode } from "react";

export default function Container({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "0 1.5rem",
      }}
    >
      {children}
    </div>
  );
}
