import Link from "next/link";
import Container from "./Container";

export default function SiteHeader() {
  return (
    <header
      style={{
        padding: "1rem 0",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        backdropFilter: "blur(var(--blur))",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Container>
        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 600 }}>
            Inkasso-hjelp
          </Link>
          <div style={{ display: "flex", gap: "1.5rem", marginLeft: "auto" }}>
            <Link href="/">Hjem</Link>
            <Link href="/kategorier">Kategorier</Link>
            <Link href="/inkasso">Inkasso</Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}
