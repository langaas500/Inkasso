"use client";

import { useMemo, useState } from "react";
import Container from "@/components/Container";
import GlassCard from "@/components/GlassCard";
import ButtonLink from "@/components/ButtonLink";

type Answers = {
  receivedType: string;
  disagree: "ja" | "nei" | "usikker" | "";
  reasons: string[];
  when: string;
  helpWith: string;
};

const initialAnswers: Answers = {
  receivedType: "",
  disagree: "",
  reasons: [],
  when: "",
  helpWith: "",
};

type StepKey = "received" | "disagree" | "reasons" | "when" | "helpWith" | "result";

export default function Wizard() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [index, setIndex] = useState(0);

  const shouldShowReasons = answers.disagree === "ja" || answers.disagree === "usikker";

  const flow: StepKey[] = useMemo(() => {
    const base: StepKey[] = ["received", "disagree"];
    if (shouldShowReasons) base.push("reasons");
    base.push("when", "helpWith", "result");
    return base;
  }, [shouldShowReasons]);

  const step = flow[index];

  const displayStepNumber = Math.min(index + 1, flow.length - 1); // exclude result
  const displayTotal = flow.length - 1; // exclude result
  const isResult = step === "result";

  const handleRadio = (field: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (value: string) => {
    setAnswers((prev) => {
      const reasons = prev.reasons.includes(value)
        ? prev.reasons.filter((r) => r !== value)
        : [...prev.reasons, value];
      return { ...prev, reasons };
    });
  };

  const getOutcome = () => {
    if ((answers.disagree === "ja" || answers.disagree === "usikker") && answers.reasons.length > 0) {
      return "disputable";
    }
    if (answers.disagree === "nei") return "payable";
    return "unknown";
  };

  const canGoNext = () => {
    switch (step) {
      case "received":
        return answers.receivedType !== "";
      case "disagree":
        return answers.disagree !== "";
      case "reasons":
        return answers.reasons.length > 0;
      case "when":
        return answers.when !== "";
      case "helpWith":
        return answers.helpWith !== "";
      case "result":
        return false;
      default:
        return false;
    }
  };

  const nextLabel = () => {
    // If next step is result, show "Se resultat"
    const next = flow[index + 1];
    return next === "result" ? "Se resultat" : "Neste";
  };

  const radioStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem",
    borderRadius: "var(--radius-sm)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    cursor: "pointer",
    transition: "all 0.15s",
  };

  const radioStyleSelected: React.CSSProperties = {
    ...radioStyle,
    background: "rgba(37, 99, 235, 0.08)",
    borderColor: "var(--color-primary)",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    borderRadius: "var(--radius-sm)",
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "var(--color-primary)",
    color: "#fff",
  };

  const ghostButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "transparent",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
  };

  if (isResult) {
    const outcome = getOutcome();

    return (
      <Container>
        <GlassCard>
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
            {outcome === "disputable" && (
              <>
                <h1 style={{ fontSize: "1.75rem" }}>Kravet kan trolig bestrides</h1>
                <p style={{ marginTop: "1rem", lineHeight: 1.7 }}>
                  Basert på svarene dine kan dette inkassokravet bestrides. Det betyr at inkassobyrået bør stoppe videre
                  inndrivelse mens saken avklares.
                </p>
                <div style={{ marginTop: "2rem" }}>
                  <ButtonLink href="/inkasso/analyse">Analyser inkassobrevet mitt</ButtonLink>
                </div>
                <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  Gratis sjekk – ingen forpliktelser
                </p>
              </>
            )}

            {outcome === "payable" && (
              <>
                <h1 style={{ fontSize: "1.75rem" }}>Kravet ser ut til å være korrekt</h1>
                <p style={{ marginTop: "1rem", lineHeight: 1.7 }}>
                  Det ser ut til at kravet er korrekt. Du har likevel mulighet til å få bedre oversikt eller be om
                  betalingsplan.
                </p>
                <div style={{ marginTop: "2rem" }}>
                  <ButtonLink href="/inkasso/betalingsplan">Få hjelp med betalingsplan</ButtonLink>
                </div>
              </>
            )}

            {outcome === "unknown" && (
              <>
                <h1 style={{ fontSize: "1.75rem" }}>Vi trenger litt mer informasjon</h1>
                <p style={{ marginTop: "1rem", lineHeight: 1.7 }}>
                  Det er ikke nok informasjon til å gi et klart råd ennå. Neste steg er å få full oversikt over kravet.
                </p>
                <div style={{ marginTop: "2rem" }}>
                  <ButtonLink href="/inkasso/analyse">Be om spesifikasjon av kravet</ButtonLink>
                </div>
              </>
            )}

            <div style={{ marginTop: "2rem" }}>
              <button
                onClick={() => {
                  setAnswers(initialAnswers);
                  setIndex(0);
                }}
                style={ghostButtonStyle}
              >
                Start på nytt
              </button>
            </div>
          </div>
        </GlassCard>
      </Container>
    );
  }

  return (
    <Container>
      <GlassCard>
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
            Steg {displayStepNumber} av {displayTotal}
          </p>
          <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(displayStepNumber / displayTotal) * 100}%`,
                background: "var(--color-primary)",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>

        {step === "received" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Hva har du mottatt?</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { value: "inkassovarsel", label: "Inkassovarsel" },
                { value: "betalingsoppfordring", label: "Betalingsoppfordring" },
                { value: "betalingsanmerkning", label: "Betalingsanmerkning" },
                { value: "namsmann", label: "Brev fra namsmannen / forliksrådet" },
                { value: "usikker", label: "Usikker / vet ikke" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  style={answers.receivedType === opt.value ? radioStyleSelected : radioStyle}
                >
                  <input
                    type="radio"
                    name="receivedType"
                    value={opt.value}
                    checked={answers.receivedType === opt.value}
                    onChange={() => handleRadio("receivedType", opt.value)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === "disagree" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Mener du at kravet kan være feil?</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { value: "ja", label: "Ja" },
                { value: "nei", label: "Nei" },
                { value: "usikker", label: "Usikker" },
              ].map((opt) => (
                <label key={opt.value} style={answers.disagree === opt.value ? radioStyleSelected : radioStyle}>
                  <input
                    type="radio"
                    name="disagree"
                    value={opt.value}
                    checked={answers.disagree === opt.value}
                    onChange={() => handleRadio("disagree", opt.value)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === "reasons" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Hva er grunnen til at du er uenig?</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Velg minst én (du kan velge flere)
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { value: "betalt", label: "Jeg har allerede betalt" },
                { value: "feil-belop", label: "Feil beløp" },
                { value: "ikke-bestilt", label: "Jeg har aldri bestilt dette" },
                { value: "mangelfull", label: "Varen eller tjenesten var mangelfull" },
                { value: "gammelt", label: "Kravet er gammelt" },
                { value: "annet", label: "Vet ikke / annet" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  style={answers.reasons.includes(opt.value) ? radioStyleSelected : radioStyle}
                >
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={answers.reasons.includes(opt.value)}
                    onChange={() => handleCheckbox(opt.value)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === "when" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Når mottok du kravet?</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { value: "nylig", label: "I dag / nylig" },
                { value: "1-2-uker", label: "For 1–2 uker siden" },
                { value: "over-2-uker", label: "Over 2 uker siden" },
                { value: "vet-ikke", label: "Vet ikke" },
              ].map((opt) => (
                <label key={opt.value} style={answers.when === opt.value ? radioStyleSelected : radioStyle}>
                  <input
                    type="radio"
                    name="when"
                    value={opt.value}
                    checked={answers.when === opt.value}
                    onChange={() => handleRadio("when", opt.value)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === "helpWith" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Hva ønsker du hjelp til akkurat nå?</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { value: "stoppe", label: "Stoppe inkasso / bestride kravet" },
                { value: "betale", label: "Betale, men få oversikt eller betalingsplan" },
                { value: "forsta", label: "Bare forstå hva jeg bør gjøre" },
              ].map((opt) => (
                <label key={opt.value} style={answers.helpWith === opt.value ? radioStyleSelected : radioStyle}>
                  <input
                    type="radio"
                    name="helpWith"
                    value={opt.value}
                    checked={answers.helpWith === opt.value}
                    onChange={() => handleRadio("helpWith", opt.value)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          {index > 0 ? (
            <button onClick={() => setIndex((i) => Math.max(0, i - 1))} style={ghostButtonStyle}>
              Tilbake
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => setIndex((i) => i + 1)}
            disabled={!canGoNext()}
            style={{
              ...primaryButtonStyle,
              opacity: canGoNext() ? 1 : 0.5,
              cursor: canGoNext() ? "pointer" : "not-allowed",
            }}
          >
            {nextLabel()}
          </button>
        </div>
      </GlassCard>
    </Container>
  );
}
