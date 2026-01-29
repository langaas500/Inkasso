import Container from "@/components/Container";
import GlassCard from "@/components/GlassCard";
import ButtonLink from "@/components/ButtonLink";

export default function Kategorier() {
  return (
    <Container>
      <GlassCard>
        <h1>Kategorier</h1>
        <p>Velg en kategori for å finne relevant hjelp.</p>
        <div style={{ marginTop: "1.5rem" }}>
          <ButtonLink href="/inkasso">Inkasso</ButtonLink>
        </div>
      </GlassCard>
    </Container>
  );
}
