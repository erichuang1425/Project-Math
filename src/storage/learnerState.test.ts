import { describe, expect, it } from "vitest";
import {
  createLocalStorageLearnerStateRepository,
  createTauriLearnerStateRepository,
  type KeyValueStorage,
  type TauriInvoke
} from "./LearnerStateRepository";
import {
  createEmptyLearnerState,
  decodeLearnerState,
  getQuizAttempts,
  markLessonCompleted,
  markLessonOpened,
  recordQuizAttempt
} from "./learnerState";

const studybookId = "derivatives-first-principles";
const lessonId = "derivative-as-a-limit";
const quizBlockId = "first-principles-check";
const questionId = "valid-cancellation-step";
const openedAt = "2026-05-09T12:00:00.000Z";
const completedAt = "2026-05-09T12:10:00.000Z";

function createMemoryStorage(initialValues: Record<string, string> = {}): KeyValueStorage {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    }
  };
}

describe("learner state", () => {
  it("recovers an empty state when stored state is missing", () => {
    const result = decodeLearnerState(studybookId, null);

    expect(result).toMatchObject({
      status: "missing",
      state: createEmptyLearnerState(studybookId),
      errors: []
    });
  });

  it("recovers an empty state when stored JSON is corrupt", () => {
    const result = decodeLearnerState(studybookId, "{not-json");

    expect(result.status).toBe("recovered-from-corrupt");
    expect(result.state).toEqual(createEmptyLearnerState(studybookId));
    expect(result.errors).toContain("Saved learner state is not valid JSON.");
  });

  it("marks lesson progress as opened and completed", () => {
    const opened = markLessonOpened(createEmptyLearnerState(studybookId), lessonId, openedAt);
    const completed = markLessonCompleted(opened, lessonId, completedAt);

    expect(opened.lessons[lessonId]).toEqual({
      lessonId,
      status: "in-progress",
      startedAt: openedAt,
      lastOpenedAt: openedAt
    });
    expect(completed.lessons[lessonId]).toEqual({
      lessonId,
      status: "completed",
      startedAt: openedAt,
      lastOpenedAt: completedAt,
      completedAt
    });
  });

  it("records quiz attempts without overwriting retry history", () => {
    const state = createEmptyLearnerState(studybookId);
    const firstAttempt = recordQuizAttempt(state, {
      lessonId,
      quizBlockId,
      questionId,
      answer: "substitute-zero-first",
      isCorrect: false,
      submittedAt: "2026-05-09T12:03:00.000Z"
    });
    const secondAttempt = recordQuizAttempt(firstAttempt, {
      lessonId,
      quizBlockId,
      questionId,
      answer: "factor-before-limit",
      isCorrect: true,
      submittedAt: "2026-05-09T12:05:00.000Z"
    });

    expect(getQuizAttempts(secondAttempt, lessonId, quizBlockId, questionId)).toMatchObject([
      {
        id: `${lessonId}-${quizBlockId}-${questionId}-attempt-1`,
        attemptNumber: 1,
        isCorrect: false
      },
      {
        id: `${lessonId}-${quizBlockId}-${questionId}-attempt-2`,
        attemptNumber: 2,
        isCorrect: true
      }
    ]);
  });

  it("reads and writes JSON through the local storage repository", async () => {
    const repository = createLocalStorageLearnerStateRepository(createMemoryStorage());
    const state = recordQuizAttempt(
      markLessonOpened(createEmptyLearnerState(studybookId), lessonId, openedAt),
      {
        lessonId,
        quizBlockId,
        questionId,
        answer: "factor-before-limit",
        isCorrect: true,
        submittedAt: "2026-05-09T12:03:00.000Z"
      }
    );

    await repository.saveLearnerState(state);
    const loaded = await repository.loadLearnerState(studybookId);

    expect(loaded.status).toBe("loaded");
    expect(loaded.state).toEqual(state);
  });

  it("uses thin Tauri commands as a JSON string transport", async () => {
    const calls: Array<{ command: string; args?: Record<string, unknown> }> = [];
    let savedJson: string | null = null;
    const invoke: TauriInvoke = async <T>(command: string, args?: Record<string, unknown>) => {
      calls.push({ command, args });

      if (command === "save_learner_state") {
        savedJson = String(args?.json ?? "");
        return undefined as T;
      }

      if (command === "load_learner_state") {
        return savedJson as T;
      }

      throw new Error(`Unexpected command ${command}`);
    };
    const repository = createTauriLearnerStateRepository(invoke);
    const state = markLessonOpened(createEmptyLearnerState(studybookId), lessonId, openedAt);

    await repository.saveLearnerState(state);
    const loaded = await repository.loadLearnerState(studybookId);

    expect(calls.map((call) => call.command)).toEqual(["save_learner_state", "load_learner_state"]);
    expect(loaded.state).toEqual(state);
  });
});
