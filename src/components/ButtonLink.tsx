import Link from "next/link";
import { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  const baseStyle = {
    display: "inline-block",
    padding: "0.75rem 1.5rem",
    borderRadius: "var(--radius-sm)",
    fontWeight: 500,
    transition: "all 0.2s",
  };

  const variants = {
    primary: {
      ...baseStyle,
      background: "var(--color-primary)",
      color: "#fff",
    },
    ghost: {
      ...baseStyle,
      background: "transparent",
      color: "var(--color-primary)",
      border: "1px solid var(--color-border)",
    },
  };

  return (
    <Link href={href} style={variants[variant]}>
      {children}
    </Link>
  );
}
