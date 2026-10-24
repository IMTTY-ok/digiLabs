"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  LogOut,
  Play,
  Power,
  Square,
} from "lucide-react";

import { Alert, Badge, Button } from "@/components/ui";
import { endLabSession, startLabSession } from "@/features/experiments/actions";
import { cn } from "@/lib/utils/cn";
import type { ExperimentId, LabId } from "@/types";

type Session = {
  id: string;
  startedAt: string;
  labId: LabId;
};

export function SessionControl({
  labId,
  experiments,
  activeSession,
  otherActiveSession,
  canStart,
  otherLabName,
}: {
  labId: LabId;
  experiments: { id: string; code: string; shortTitle: string }[];
  activeSession: Session | null;
  otherActiveSession: Session | null;
  canStart: boolean;
  otherLabName?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "info" | "danger">("info");
  const [selectedExperiment, setSelectedExperiment] = useState<string>("");
  const [acknowledgePower, setAcknowledgePower] = useState(false);

  async function handleStart() {
    startTransition(async () => {
      const result = await startLabSession(labId, selectedExperiment ? (selectedExperiment as ExperimentId) : undefined);
      setMessageTone(result.ok ? "success" : "danger");
      setMessage(result.message ?? (result.ok ? "Session started." : "Could not start the session."));
      if (result.ok) router.refresh();
    });
  }

  async function handleEnd(outcome: "completed" | "ended-early") {
    if (!activeSession) return;
    startTransition(async () => {
      const result = await endLabSession(activeSession.id, outcome);
      setMessageTone(result.ok ? "success" : "danger");
      setMessage(result.message ?? (result.ok ? "Session ended." : "Could not end the session."));
      if (result.ok) {
        setAcknowledgePower(false);
        router.refresh();
      }
    });
  }

  if (otherActiveSession) {
    return (
      <div className="rounded-sm border border-amber/30 bg-amber-wash px-4 py-3">
        <p className="text-sm font-medium text-amber">A simulated session is open elsewhere</p>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-soft">
          You have an active session in {otherLabName ?? "another laboratory"}. End it before starting a
          new one here.
        </p>
        <Link href={`/labs/${otherActiveSession.labId}`} className="mt-2 inline-block text-xs font-medium text-cobalt hover:text-cobalt-deep">
          Return to that lab
        </Link>
      </div>
    );
  }

  if (activeSession) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="cyan" dot>
            Session in progress
          </Badge>
          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
            Started just now
          </span>
        </div>
        <p className="text-[0.8125rem] leading-relaxed text-ink-soft">
          Record readings in the experiment workspace, then end the session. Acknowledge the simulated
          power-off before ending.
        </p>
        <label className="flex items-start gap-2.5 rounded-sm border border-line bg-surface-raised px-3 py-2.5 text-[0.8125rem] text-ink-soft">
          <input
            type="checkbox"
            checked={acknowledgePower}
            onChange={(event) => setAcknowledgePower(event.target.checked)}
            className="mt-0.5 size-4 rounded-sm border-line-strong text-cobalt focus:ring-cobalt"
          />
          <span>
            I have verified that the simulated equipment is switched off and the bench is clear.
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={pending || !acknowledgePower}
            onClick={() => handleEnd("completed")}
          >
            <CheckCircle2 className="size-3.5" aria-hidden />
            {pending ? "Ending…" : "End · completed"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={pending || !acknowledgePower}
            onClick={() => handleEnd("ended-early")}
          >
            <Square className="size-3.5" aria-hidden />
            End early
          </Button>
        </div>
        {message ? (
          <Alert tone={messageTone === "danger" ? "danger" : messageTone === "success" ? "success" : "info"}>
            {message}
          </Alert>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">No active session</Badge>
        <span className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
          Start when you are ready to work
        </span>
      </div>
      {experiments.length ? (
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink">Link to an experiment (optional)</span>
          <select
            value={selectedExperiment}
            onChange={(event) => setSelectedExperiment(event.target.value)}
            className="h-10 w-full rounded-sm border border-line-strong bg-surface px-3 text-sm text-ink shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] focus:border-cobalt focus:outline-none"
          >
            <option value="">General laboratory access</option>
            {experiments.map((experiment) => (
              <option key={experiment.id} value={experiment.id}>
                {experiment.code} · {experiment.shortTitle}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <Button
        variant="primary"
        size="sm"
        disabled={pending || !canStart}
        onClick={handleStart}
      >
        <Play className="size-3.5" aria-hidden />
        {pending ? "Starting…" : "Start simulated session"}
      </Button>
      {!canStart ? (
        <p className="text-[0.6875rem] leading-relaxed text-ink-faint">
          You do not have access to start a session in this laboratory.
        </p>
      ) : null}
      {message ? (
        <Alert tone={messageTone === "danger" ? "danger" : messageTone === "success" ? "success" : "info"}>
          {message}
        </Alert>
      ) : null}
      <p className="flex items-center gap-1.5 text-[0.6875rem] leading-relaxed text-ink-faint">
        <Power className="size-3" aria-hidden />
        A simulated session logs equipment use and safety acknowledgements. No hardware is energised.
      </p>
    </div>
  );
}
