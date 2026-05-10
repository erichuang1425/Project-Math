import { isLatexRenderable } from "../math/renderLatex";
import type { Studybook } from "./schema";

export type ValidationError = {
  path: string;
  message: string;
};

export type ValidationResult =
  | { ok: true; studybook: Studybook }
  | { ok: false; errors: ValidationError[] };

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateStudybook(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  validateStudybookShape(input, "$", errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, studybook: input as Studybook };
}

function validateStudybookShape(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (!isRecord(input)) {
    addError(errors, path, "Studybook must be an object.");
    return;
  }

  if (input.schemaVersion !== "1.0") {
    addError(errors, `${path}.schemaVersion`, "Schema version must be 1.0.");
  }

  validateId(input.id, `${path}.id`, errors);
  expectNonEmptyString(input.title, `${path}.title`, errors);
  expectOneOf(input.subject, ["math", "technical"], `${path}.subject`, errors);
  expectNonEmptyString(input.topic, `${path}.topic`, errors);
  expectNonEmptyString(input.summary, `${path}.summary`, errors);
  validateStringArray(input.prerequisites, `${path}.prerequisites`, errors, true);

  const lessons = expectNonEmptyArray(input.lessons, `${path}.lessons`, errors);
  if (lessons) {
    validateUniqueIds(lessons, `${path}.lessons`, errors);
    lessons.forEach((lesson, index) =>
      validateLesson(lesson, `${path}.lessons[${index}]`, errors)
    );
  }

  if (input.glossary !== undefined) {
    const glossary = expectArray(input.glossary, `${path}.glossary`, errors);
    if (glossary) {
      validateUniqueIds(glossary, `${path}.glossary`, errors);
      glossary.forEach((entry, index) =>
        validateGlossaryEntry(entry, `${path}.glossary[${index}]`, errors)
      );
    }
  }
}

function validateLesson(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (!isRecord(input)) {
    addError(errors, path, "Lesson must be an object.");
    return;
  }

  validateId(input.id, `${path}.id`, errors);
  expectNonEmptyString(input.title, `${path}.title`, errors);
  expectNonEmptyString(input.summary, `${path}.summary`, errors);
  validateStringArray(input.objectives, `${path}.objectives`, errors, true);

  if (input.estimatedMinutes !== undefined) {
    expectPositiveNumber(input.estimatedMinutes, `${path}.estimatedMinutes`, errors);
  }

  const sections = expectNonEmptyArray(input.sections, `${path}.sections`, errors);
  if (sections) {
    validateUniqueIds(sections, `${path}.sections`, errors);
    sections.forEach((section, index) =>
      validateSection(section, `${path}.sections[${index}]`, errors)
    );
  }

  if (input.revision !== undefined) {
    validateRevision(input.revision, `${path}.revision`, errors);
  }
}

function validateSection(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (!isRecord(input)) {
    addError(errors, path, "Section must be an object.");
    return;
  }

  validateId(input.id, `${path}.id`, errors);
  expectNonEmptyString(input.title, `${path}.title`, errors);

  const blocks = expectNonEmptyArray(input.blocks, `${path}.blocks`, errors);
  if (blocks) {
    validateUniqueIds(blocks, `${path}.blocks`, errors);
    blocks.forEach((block, index) =>
      validateBlock(block, `${path}.blocks[${index}]`, errors)
    );
  }
}

function validateBlock(input: unknown, path: string, errors: ValidationError[]) {
  if (!isRecord(input)) {
    addError(errors, path, "Block must be an object.");
    return;
  }

  validateId(input.id, `${path}.id`, errors);

  switch (input.type) {
    case "title":
      expectNonEmptyString(input.title, `${path}.title`, errors);
      expectOptionalString(input.kicker, `${path}.kicker`, errors);
      expectOptionalString(input.subtitle, `${path}.subtitle`, errors);
      if (input.objectives !== undefined) {
        validateRichTextRows(input.objectives, `${path}.objectives`, errors);
      }
      break;
    case "concept":
      expectNonEmptyString(input.title, `${path}.title`, errors);
      validateRichText(input.body, `${path}.body`, errors);
      if (input.keyIdeas !== undefined) {
        validateRichTextRows(input.keyIdeas, `${path}.keyIdeas`, errors);
      }
      break;
    case "intuition":
      expectNonEmptyString(input.title, `${path}.title`, errors);
      validateRichText(input.body, `${path}.body`, errors);
      if (input.takeaway !== undefined) {
        validateRichText(input.takeaway, `${path}.takeaway`, errors);
      }
      break;
    case "latex":
      validateLatex(input.latex, `${path}.latex`, true, errors);
      expectOptionalString(input.caption, `${path}.caption`, errors);
      if (input.display !== undefined && typeof input.display !== "boolean") {
        addError(errors, `${path}.display`, "Display must be a boolean.");
      }
      break;
    case "graph":
      expectNonEmptyString(input.title, `${path}.title`, errors);
      expectNonEmptyString(input.description, `${path}.description`, errors);
      validateGraphSpec(input.spec, `${path}.spec`, errors);
      break;
    case "workedExample":
      validateWorkedExample(input, path, errors);
      break;
    case "commonMistake":
      expectNonEmptyString(input.title, `${path}.title`, errors);
      expectNonEmptyString(input.misconception, `${path}.misconception`, errors);
      expectNonEmptyString(input.incorrectStep, `${path}.incorrectStep`, errors);
      expectNonEmptyString(input.whyWrong, `${path}.whyWrong`, errors);
      expectNonEmptyString(input.correction, `${path}.correction`, errors);
      expectOptionalString(input.checkPrompt, `${path}.checkPrompt`, errors);
      break;
    case "quiz":
      validateQuizBlock(input, path, errors);
      break;
    case "summary":
      validateRichTextRows(input.items, `${path}.items`, errors);
      break;
    default:
      addError(errors, `${path}.type`, `Unknown block type: ${String(input.type)}.`);
  }
}

