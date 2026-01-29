import Link from "next/link";
import Container from "@/components/Container";
import GlassCard from "@/components/GlassCard";

const articles = [
  { href: "/inkasso/bestride-inkassokrav", title: "Bestride inkassokrav" },
  { href: "/inkasso/betalingsanmerkning", title: "Betalingsanmerkning" },
  { href: "/inkasso/inkassovarsel", title: "Inkassovarsel" },
  { href: "/inkasso/betalingsoppfordring", title: "Betalingsoppfordring" },
  { href: "/inkasso/foreldelse", title: "Foreldelse" },
  { href: "/inkasso/nedbetalingsavtale", title: "Nedbetalingsavtale" },
  { href: "/inkasso/feil-krav", title: "Feil krav" },
];

export default function SEO() {
  return (
    <Container>
      <GlassCard>
        <h1>Artikler om inkasso</h1>
        <p>Les mer om ulike tema knyttet til inkasso.</p>
        <ul style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {articles.map((a) => (
            <li key={a.href}>
              <Link href={a.href} style={{ color: "var(--color-primary)" }}>
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </GlassCard>
    </Container>
  );
}
