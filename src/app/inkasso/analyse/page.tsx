"use client";

import { useMemo, useState } from "react";
import Container from "@/components/Container";
import GlassCard from "@/components/GlassCard";
import ButtonLink from "@/components/ButtonLink";

type Goal = "dispute" | "payment-plan" | "understand" | "";

type State = {
  documentText: string;
  goal: Goal;
  paymentMonths: number;
};

const initialState: State = {
  documentText: "",
  goal: "",
  paymentMonths: 6,
};

type StepKey =
  | "paste"
  | "goal"
  | "analysis"
  | "recommendation"
  | "action"
  | "payment-customize"
  | "generate";

type AiData = {
  who_demands_payment: string;
  on_behalf_of: string;
  amounts: { principal: number | null; interest: number | null; fees: number | null; total: number | null; currency_note: string };
  deadlines: { payment_deadline: string; objection_deadline: string; deadline_note: string };
  plain_summary: { what_this_is: string; what_happens_if_nothing: string; what_you_can_do_now: string };
  recommendation: { type: "dispute" | "payment-plan" | "request-specification"; title: string; reasoning: string };
  next_step_explained: { title: string; steps: string[] };
  draft_letter: { subject: string; body: string; placeholders_used: string[] };
};

export default function Analyse() {
  const [state, setState] = useState<State>(initialState);
  const [index, setIndex] = useState(0);

  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiData, setAiData] = useState<AiData | null>(null);

  const showPaymentStep = state.goal === "payment-plan";

  const flow: StepKey[] = useMemo(() => {
    const base: StepKey[] = ["paste", "goal", "analysis", "recommendation", "action"];
    if (showPaymentStep) base.push("payment-customize");
    base.push("generate");
    return base;
  }, [showPaymentStep]);

  const step = flow[index];
  const isFinalStep = step === "generate";
  const displayTotal = Math.max(1, flow.length - 1);
  const displayStepNumber = Math.min(index + 1, displayTotal);

  const monthOptions = [1,2,3,4,5,6,7,8,9,10,11,12];

  const sectionStyle: React.CSSProperties = {
    padding: "1rem",
    borderRadius: "var(--radius-sm)",
    background: "rgba(0, 0, 0, 0.02)",
    border: "1px solid var(--color-border)",
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

  const canGoNext = () => {
    switch (step) {
      case "paste":
        return state.documentText.trim().length > 20;
      case "goal":
        return state.goal !== "";
      case "analysis":
      case "recommendation":
      case "action":
      case "payment-customize":
        return true;
      case "generate":
        return false;
      default:
        return false;
    }
  };

  const handleBack = () => {
    if (index > 0) setIndex(index - 1);
  };

  const runAi = async () => {
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await fetch("/api/inkasso/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: state.documentText,
          goal: state.goal,
          paymentMonths: state.paymentMonths,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.details || json?.error || "Ukjent feil");
      setAiData(json.data as AiData);
    } catch (e: any) {
      setAiData(null);
      setAiError(e?.message ?? "Noe gikk galt");
    } finally {
      setAiBusy(false);
    }
  };

  const handleNext = async () => {
    const nextIndex = Math.min(index + 1, flow.length - 1);
    const nextStep = flow[nextIndex];
    setIndex(nextIndex);

    // Run AI when entering analysis
    if (nextStep === "analysis") {
      await runAi();
    }
  };

  const handleImageUpload = async (file: File) => {
    setImgBusy(true);
    setImgError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch("/api/inkasso/analyse-image", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.details || json?.error || "Ukjent feil ved bildeanalyse");
      const text = (json.text as string) || "";

      if (!text.trim()) {
        throw new Error("Fant ikke lesbar tekst i bildet. Prøv et skarpere bilde.");
      }

      setAiData(null);
      setAiError(null);

      setState((prev) => ({
        ...prev,
        documentText: text,
      }));
    } catch (e: any) {
      setImgError(e?.message ?? "Noe gikk galt");
    } finally {
      setImgBusy(false);
    }
  };

  const handleDoItMyself = () => {
    const base =
      "Gjør det selv (kort oppskrift):\n\n" +
      "1) Send skriftlig til inkassobyrået (helst e-post) og ta vare på kopi.\n";

    if (state.goal === "payment-plan") {
      alert(
        base +
          `2) Be om betalingsplan og foreslå periode (f.eks. ${state.paymentMonths} måneder) + realistisk månedlig beløp.\n` +
          "3) Be om skriftlig bekreftelse før første innbetaling.\n"
      );
      return;
    }

    if (state.goal === "dispute") {
      alert(
        base +
          "2) Skriv at du bestrider kravet og oppgi kort hvorfor.\n" +
          "3) Be om dokumentasjon/spesifikasjon.\n"
      );
      return;
    }

    alert(
      base +
        "2) Be om full spesifikasjon: hovedkrav, renter, gebyrer og frister.\n" +
        "3) Vent på svar før du tar stilling.\n"
    );
  };

  return (
    <Container>
      <GlassCard>
        {!isFinalStep && (
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
        )}

        {step === "paste" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Legg inn inkassobrevet</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Lim inn tekst, eller last opp et bilde/screenshot fra mobilen.
            </p>

            <div style={{ ...sectionStyle, marginBottom: "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={imgBusy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(f);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>

                {imgBusy && (
                  <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    Leser bilde…
                  </span>
                )}
              </div>

              {imgError && (
                <p style={{ marginTop: "0.75rem", marginBottom: 0, color: "var(--color-text-muted)" }}>
                  {imgError}
                </p>
              )}

              <p style={{ marginTop: "0.75rem", marginBottom: 0, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                Tips: ta bilde rett ovenfra, god belysning, og zoom inn så tekst blir skarp.
              </p>
            </div>

            <textarea
              value={state.documentText}
              onChange={(e) => {
                setAiData(null);
                setAiError(null);
                setState((prev) => ({ ...prev, documentText: e.target.value }));
              }}
              placeholder="…eller lim inn teksten her"
              style={{
                width: "100%",
                minHeight: 200,
                padding: "1rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                resize: "vertical",
              }}
            />

            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
              {state.documentText.length > 0 ? `${state.documentText.length} tegn` : "Minst 20 tegn for å fortsette"}
            </p>
          </div>
        )}

        {step === "goal" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>Hva ønsker du hjelp til?</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { value: "dispute", label: "Stoppe / bestride kravet" },
                { value: "payment-plan", label: "Betale, men få betalingsplan" },
                { value: "understand", label: "Bare forstå innholdet først" },
              ].map((opt) => (
                <label key={opt.value} style={state.goal === opt.value ? radioStyleSelected : radioStyle}>
                  <input
                    type="radio"
                    name="goal"
                    value={opt.value}
                    checked={state.goal === opt.value}
                    onChange={() => {
                      setAiData(null);
                      setAiError(null);
                      setState((prev) => ({ ...prev, goal: opt.value as Goal }));
                    }}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === "analysis" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Vi har gått gjennom brevet</h1>

            {aiBusy && (
              <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                Leser brevet… (noen sekunder)
              </p>
            )}

            {aiError && (
              <div style={{ ...sectionStyle, marginBottom: "1rem" }}>
                <h3 style={{ marginTop: 0 }}>Noe gikk galt</h3>
                <p style={{ marginBottom: 0, color: "var(--color-text-muted)" }}>{aiError}</p>
                <div style={{ marginTop: "1rem" }}>
                  <button onClick={runAi} style={ghostButtonStyle}>Prøv igjen</button>
                </div>
              </div>
            )}

            {!aiBusy && !aiError && aiData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={sectionStyle}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>
                    Hvem krever penger
                  </h3>
                  <p style={{ margin: 0 }}>
                    {aiData.who_demands_payment}
                    {aiData.on_behalf_of && aiData.on_behalf_of !== "ukjent" ? ` (på vegne av ${aiData.on_behalf_of})` : ""}
                  </p>
                </div>

                <div style={sectionStyle}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>
                    Hva beløpet består av
                  </h3>
                  <p style={{ margin: 0 }}>
                    Hovedkrav: {aiData.amounts.principal ?? "ukjent"} · Renter: {aiData.amounts.interest ?? "ukjent"} · Gebyrer/salær: {aiData.amounts.fees ?? "ukjent"} · Totalt: {aiData.amounts.total ?? "ukjent"}{" "}
                    <span style={{ color: "var(--color-text-muted)" }}>({aiData.amounts.currency_note})</span>
                  </p>
                </div>

                <div style={sectionStyle}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>
                    Viktige frister
                  </h3>
                  <p style={{ margin: 0 }}>
                    Betalingsfrist: {aiData.deadlines.payment_deadline} · Innsigelse: {aiData.deadlines.objection_deadline}
                  </p>
                  <p style={{ marginTop: "0.5rem", marginBottom: 0, color: "var(--color-text-muted)" }}>
                    {aiData.deadlines.deadline_note}
                  </p>
                </div>

                <div style={sectionStyle}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>
                    Kort forklart
                  </h3>
                  <p style={{ marginTop: 0, marginBottom: "0.75rem" }}>{aiData.plain_summary.what_this_is}</p>
                  <p style={{ marginTop: 0, marginBottom: "0.75rem" }}>{aiData.plain_summary.what_happens_if_nothing}</p>
                  <p style={{ margin: 0 }}>{aiData.plain_summary.what_you_can_do_now}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "recommendation" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>Vår anbefaling</h1>
            <div style={{ padding: "1.5rem", borderRadius: "var(--radius)", background: "rgba(37, 99, 235, 0.06)", border: "1px solid rgba(37, 99, 235, 0.15)" }}>
              <p style={{ marginTop: 0, marginBottom: "0.75rem", color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
                Basert på det du limte inn:
              </p>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem", color: "var(--color-primary)" }}>
                {aiData?.recommendation.title ?? "Anbefaling"}
              </h2>
              <p style={{ margin: 0, lineHeight: 1.7 }}>
                {aiData?.recommendation.reasoning ?? ""}
              </p>
            </div>
          </div>
        )}

        {step === "action" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>Hva er riktig neste steg nå?</h1>
            <div style={{ padding: "1.5rem", borderRadius: "var(--radius)", background: "rgba(0, 0, 0, 0.02)", border: "1px solid var(--color-border)" }}>
              <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", fontWeight: 600 }}>
                {aiData?.next_step_explained.title ?? "Neste steg"}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {(aiData?.next_step_explained.steps ?? []).map((s, i) => (
                  <p key={i} style={{ margin: 0, lineHeight: 1.65 }}>
                    {i + 1}. {s}
                  </p>
                ))}
              </div>
            </div>

            <p style={{ marginTop: "1.25rem", padding: "1rem", borderRadius: "var(--radius-sm)", background: "rgba(37, 99, 235, 0.04)", border: "1px solid rgba(37, 99, 235, 0.1)", lineHeight: 1.6, fontStyle: "italic" }}>
              Du kan gjøre dette selv – eller la oss lage ferdig teksten for deg.
            </p>
          </div>
        )}

        {step === "payment-customize" && (
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Tilpass betalingsplanen</h1>
            <p style={{ marginTop: 0, marginBottom: "1rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Standard er 6 måneder. Du kan endre.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
              {monthOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setAiData(null);
                    setAiError(null);
                    setState((prev) => ({ ...prev, paymentMonths: m }));
                  }}
                  style={{
                    padding: "0.75rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    border: state.paymentMonths === m ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: state.paymentMonths === m ? "rgba(37, 99, 235, 0.08)" : "transparent",
                    cursor: "pointer",
                    fontWeight: state.paymentMonths === m ? 600 : 400,
                    color: state.paymentMonths === m ? "var(--color-primary)" : "var(--color-text)",
                  }}
                >
                  {m} mnd
                </button>
              ))}
            </div>

            <div style={{ padding: "1rem", borderRadius: "var(--radius-sm)", background: "rgba(37, 99, 235, 0.04)", border: "1px solid rgba(37, 99, 235, 0.1)" }}>
              Du har valgt <strong>{state.paymentMonths} måneder</strong>.
            </div>
          </div>
        )}

        {step === "generate" && (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Utkast til tekst</h1>
            <div style={{ ...sectionStyle, textAlign: "left" }}>
              <h3 style={{ marginTop: 0 }}>{aiData?.draft_letter.subject ?? "Emne"}</h3>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.65 }}>
                {aiData?.draft_letter.body ?? "Ingen utkast tilgjengelig."}
              </pre>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  if (!aiData?.draft_letter.body) return;
                  navigator.clipboard.writeText(aiData.draft_letter.body);
                  alert("Teksten er kopiert.");
                }}
                style={primaryButtonStyle}
                disabled={!aiData?.draft_letter.body}
              >
                Kopier teksten
              </button>

              <button onClick={handleDoItMyself} style={ghostButtonStyle}>
                Jeg vil gjøre dette selv
              </button>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <ButtonLink href="/inkasso/wizard">Tilbake til sjekken</ButtonLink>
            </div>
          </div>
        )}

        {!isFinalStep && (
          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
            {index > 0 ? (
              <button onClick={handleBack} style={ghostButtonStyle}>Tilbake</button>
            ) : (
              <ButtonLink href="/inkasso/wizard">Avbryt</ButtonLink>
            )}

            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              style={{
                ...primaryButtonStyle,
                opacity: canGoNext() ? 1 : 0.5,
                cursor: canGoNext() ? "pointer" : "not-allowed",
              }}
            >
              Neste
            </button>
          </div>
        )}
      </GlassCard>
    </Container>
  );
}
