export type LearnerStateSchemaVersion = "1.0";

export type LessonProgressStatus = "in-progress" | "completed";

export type LessonProgress = {
  lessonId: string;
  status: LessonProgressStatus;
  startedAt: string;
  lastOpenedAt: string;
  completedAt?: string;
  lastSectionId?: string;
};

export type QuizAttempt = {
  id: string;
  lessonId: string;
  quizBlockId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  submittedAt: string;
  attemptNumber: number;
};

export type QuizAttemptInput = Omit<QuizAttempt, "id" | "attemptNumber">;

export type LearnerState = {
  schemaVersion: LearnerStateSchemaVersion;
  studybookId: string;
  lessons: Record<string, LessonProgress>;
  quizAttempts: Record<string, QuizAttempt[]>;
};

export type LearnerStateLoadStatus = "loaded" | "missing" | "recovered-from-corrupt";

export type LearnerStateLoadResult = {
  status: LearnerStateLoadStatus;
  state: LearnerState;
  errors: string[];
};

const learnerStateSchemaVersion: LearnerStateSchemaVersion = "1.0";
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createEmptyLearnerState(studybookId: string): LearnerState {
  return {
    schemaVersion: learnerStateSchemaVersion,
    studybookId,
    lessons: {},
    quizAttempts: {}
  };
}

export function markLessonOpened(
  state: LearnerState,
  lessonId: string,
  openedAt: string
): LearnerState {
  const existing = state.lessons[lessonId];

  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: existing
        ? {
            ...existing,
            lastOpenedAt: openedAt
          }
        : {
            lessonId,
            status: "in-progress",
            startedAt: openedAt,
            lastOpenedAt: openedAt
          }
    }
  };
}

export function markLessonSectionViewed(
  state: LearnerState,
  lessonId: string,
  sectionId: string,
  viewedAt: string
): LearnerState {
  const existing = state.lessons[lessonId];
  if (existing && existing.lastSectionId === sectionId) {
    return state;
  }
  const base: LessonProgress = existing
    ? { ...existing, lastOpenedAt: viewedAt }
    : {
        lessonId,
        status: "in-progress",
        startedAt: viewedAt,
        lastOpenedAt: viewedAt
      };
  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: { ...base, lastSectionId: sectionId }
    }
  };
}

export function markLessonCompleted(
  state: LearnerState,
  lessonId: string,
  completedAt: string
): LearnerState {
  const existing = state.lessons[lessonId];

  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: {
        lessonId,
        status: "completed",
        startedAt: existing?.startedAt ?? completedAt,
        lastOpenedAt: completedAt,
        completedAt
      }
    }
  };
}

export function recordQuizAttempt(state: LearnerState, attempt: QuizAttemptInput): LearnerState {
  const key = quizAttemptKey(attempt.lessonId, attempt.quizBlockId, attempt.questionId);
  const previousAttempts = state.quizAttempts[key] ?? [];
  const attemptNumber = previousAttempts.length + 1;
  const nextAttempt: QuizAttempt = {
    ...attempt,
    id: `${key}-attempt-${attemptNumber}`,
    attemptNumber
  };

  return {
    ...state,
    quizAttempts: {
      ...state.quizAttempts,
      [key]: [...previousAttempts, nextAttempt]
    }
  };
}

export function getQuizAttempts(
  state: LearnerState | undefined,
  lessonId: string,
  quizBlockId: string,
  questionId: string
): QuizAttempt[] {
  if (!state) {
    return [];
  }

  return state.quizAttempts[quizAttemptKey(lessonId, quizBlockId, questionId)] ?? [];
}

export function quizAttemptKey(lessonId: string, quizBlockId: string, questionId: string) {
  return `${lessonId}-${quizBlockId}-${questionId}`;
}

export function encodeLearnerState(state: LearnerState): string {
  return JSON.stringify(state, null, 2);
}

export function decodeLearnerState(
  studybookId: string,
  rawState: string | null
): LearnerStateLoadResult {
  if (!rawState || rawState.trim().length === 0) {
    return {
      status: "missing",
      state: createEmptyLearnerState(studybookId),
      errors: []
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawState);
  } catch {
    return recoveredState(studybookId, ["Saved learner state is not valid JSON."]);
  }

  const errors = validateLearnerState(parsed, studybookId);
  if (errors.length > 0) {
    return recoveredState(studybookId, errors);
  }

  return {
    status: "loaded",
    state: parsed as LearnerState,
    errors: []
  };
}

