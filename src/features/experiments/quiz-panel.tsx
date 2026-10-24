"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { Alert, Badge, Button, Panel } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { QuizQuestionPublic, QuizSubmissionResult } from "@/types";

export function QuizPanel({
  questions,
  bestScore,
  attempts,
  readOnly = false,
  onSubmit,
}: {
  questions: QuizQuestionPublic[];
  bestScore: number | null;
  attempts: number;
  readOnly?: boolean;
  onSubmit: (
    answers: Record<string, number>,
  ) => Promise<{
    ok: boolean;
    message?: string;
    result?: QuizSubmissionResult;
    progress?: unknown;
  }>;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allAnswered = questions.every((question) => Number.isInteger(answers[question.id]));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!allAnswered) return;
    setSubmitting(true);
    setError("");
    const response = await onSubmit(answers);
    setSubmitting(false);
    if (!response.ok) {
      setError(response.message ?? "Could not submit the assessment.");
      return;
    }
    if (response.result) setResult(response.result);
  }

  function retake() {
    setResult(null);
    setAnswers({});
    setError("");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-mono">Assessment</p>
          <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">
            {questions.length} questions
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bestScore !== null ? (
            <Badge tone="ok">
              Best {bestScore}/{questions.length}
            </Badge>
          ) : (
            <Badge tone="neutral">No attempt yet</Badge>
          )}
          {attempts > 0 ? (
            <Badge tone="neutral">{attempts} attempt{attempts === 1 ? "" : "s"}</Badge>
          ) : null}
        </div>
      </div>

      {readOnly ? (
        <div className="space-y-3">
          <Alert tone="info" title="Staff preview">
            Assessment is completed by students. Questions are shown below without answers.
          </Alert>
          {questions.map((question, index) => (
            <Panel key={question.id} className="p-4">
              <p className="text-sm font-medium text-ink">
                {index + 1}. {question.prompt}
              </p>
              <ul className="mt-3 space-y-1.5">
                {question.options.map((option, optionIndex) => (
                  <li
                    key={optionIndex}
                    className="rounded-sm border border-line bg-surface-raised px-3 py-2 text-xs text-ink-soft"
                  >
                    <span className="mr-2 font-mono text-ink-faint">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    {option}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div
            className={cn(
              "rounded-sm border px-4 py-3",
              result.score / result.total >= 0.6
                ? "border-ok/25 bg-ok-wash text-ok"
                : "border-amber/30 bg-amber-wash text-amber",
            )}
          >
            <p className="text-sm font-semibold">
              You scored {result.score} of {result.total}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
              {result.score === result.total
                ? "All correct. Review the explanations below to confirm your reasoning."
                : "Review the explanations below, then retake the assessment if you wish."}
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => {
              const graded = result.results.find((item) => item.id === question.id);
              const correct = graded?.correct ?? false;
              const chosenIndex = answers[question.id];
              return (
                <Panel key={question.id} className="p-4">
                  <div className="flex items-start gap-2.5">
                    {correct ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" strokeWidth={1.8} aria-hidden />
                    ) : (
                      <XCircle className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={1.8} aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        {index + 1}. {question.prompt}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {question.options.map((option, optionIndex) => {
                          const isCorrect = graded?.answer === optionIndex;
                          const isChosen = chosenIndex === optionIndex;
                          return (
                            <li
                              key={optionIndex}
                              className={cn(
                                "rounded-sm border px-3 py-2 text-xs",
                                isCorrect
                                  ? "border-ok/30 bg-ok-wash text-ok"
                                  : isChosen
                                    ? "border-danger/30 bg-danger-wash text-danger"
                                    : "border-line bg-surface-raised text-ink-soft",
                              )}
                            >
                              <span className="mr-2 font-mono text-ink-faint">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              {option}
                              {isCorrect ? (
                                <span className="ml-2 font-mono text-[0.5625rem] uppercase tracking-[0.12em]">
                                  Correct
                                </span>
                              ) : null}
                              {isChosen && !isCorrect ? (
                                <span className="ml-2 font-mono text-[0.5625rem] uppercase tracking-[0.12em]">
                                  Your answer
                                </span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                      {graded ? (
                        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                          {graded.explanation}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>

          <Button variant="secondary" size="sm" onClick={retake}>
            <RotateCcw className="size-3.5" aria-hidden />
            Retake assessment
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((question, index) => (
            <Panel key={question.id} className="p-4">
              <fieldset>
                <legend className="text-sm font-medium text-ink">
                  {index + 1}. {question.prompt}
                </legend>
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const checked = answers[question.id] === optionIndex;
                    return (
                      <label
                        key={optionIndex}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-sm border px-3 py-2.5 text-sm transition-colors duration-150",
                          checked
                            ? "border-cobalt bg-cobalt/[0.06] text-ink"
                            : "border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-raised",
                        )}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={optionIndex}
                          checked={checked}
                          onChange={() =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]: optionIndex,
                            }))
                          }
                          className="mt-0.5 size-4 border-line-strong text-cobalt focus:ring-cobalt"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="mr-2 font-mono text-ink-faint">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </Panel>
          ))}

          {error ? (
            <Alert tone="danger" title="Submission failed">
              {error}
            </Alert>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="md" disabled={submitting || !allAnswered}>
              {submitting ? "Submitting…" : "Submit assessment"}
            </Button>
            {!allAnswered ? (
              <p className="text-xs text-ink-faint">
                Answer every question before submitting.
              </p>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
