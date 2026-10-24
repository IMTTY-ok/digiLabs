import { C1_CONTENT, C2_CONTENT } from "@/features/chemistry/experiments/content";
import { E1_CONTENT, E2_CONTENT } from "@/features/electronics/experiments/content";
import { I1_CONTENT, I2_CONTENT } from "@/features/it-workshop/content";
import type { ExperimentContent } from "@/features/experiments/content-types";
import type { ExperimentId, QuizQuestionPublic } from "@/types";

/**
 * Server-side content registry. The full quiz (with answers and explanations)
 * must never be passed to a client component; use `toPublicQuiz` for that.
 */
export const EXPERIMENT_CONTENT: Record<ExperimentId, ExperimentContent> = {
  c1: C1_CONTENT,
  c2: C2_CONTENT,
  e1: E1_CONTENT,
  e2: E2_CONTENT,
  i1: I1_CONTENT,
  i2: I2_CONTENT,
};

export type ExperimentContentPublic = Omit<ExperimentContent, "quiz"> & {
  quiz: QuizQuestionPublic[];
};

export function getExperimentContent(experimentId: ExperimentId): ExperimentContent {
  return EXPERIMENT_CONTENT[experimentId];
}

export function toPublicQuiz(experimentId: ExperimentId): QuizQuestionPublic[] {
  return EXPERIMENT_CONTENT[experimentId].quiz.map(({ id, prompt, options }) => ({
    id,
    prompt,
    options,
  }));
}

export function toPublicContent(experimentId: ExperimentId): ExperimentContentPublic {
  return {
    ...EXPERIMENT_CONTENT[experimentId],
    quiz: toPublicQuiz(experimentId),
  };
}