function recoveredState(studybookId: string, errors: string[]): LearnerStateLoadResult {
  return {
    status: "recovered-from-corrupt",
    state: createEmptyLearnerState(studybookId),
    errors
  };
}

function validateLearnerState(input: unknown, studybookId: string): string[] {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return ["Learner state must be an object."];
  }

  if (input.schemaVersion !== learnerStateSchemaVersion) {
    errors.push("Learner state schema version must be 1.0.");
  }

  if (input.studybookId !== studybookId) {
    errors.push("Learner state studybook id does not match the active studybook.");
  }

  if (!isRecord(input.lessons)) {
    errors.push("Learner state lessons must be an object.");
  } else {
    Object.entries(input.lessons).forEach(([key, value]) =>
      validateLessonProgress(key, value, errors)
    );
  }

  if (!isRecord(input.quizAttempts)) {
    errors.push("Learner state quiz attempts must be an object.");
  } else {
    Object.entries(input.quizAttempts).forEach(([key, value]) =>
      validateQuizAttempts(key, value, errors)
    );
  }

  return errors;
}

function validateLessonProgress(key: string, input: unknown, errors: string[]) {
  if (!isSafeId(key)) {
    errors.push(`Lesson progress key "${key}" must be lowercase kebab-case.`);
  }

  if (!isRecord(input)) {
    errors.push(`Lesson progress "${key}" must be an object.`);
    return;
  }

  if (input.lessonId !== key) {
    errors.push(`Lesson progress "${key}" must include a matching lesson id.`);
  }

  if (input.status !== "in-progress" && input.status !== "completed") {
    errors.push(`Lesson progress "${key}" has an unknown status.`);
  }

  validateTimestamp(input.startedAt, `Lesson progress "${key}" startedAt`, errors);
  validateTimestamp(input.lastOpenedAt, `Lesson progress "${key}" lastOpenedAt`, errors);

  if (input.completedAt !== undefined) {
    validateTimestamp(input.completedAt, `Lesson progress "${key}" completedAt`, errors);
  }

  if (input.lastSectionId !== undefined) {
    if (typeof input.lastSectionId !== "string" || !isSafeId(input.lastSectionId)) {
      errors.push(`Lesson progress "${key}" lastSectionId must be lowercase kebab-case.`);
    }
  }
}

function validateQuizAttempts(key: string, input: unknown, errors: string[]) {
  if (!Array.isArray(input)) {
    errors.push(`Quiz attempts "${key}" must be an array.`);
    return;
  }

  input.forEach((attempt, index) => {
    const attemptPath = `Quiz attempt "${key}" at index ${index}`;

    if (!isRecord(attempt)) {
      errors.push(`${attemptPath} must be an object.`);
      return;
    }

    validateSafeId(attempt.lessonId, `${attemptPath} lessonId`, errors);
    validateSafeId(attempt.quizBlockId, `${attemptPath} quizBlockId`, errors);
    validateSafeId(attempt.questionId, `${attemptPath} questionId`, errors);
    validateTimestamp(attempt.submittedAt, `${attemptPath} submittedAt`, errors);

    if (typeof attempt.id !== "string" || attempt.id.trim().length === 0) {
      errors.push(`${attemptPath} id must be a non-empty string.`);
    }

    if (typeof attempt.answer !== "string") {
      errors.push(`${attemptPath} answer must be a string.`);
    }

    if (typeof attempt.isCorrect !== "boolean") {
      errors.push(`${attemptPath} isCorrect must be a boolean.`);
    }

    if (
      typeof attempt.attemptNumber !== "number" ||
      !Number.isInteger(attempt.attemptNumber) ||
      attempt.attemptNumber <= 0
    ) {
      errors.push(`${attemptPath} attemptNumber must be a positive integer.`);
    }
  });
}

function validateSafeId(input: unknown, label: string, errors: string[]) {
  if (typeof input !== "string" || !isSafeId(input)) {
    errors.push(`${label} must be lowercase kebab-case.`);
  }
}

function validateTimestamp(input: unknown, label: string, errors: string[]) {
  if (typeof input !== "string" || input.trim().length === 0) {
    errors.push(`${label} must be a non-empty string.`);
  }
}

function isSafeId(input: string) {
  return idPattern.test(input);
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