function validateWorkedExample(
  input: Record<string, unknown>,
  path: string,
  errors: ValidationError[]
) {
  expectNonEmptyString(input.title, `${path}.title`, errors);
  expectNonEmptyString(input.goal, `${path}.goal`, errors);
  expectOptionalString(input.given, `${path}.given`, errors);
  expectOptionalString(input.interpretation, `${path}.interpretation`, errors);

  const steps = expectNonEmptyArray(input.steps, `${path}.steps`, errors);
  if (!steps) {
    return;
  }

  validateUniqueIds(steps, `${path}.steps`, errors);
  steps.forEach((step, index) => {
    const stepPath = `${path}.steps[${index}]`;
    if (!isRecord(step)) {
      addError(errors, stepPath, "Worked step must be an object.");
      return;
    }
    validateId(step.id, `${stepPath}.id`, errors);
    expectNonEmptyString(step.label, `${stepPath}.label`, errors);
    expectNonEmptyString(step.explanation, `${stepPath}.explanation`, errors);
    if (step.latex !== undefined) {
      validateLatex(step.latex, `${stepPath}.latex`, true, errors);
    }
  });
}

function validateQuizBlock(
  input: Record<string, unknown>,
  path: string,
  errors: ValidationError[]
) {
  expectOptionalString(input.title, `${path}.title`, errors);

  const questions = expectNonEmptyArray(input.questions, `${path}.questions`, errors);
  if (!questions) {
    return;
  }

  validateUniqueIds(questions, `${path}.questions`, errors);
  questions.forEach((question, index) =>
    validateQuizQuestion(question, `${path}.questions[${index}]`, errors)
  );
}

function validateQuizQuestion(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (!isRecord(input)) {
    addError(errors, path, "Quiz question must be an object.");
    return;
  }

  validateId(input.id, `${path}.id`, errors);
  validateRichText(input.prompt, `${path}.prompt`, errors);
  validateStringArray(input.conceptTags, `${path}.conceptTags`, errors, true);
  expectOptionalString(input.hint, `${path}.hint`, errors);

  switch (input.kind) {
    case "multipleChoice": {
      const options = expectNonEmptyArray(input.options, `${path}.options`, errors);
      expectNonEmptyString(input.correctOptionId, `${path}.correctOptionId`, errors);

      if (options) {
        validateUniqueIds(options, `${path}.options`, errors);
        const optionIds = new Set<string>();
        options.forEach((option, optionIndex) => {
          const optionPath = `${path}.options[${optionIndex}]`;
          if (!isRecord(option)) {
            addError(errors, optionPath, "Quiz option must be an object.");
            return;
          }
          validateId(option.id, `${optionPath}.id`, errors);
          if (typeof option.id === "string") {
            optionIds.add(option.id);
          }
          validateRichText(option.text, `${optionPath}.text`, errors);
          expectNonEmptyString(option.feedback, `${optionPath}.feedback`, errors);
        });
        if (
          typeof input.correctOptionId === "string" &&
          !optionIds.has(input.correctOptionId)
        ) {
          addError(
            errors,
            `${path}.correctOptionId`,
            "Correct option id must match one of the question options."
          );
        }
      }
      break;
    }
    case "shortAnswer":
      validateStringArray(
        input.acceptedAnswers,
        `${path}.acceptedAnswers`,
        errors,
        true
      );
      if (!isRecord(input.feedback)) {
        addError(errors, `${path}.feedback`, "Short answer feedback is required.");
      } else {
        expectNonEmptyString(
          input.feedback.correct,
          `${path}.feedback.correct`,
          errors
        );
        expectNonEmptyString(
          input.feedback.incorrect,
          `${path}.feedback.incorrect`,
          errors
        );
      }
      break;
    default:
      addError(errors, `${path}.kind`, `Unknown quiz question kind: ${String(input.kind)}.`);
  }
}

