import Container from "@/components/Container";
import GlassCard from "@/components/GlassCard";
import ButtonLink from "@/components/ButtonLink";

export default function Inkasso() {
  return (
    <Container>
      <GlassCard>
        <h1>Inkasso</h1>
        <p>Hovedsiden for inkassohjelp. Velg et verktøy eller en ressurs.</p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <ButtonLink href="/inkasso/wizard">Wizard</ButtonLink>
          <ButtonLink href="/inkasso/faq" variant="ghost">FAQ</ButtonLink>
          <ButtonLink href="/inkasso/seo" variant="ghost">Alle artikler</ButtonLink>
        </div>
      </GlassCard>
    </Container>
  );
}
