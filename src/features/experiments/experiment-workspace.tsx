"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  PlayCircle,
  ShieldAlert,
  Sparkles,
  Video,
} from "lucide-react";

import { Badge, Button, Panel, PanelHeader } from "@/components/ui";
import { markStepRead, submitExperimentQuiz } from "@/features/experiments/actions";
import { saveObservation } from "@/features/experiments/actions";
import { PROGRESS_STEPS, READABLE_STEP_IDS } from "@/features/experiments/steps";
import { ObservationTable } from "@/features/experiments/observation-table";
import { QuizPanel } from "@/features/experiments/quiz-panel";
import { TitrationSimulation } from "@/features/chemistry/titration-simulation";
import { CircuitSimulation } from "@/features/electronics/circuit-simulation";
import { PcTeardownSimulation } from "@/features/it-workshop/pc-teardown-simulation";
import { BoardStudySimulation } from "@/features/it-workshop/board-study-simulation";
import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/components/three/use-webgl";
import type {
  Experiment,
  ExperimentProgress,
  Laboratory,
  ObservationRecord,
  ProgressStep,
  QuizQuestionPublic,
  QuizResult,
} from "@/types";
import type { ExperimentContentPublic } from "@/features/experiments/registry";

// Re-export the component defined below under the expected name.
export { ExperimentWorkspaceComponent as ExperimentWorkspace };