function validateGraphSpec(input: unknown, path: string, errors: ValidationError[]) {
  if (!isRecord(input)) {
    addError(errors, path, "Graph spec must be an object.");
    return;
  }

  validateAxis(input.xAxis, `${path}.xAxis`, errors);
  validateAxis(input.yAxis, `${path}.yAxis`, errors);

  const series = expectNonEmptyArray(input.series, `${path}.series`, errors);
  if (series) {
    validateUniqueIds(series, `${path}.series`, errors);
    series.forEach((item, index) =>
      validateGraphSeries(item, `${path}.series[${index}]`, errors)
    );
  }

  if (input.annotations !== undefined) {
    const annotations = expectArray(input.annotations, `${path}.annotations`, errors);
    if (annotations) {
      validateUniqueIds(annotations, `${path}.annotations`, errors);
      annotations.forEach((annotation, index) =>
        validateGraphAnnotation(annotation, `${path}.annotations[${index}]`, errors)
      );
    }
  }
}

function validateAxis(input: unknown, path: string, errors: ValidationError[]) {
  if (!isRecord(input)) {
    addError(errors, path, "Axis spec must be an object.");
    return;
  }

  expectNonEmptyString(input.label, `${path}.label`, errors);
  expectNumber(input.min, `${path}.min`, errors);
  expectNumber(input.max, `${path}.max`, errors);

  if (
    typeof input.min === "number" &&
    typeof input.max === "number" &&
    Number.isFinite(input.min) &&
    Number.isFinite(input.max) &&
    input.min >= input.max
  ) {
    addError(errors, path, "Axis min must be less than max.");
  }

  if (input.ticks !== undefined) {
    const ticks = expectArray(input.ticks, `${path}.ticks`, errors);
    if (ticks) {
      ticks.forEach((tick, index) =>
        expectNumber(tick, `${path}.ticks[${index}]`, errors)
      );
    }
  }
}

function validateGraphSeries(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (!isRecord(input)) {
    addError(errors, path, "Graph series must be an object.");
    return;
  }

  validateId(input.id, `${path}.id`, errors);
  expectNonEmptyString(input.label, `${path}.label`, errors);

  switch (input.kind) {
    case "function":
      expectNonEmptyString(input.expression, `${path}.expression`, errors);
      if (input.domain !== undefined) {
        validateNumberPair(input.domain, `${path}.domain`, errors);
      }
      break;
    case "points": {
      const points = expectNonEmptyArray(input.points, `${path}.points`, errors);
      points?.forEach((point, index) =>
        validateNumberPair(point, `${path}.points[${index}]`, errors)
      );
      break;
    }
    case "line":
      validateLinePoints(input.through, `${path}.through`, errors);
      break;
    default:
      addError(errors, `${path}.kind`, `Unknown graph series kind: ${String(input.kind)}.`);
  }
}

function validateGraphAnnotation(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (!isRecord(input)) {
    addError(errors, path, "Graph annotation must be an object.");
    return;
  }

  validateId(input.id, `${path}.id`, errors);
  expectNonEmptyString(input.label, `${path}.label`, errors);
  expectOptionalString(input.text, `${path}.text`, errors);
  if (input.point !== undefined) {
    validateNumberPair(input.point, `${path}.point`, errors);
  }
}

function validateRevision(input: unknown, path: string, errors: ValidationError[]) {
  if (!isRecord(input)) {
    addError(errors, path, "Revision layer must be an object.");
    return;
  }

  validateStringArray(input.keyIdeas, `${path}.keyIdeas`, errors, true);
  validateStringArray(input.recallPrompts, `${path}.recallPrompts`, errors, true);
  validateStringArray(input.mistakeIds, `${path}.mistakeIds`, errors, true);
  validateStringArray(input.quizIds, `${path}.quizIds`, errors, true);
}

function validateGlossaryEntry(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (!isRecord(input)) {
    addError(errors, path, "Glossary entry must be an object.");
    return;
  }

  validateId(input.id, `${path}.id`, errors);
  expectNonEmptyString(input.term, `${path}.term`, errors);
  expectNonEmptyString(input.definition, `${path}.definition`, errors);
  if (input.latex !== undefined) {
    validateLatex(input.latex, `${path}.latex`, false, errors);
  }
}

