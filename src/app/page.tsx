// src/app/page.tsx
import Link from "next/link";
import Container from "@/components/Container";
import GlassCard from "@/components/GlassCard";
import ButtonLink from "@/components/ButtonLink";

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section
        aria-label="Inkasso-hjelp hero"
        style={{
          position: "relative",
          padding: "4.25rem 0",
          overflow: "hidden",
        }}
      >
        {/* Background image (replace path later) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/hero/inkasso-trygghet..png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "saturate(0.95)",
            transform: "scale(1.03)",
          }}
        />

        {/* Dark overlay for readability */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(6,16,28,0.82) 0%, rgba(6,16,28,0.58) 46%, rgba(6,16,28,0.18) 100%)",
          }}
        />

        {/* Subtle vignette */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1200px 600px at 20% 30%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%)",
            pointerEvents: "none",
          }}
        />

        <Container>
          <div
            className="_heroGrid"
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "1.75rem",
              alignItems: "center",
            }}
          >
            {/* Left: copy + CTA */}
            <div style={{ color: "white", maxWidth: 680 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.45rem 0.7rem",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.92)",
                  fontSize: 13,
                }}
              >
                Trygt. Raskt. Strukturert.
              </div>

              <h1
                style={{
                  marginTop: "0.9rem",
                  fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  fontWeight: 850,
                }}
              >
                Fått inkasso?
              </h1>

              <p
                style={{
                  marginTop: "0.85rem",
                  fontSize: "clamp(1.05rem, 1.6vw, 1.25rem)",
                  lineHeight: 1.55,
                  color: "rgba(255,255,255,0.86)",
                  maxWidth: 560,
                }}
              >
                Det er tungt å stå i alene.
                <br />
                Sammen kan vi se på hva du faktisk kan gjøre nå.
              </p>

              <div
                style={{
                  marginTop: "1.35rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <ButtonLink href="/inkasso/wizard">
                  Sjekk inkassokravet ditt
                </ButtonLink>

                <Link
                  href="/inkasso"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.75rem 1rem",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.10)",
                    color: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    fontWeight: 650,
                    textDecoration: "none",
                  }}
                >
                  Se hvordan det fungerer
                </Link>
              </div>

              <p
                style={{
                  marginTop: "0.7rem",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.74)",
                }}
              >
                Tar 2–3 minutter. Ingen betaling. Ingen registrering.
              </p>
            </div>

            {/* Right: trust card */}
            <div style={{ position: "relative" }}>
              <GlassCard>
                <h2 style={{ marginTop: 0 }}>Rask sjekk, klar retning</h2>
                <p style={{ marginBottom: 0 }}>
                  Plassholder: Vi guider deg til riktig neste steg, basert på hva
                  du faktisk har mottatt.
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <ButtonLink href="/inkasso/wizard">Start sjekken</ButtonLink>
                </div>
              </GlassCard>
            </div>
          </div>
        </Container>

        {/* Fix #1: Reliable mobile stacking */}
        <style>{`
          @media (max-width: 860px) {
            ._heroGrid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* BELOW HERO: keep minimal */}
      <section style={{ padding: "2rem 0" }}>
        <Container>
          <GlassCard>
            <h2 style={{ marginTop: 0 }}>Hva du kan gjøre her</h2>
            <p style={{ marginBottom: 0 }}>
              Plassholder: Wizard, FAQ og SEO-sider fylles inn senere.
            </p>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
              <ButtonLink href="/inkasso">Gå til Inkasso</ButtonLink>
              <ButtonLink href="/kategorier" variant="ghost">
                Se kategorier
              </ButtonLink>
            </div>
          </GlassCard>
        </Container>
      </section>
    </main>
  );
}
