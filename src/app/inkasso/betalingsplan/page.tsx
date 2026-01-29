import Container from "@/components/Container";
import GlassCard from "@/components/GlassCard";
import ButtonLink from "@/components/ButtonLink";

export default function Betalingsplan() {
  return (
    <Container>
      <GlassCard>
        <h1>Få hjelp med betalingsplan</h1>
        <p>
          Plassholder: Her hjelper vi deg å foreslå en realistisk betalingsplan
          og skrive en henvendelse.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <ButtonLink href="/inkasso/wizard">Tilbake til sjekken</ButtonLink>
        </div>
      </GlassCard>
    </Container>
  );
}