function validateRichText(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  const segments = expectNonEmptyArray(input, path, errors);
  if (!segments) {
    return;
  }

  segments.forEach((segment, index) => {
    const segmentPath = `${path}[${index}]`;
    if (!isRecord(segment)) {
      addError(errors, segmentPath, "Rich text segment must be an object.");
      return;
    }

    switch (segment.kind) {
      case "text":
        expectNonEmptyString(segment.value, `${segmentPath}.value`, errors);
        break;
      case "inlineMath":
        validateLatex(segment.latex, `${segmentPath}.latex`, false, errors);
        break;
      case "term":
        validateId(segment.termId, `${segmentPath}.termId`, errors);
        expectNonEmptyString(segment.label, `${segmentPath}.label`, errors);
        break;
      default:
        addError(
          errors,
          `${segmentPath}.kind`,
          `Unknown rich text segment kind: ${String(segment.kind)}.`
        );
    }
  });
}

function validateRichTextRows(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  const rows = expectNonEmptyArray(input, path, errors);
  if (!rows) {
    return;
  }

  rows.forEach((row, index) => validateRichText(row, `${path}[${index}]`, errors));
}

function validateLatex(
  input: unknown,
  path: string,
  displayMode: boolean,
  errors: ValidationError[]
) {
  if (!expectNonEmptyString(input, path, errors)) {
    return;
  }

  if (!isLatexRenderable(input, displayMode)) {
    addError(errors, path, "LaTeX must render with KaTeX.");
  }
}

function validateNumberPair(input: unknown, path: string, errors: ValidationError[]) {
  if (!Array.isArray(input) || input.length !== 2) {
    addError(errors, path, "Expected a two-number pair.");
    return;
  }

  expectNumber(input[0], `${path}[0]`, errors);
  expectNumber(input[1], `${path}[1]`, errors);
}

function validateLinePoints(input: unknown, path: string, errors: ValidationError[]) {
  if (!Array.isArray(input) || input.length !== 2) {
    addError(errors, path, "Line series must contain two points.");
    return;
  }

  validateNumberPair(input[0], `${path}[0]`, errors);
  validateNumberPair(input[1], `${path}[1]`, errors);
}

function validateUniqueIds(
  items: unknown[],
  path: string,
  errors: ValidationError[]
) {
  const seen = new Map<string, number>();

  items.forEach((item, index) => {
    if (!isRecord(item) || typeof item.id !== "string") {
      return;
    }

    const firstIndex = seen.get(item.id);
    if (firstIndex !== undefined) {
      addError(
        errors,
        `${path}[${index}].id`,
        `Duplicate id "${item.id}" also appears at ${path}[${firstIndex}].`
      );
      return;
    }

    seen.set(item.id, index);
  });
}

function validateStringArray(
  input: unknown,
  path: string,
  errors: ValidationError[],
  requireNonEmpty: boolean
) {
  const array = requireNonEmpty
    ? expectNonEmptyArray(input, path, errors)
    : expectArray(input, path, errors);
  if (!array) {
    return;
  }

  array.forEach((item, index) =>
    expectNonEmptyString(item, `${path}[${index}]`, errors)
  );
}

function validateId(input: unknown, path: string, errors: ValidationError[]) {
  if (!expectNonEmptyString(input, path, errors)) {
    return;
  }

  if (!idPattern.test(input)) {
    addError(errors, path, "Id must be lowercase kebab-case.");
  }
}

function expectNonEmptyString(
  input: unknown,
  path: string,
  errors: ValidationError[]
): input is string {
  if (typeof input !== "string" || input.trim().length === 0) {
    addError(errors, path, "Expected a non-empty string.");
    return false;
  }
  return true;
}

function expectOptionalString(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (input !== undefined && typeof input !== "string") {
    addError(errors, path, "Expected a string when present.");
  }
}

function expectPositiveNumber(
  input: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (typeof input !== "number" || !Number.isFinite(input) || input <= 0) {
    addError(errors, path, "Expected a positive number.");
  }
}

function expectNumber(input: unknown, path: string, errors: ValidationError[]) {
  if (typeof input !== "number" || !Number.isFinite(input)) {
    addError(errors, path, "Expected a finite number.");
  }
}

function expectOneOf(
  input: unknown,
  allowed: string[],
  path: string,
  errors: ValidationError[]
) {
  if (typeof input !== "string" || !allowed.includes(input)) {
    addError(errors, path, `Expected one of: ${allowed.join(", ")}.`);
  }
}

function expectArray(
  input: unknown,
  path: string,
  errors: ValidationError[]
): unknown[] | undefined {
  if (!Array.isArray(input)) {
    addError(errors, path, "Expected an array.");
    return undefined;
  }
  return input;
}

function expectNonEmptyArray(
  input: unknown,
  path: string,
  errors: ValidationError[]
): unknown[] | undefined {
  const array = expectArray(input, path, errors);
  if (!array) {
    return undefined;
  }

  if (array.length === 0) {
    addError(errors, path, "Expected a non-empty array.");
    return undefined;
  }

  return array;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function addError(errors: ValidationError[], path: string, message: string) {
  errors.push({ path, message });
}
