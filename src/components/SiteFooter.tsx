import Link from "next/link";
import Container from "./Container";

export default function SiteFooter() {
  return (
    <footer
      style={{
        padding: "2rem 0",
        marginTop: "auto",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <Container>
        <nav style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
          <Link href="/personvern">Personvern</Link>
          <Link href="/vilkar">Vilkår</Link>
          <Link href="/kontakt">Kontakt</Link>
        </nav>
      </Container>
    </footer>
  );
}