function ExperimentWorkspaceComponent({
  lab,
  experiment,
  content,
  initialProgress,
  initialObservations,
  bestQuizScore,
  quizAttempts,
  latestQuizResult,
  activeSession,
  initialStep,
  readOnly,
}: {
  lab: Laboratory;
  experiment: Experiment;
  content: ExperimentContentPublic;
  initialProgress: ExperimentProgress | null;
  initialObservations: ObservationRecord[];
  bestQuizScore: number | null;
  quizAttempts: number;
  latestQuizResult: QuizResult | null;
  activeSession: { id: string; labId: Laboratory["id"]; outcome: string; startedAt: string } | null;
  initialStep?: string;
  readOnly: boolean;
}) {
  const [progress, setProgress] = useState<ExperimentProgress | null>(initialProgress);
  const [observations, setObservations] = useState<ObservationRecord[]>(initialObservations);
  const [activeStep, setActiveStep] = useState<ProgressStep>(() =>
    resolveInitialStep(initialStep, initialProgress),
  );
  const [message, setMessage] = useState<{ tone: "success" | "info" | "danger"; text: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const reducedMotion = usePrefersReducedMotion();

  const completedSteps = progress?.completedSteps ?? [];
  const isComplete = progress?.status === "completed";

  function markRead(step: ProgressStep) {
    if (readOnly) return;
    startTransition(async () => {
      const result = await markStepRead(experiment.id, step);
      if (result.ok && result.progress) {
        setProgress(result.progress);
        setMessage({ tone: "success", text: `${stepLabel(step)} marked complete.` });
      } else {
        setMessage({ tone: "danger", text: result.message ?? "Could not update progress." });
      }
    });
  }

  async function recordObservation(values: Record<string, unknown>, note?: string) {
    if (readOnly) return { ok: false, message: "Staff preview." };
    const result = await saveObservation(experiment.id, values, note);
    if (result.ok) {
      if (result.record) setObservations((current) => [...current, result.record!]);
      if (result.progress) setProgress(result.progress);
      setMessage({ tone: "success", text: result.message ?? "Observation recorded." });
    } else {
      setMessage({ tone: "danger", text: result.message ?? "Could not record." });
    }
    return { ok: result.ok, message: result.message };
  }

  async function submitQuiz(answers: Record<string, number>) {
    if (readOnly) return { ok: false, message: "Staff preview." };
    const result = await submitExperimentQuiz(experiment.id, answers);
    if (result.ok) {
      if (result.progress) setProgress(result.progress);
      setMessage({
        tone: "success",
        text: `Assessment submitted · ${result.result?.score}/${result.result?.total}`,
      });
    } else {
      setMessage({ tone: "danger", text: result.message ?? "Could not submit." });
    }
    return {
      ok: result.ok,
      message: result.message,
      result: result.result,
      progress: result.progress,
    };
  }

  const activeStepDefinition = PROGRESS_STEPS.find((step) => step.id === activeStep)!;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[15rem_1fr]">
      {/* Step navigation */}
      <aside className="min-w-0">
        <div className="panel sticky top-20 overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <p className="label-mono">Progress</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08]">
                <div
                  className="h-full rounded-full bg-cobalt transition-transform duration-300"
                  style={{ transform: `scaleX(${(completedSteps.length / 5) * 100 / 100})` }}
                />
              </div>
              <span className="font-mono text-[0.5625rem] tabular text-ink-soft">
                {completedSteps.length}/5
              </span>
            </div>
            {isComplete ? (
              <Badge tone="ok" dot className="mt-2">
                Completed
              </Badge>
            ) : completedSteps.length > 0 ? (
              <Badge tone="cobalt" dot className="mt-2">
                In progress
              </Badge>
            ) : (
              <Badge tone="neutral" className="mt-2">
                Not started
              </Badge>
            )}
          </div>
          <nav aria-label="Experiment sections" className="p-2">
            <ul className="space-y-1">
              {PROGRESS_STEPS.map((step) => {
                const done = completedSteps.includes(step.id);
                const current = activeStep === step.id;
                const earned = step.id === "simulation" || step.id === "assessment";
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      aria-current={current ? "step" : undefined}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-sm px-2.5 py-2 text-left transition-colors duration-150",
                        current ? "bg-ink/[0.06] text-ink" : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[0.5rem]",
                          done
                            ? "border-ok bg-ok text-white"
                            : current
                              ? "border-cobalt bg-cobalt/[0.08] text-cobalt-deep"
                              : "border-line-strong bg-surface text-ink-faint",
                        )}
                        aria-hidden
                      >
                        {done ? "✓" : earned ? "★" : ""}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.8125rem] font-medium leading-tight">
                          {step.label}
                        </span>
                        <span className="mt-0.5 block text-[0.625rem] leading-snug text-ink-faint">
                          {step.short}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {READABLE_STEP_IDS.includes(activeStep) && !readOnly && !completedSteps.includes(activeStep) ? (
            <div className="border-t border-line p-3">
              <Button
                variant="primary"
                size="sm"
                full
                disabled={pending}
                onClick={() => markRead(activeStep)}
              >
                {pending ? "Saving…" : `Mark ${activeStepDefinition.label.toLowerCase()} complete`}
              </Button>
            </div>
          ) : null}

          {completedSteps.includes(activeStep) && READABLE_STEP_IDS.includes(activeStep) ? (
            <div className="border-t border-line p-3">
              <p className="flex items-center gap-1.5 text-xs text-ok">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Section complete
              </p>
            </div>
          ) : null}
        </div>

        {/* Metadata card */}
        <div className="panel mt-4 p-4">
          <p className="label-mono mb-2">Experiment</p>
          <p className="text-sm font-medium text-ink">{experiment.shortTitle}</p>
          <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
            {experiment.code} · {experiment.durationMinutes} min · {experiment.difficulty}
          </p>
          {progress?.bestQuizScore !== null && progress?.bestQuizScore !== undefined ? (
            <p className="mt-3 text-xs text-ink-soft">
              Best assessment:{" "}
              <span className="font-mono tabular text-ink">
                {progress.bestQuizScore}/{content.quiz.length}
              </span>
            </p>
          ) : bestQuizScore !== null ? (
            <p className="mt-3 text-xs text-ink-soft">
              Best assessment:{" "}
              <span className="font-mono tabular text-ink">
                {bestQuizScore}/{content.quiz.length}
              </span>
            </p>
          ) : null}
          {activeSession && activeSession.labId === lab.id && activeSession.outcome === "active" ? (
            <Link
              href={`/labs/${lab.id}`}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-cyan/25 bg-cyan-wash px-3 py-2 text-xs font-medium text-cyan"
            >
              <PlayCircle className="size-3.5" aria-hidden />
              Session open · manage
            </Link>
          ) : (
            <Link
              href={`/labs/${lab.id}`}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-line bg-surface-raised px-3 py-2 text-xs font-medium text-ink-soft hover:text-ink"
            >
              Start a session
            </Link>
          )}
        </div>
      </aside>

      {/* Main panel */}
      <div className="min-w-0 space-y-4">
        {message ? (
          <div
            className={cn(
              "rounded-sm border px-4 py-3 text-sm",
              message.tone === "success"
                ? "border-ok/25 bg-ok-wash text-ok"
                : message.tone === "danger"
                  ? "border-danger/25 bg-danger-wash text-danger"
                  : "border-cobalt/20 bg-cobalt/[0.05] text-cobalt-deep",
            )}
            role={message.tone === "danger" ? "alert" : undefined}
          >
            {message.text}
          </div>
        ) : null}

        {readOnly ? (
          <div className="rounded-sm border border-amber/30 bg-amber-wash px-4 py-3 text-sm text-amber">
            Staff preview: content is shown below. Interactive work and recording are completed by
            students.
          </div>
        ) : null}

        <Panel className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <PanelHeader
              eyebrow={activeStepDefinition.short}
              title={activeStepDefinition.label}
              description={activeStepDefinition.description}
              action={
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-faint">
                  {completedSteps.includes(activeStep) ? "Complete" : "In progress"}
                </span>
              }
            />
          </div>

          <div key={activeStep} className="p-5 sm:p-6 rise-in">
            {activeStep === "overview" ? (
              <div className="space-y-6">
                <p className="prose-lab text-[0.95rem]">{content.overview}</p>

                <div>
                  <p className="label-mono mb-3">Objectives</p>
                  <ul className="space-y-2">
                    {content.objectives.map((objective, index) => (
                      <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                        <span className="mt-0.5 font-mono text-[0.625rem] text-ink-faint">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="label-mono mb-3">Apparatus</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {content.apparatus.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 rounded-sm border border-line bg-surface-raised px-3 py-2 text-xs text-ink-soft"
                      >
                        <FlaskConical className="size-3.5 shrink-0 text-ink-faint" strokeWidth={1.8} aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {experiment.videos.length ? (
                  <div>
                    <p className="label-mono mb-3">Reference videos</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {experiment.videos.map((video) => (
                        <a
                          key={video.id}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-3 rounded-sm border border-line bg-surface-raised p-3 transition-colors duration-150 hover:border-cobalt/40 hover:bg-surface"
                        >
                          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-line bg-surface text-cobalt">
                            <Video className="size-4" strokeWidth={1.8} aria-hidden />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[0.8125rem] font-medium leading-snug text-ink group-hover:text-cobalt-deep">
                              {video.title ?? "Open the reference video"}
                            </span>
                            <span className="mt-0.5 block font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                              {video.verified ? "Verified source" : "Unverified source"}
                              {video.note ? ` · ${video.note}` : ""}
                            </span>
                          </span>
                          <ArrowRight className="mt-1 size-3.5 shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-sm border border-cyan/20 bg-cyan-wash px-4 py-3">
                  <p className="flex items-center gap-2 text-xs font-medium text-cyan">
                    <Sparkles className="size-3.5" aria-hidden />
                    Simulation disclaimer
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-soft">
                    {content.simulationNote ?? "All readings on this page are generated by a browser simulation. No physical apparatus is connected."}
                  </p>
                </div>
              </div>
            ) : null}

            {activeStep === "theory" ? (
              <div className="space-y-6">
                {content.theory.map((block, index) => (
                  <section key={index} className="space-y-3">
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-ink">
                      {block.heading}
                    </h3>
                    <div className="prose-lab text-[0.9375rem]">
                      {block.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                    </div>
                    {block.formula ? (
                      <div className="rounded-sm border border-line bg-surface-raised px-4 py-3">
                        <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-ink">
                          {block.formula}
                        </pre>
                        {block.formulaCaption ? (
                          <p className="mt-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                            {block.formulaCaption}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                ))}
                {content.reaction ? (
                  <div className="rounded-sm border border-line bg-surface-raised px-4 py-3">
                    <p className="label-mono mb-1.5">Reaction</p>
                    <p className="font-mono text-sm text-ink">{content.reaction}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeStep === "procedure" ? (
              <div className="space-y-6">
                <ol className="space-y-3">
                  {content.procedure.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface font-mono text-[0.625rem] text-ink-faint">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{step.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-sm border border-amber/25 bg-amber-wash p-4">
                    <p className="label-mono mb-2 text-amber">Precautions</p>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-ink-soft">
                      {content.precautions.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-amber" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-sm border border-danger/20 bg-danger-wash p-4">
                    <p className="label-mono mb-2 text-danger">Safety</p>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-ink-soft">
                      {content.safety.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-danger" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {content.practice.length ? (
                  <div>
                    <p className="label-mono mb-3">Practice</p>
                    <div className="space-y-2">
                      {content.practice.map((item, index) => (
                        <details
                          key={index}
                          className="group rounded-sm border border-line bg-surface-raised px-4 py-3"
                        >
                          <summary className="cursor-pointer list-none text-sm font-medium text-ink">
                            <span className="mr-2 font-mono text-[0.625rem] text-ink-faint">
                              Q{index + 1}
                            </span>
                            {item.question}
                          </summary>
                          <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
                            {item.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeStep === "simulation" ? (
              <div className="space-y-6">
                <div className="rounded-sm border border-cyan/20 bg-cyan-wash px-4 py-3">
                  <p className="flex items-center gap-2 text-xs font-medium text-cyan">
                    <ShieldAlert className="size-3.5" aria-hidden />
                    Simulation disclaimer
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-soft">
                    {content.simulationNote ?? "All readings on this page are generated by a browser simulation. No physical apparatus is connected."}
                  </p>
                </div>

                {experiment.id === "c1" || experiment.id === "c2" ? (
                  <TitrationSimulation
                    variant={experiment.id}
                    onRecord={readOnly ? undefined : recordObservation}
                    readOnly={readOnly}
                  />
                ) : null}
                {experiment.id === "e1" ? (
                  <CircuitSimulation
                    variant="kvl"
                    onRecord={readOnly ? undefined : recordObservation}
                    readOnly={readOnly}
                  />
                ) : null}
                {experiment.id === "e2" ? (
                  <CircuitSimulation
                    variant="kcl"
                    onRecord={readOnly ? undefined : recordObservation}
                    readOnly={readOnly}
                  />
                ) : null}
                {experiment.id === "i1" ? (
                  <PcTeardownSimulation
                    onRecord={readOnly ? undefined : recordObservation}
                    readOnly={readOnly}
                  />
                ) : null}
                {experiment.id === "i2" ? (
                  <BoardStudySimulation
                    onRecord={readOnly ? undefined : recordObservation}
                    readOnly={readOnly}
                  />
                ) : null}

                <div>
                  <p className="label-mono mb-3">Recorded observations</p>
                  <ObservationTable experimentId={experiment.id} records={observations} />
                </div>
              </div>
            ) : null}

            {activeStep === "assessment" ? (
              <div className="space-y-4">
                <QuizPanel
                  questions={content.quiz}
                  bestScore={progress?.bestQuizScore ?? bestQuizScore}
                  attempts={progress?.quizAttempts ?? quizAttempts}
                  readOnly={readOnly}
                  onSubmit={submitQuiz}
                />
                {latestQuizResult ? (
                  <div className="rounded-sm border border-line bg-surface-raised px-4 py-3">
                    <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Latest attempt · {new Date(latestQuizResult.submittedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      Score {latestQuizResult.score}/{latestQuizResult.total}. A new attempt is saved as a
                      separate record.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </Panel>

        {/* Bottom navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {(() => {
            const index = PROGRESS_STEPS.findIndex((step) => step.id === activeStep);
            const previous = index > 0 ? PROGRESS_STEPS[index - 1] : null;
            const next = index < PROGRESS_STEPS.length - 1 ? PROGRESS_STEPS[index + 1] : null;
            return (
              <>
                {previous ? (
                  <Button variant="ghost" size="sm" onClick={() => setActiveStep(previous.id)}>
                    ← {previous.label}
                  </Button>
                ) : (
                  <span />
                )}
                {next ? (
                  <Button variant="secondary" size="sm" onClick={() => setActiveStep(next.id)}>
                    {next.label} →
                  </Button>
                ) : null}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function resolveInitialStep(requested: string | undefined, progress: ExperimentProgress | null): ProgressStep {
  if (requested && PROGRESS_STEP_IDS.includes(requested as ProgressStep)) {
    return requested as ProgressStep;
  }
  const done = new Set(progress?.completedSteps ?? []);
  return (PROGRESS_STEPS.find((step) => !done.has(step.id))?.id ?? "overview") as ProgressStep;
}

function stepLabel(step: ProgressStep): string {
  return PROGRESS_STEPS.find((item) => item.id === step)?.label ?? step;
}

const PROGRESS_STEP_IDS = PROGRESS_STEPS.map((step) => step.id);
