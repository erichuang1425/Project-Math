import { isLatexRenderable } from "../math/renderLatex";
import type { Course } from "./schema";

export interface ValidationError {
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; course: Course }
  | { ok: false; errors: ValidationError[] };

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateContent(input: unknown): ValidationResult {
  const ctx: ValidationContext = {
    errors: [],
    glossaryIds: new Set<string>(),
    lessonIds: new Set<string>(),
    lessonPrereqs: new Map<string, string[]>()
  };

  validateCourse(input, "$", ctx);

  if (ctx.errors.length > 0) {
    return { ok: false, errors: ctx.errors };
  }

  return { ok: true, course: input as Course };
}

interface ValidationContext {
  errors: ValidationError[];
  glossaryIds: Set<string>;
  lessonIds: Set<string>;
  lessonPrereqs: Map<string, string[]>;
}

function validateCourse(input: unknown, path: string, ctx: ValidationContext) {
  if (!isRecord(input)) {
    addError(ctx, path, "Course must be an object.");
    return;
  }

  if (input.schemaVersion !== "2.0") {
    addError(ctx, `${path}.schemaVersion`, 'Schema version must be "2.0".');
  }

  validateId(input.id, `${path}.id`, ctx);
  validateId(input.slug, `${path}.slug`, ctx);
  expectNonEmptyString(input.title, `${path}.title`, ctx);
  expectOneOf(input.subject, ["math", "technical"], `${path}.subject`, ctx);
  expectOneOf(input.level, ["intro", "core", "stretch"], `${path}.level`, ctx);
  expectNonEmptyString(input.summary, `${path}.summary`, ctx);
  expectOptionalString(input.illustrationId, `${path}.illustrationId`, ctx);
  validateStringArray(input.prerequisites, `${path}.prerequisites`, ctx, false);

  const glossary = expectArray(input.glossary, `${path}.glossary`, ctx);
  if (glossary) {
    validateUniqueIds(glossary, `${path}.glossary`, ctx);
    glossary.forEach((entry, index) => {
      const ePath = `${path}.glossary[${index}]`;
      if (!isRecord(entry)) {
        addError(ctx, ePath, "Glossary term must be an object.");
        return;
      }
      validateId(entry.id, `${ePath}.id`, ctx);
      expectNonEmptyString(entry.term, `${ePath}.term`, ctx);
      expectNonEmptyString(entry.definition, `${ePath}.definition`, ctx);
      if (entry.aliases !== undefined) {
        validateStringArray(entry.aliases, `${ePath}.aliases`, ctx, false);
      }
      if (entry.latex !== undefined) {
        validateLatex(entry.latex, `${ePath}.latex`, false, ctx);
      }
      if (typeof entry.id === "string") {
        ctx.glossaryIds.add(entry.id);
      }
    });
  }

  const modules = expectNonEmptyArray(input.modules, `${path}.modules`, ctx);
  if (modules) {
    validateUniqueIds(modules, `${path}.modules`, ctx);
    modules.forEach((mod, idx) => validateModule(mod, `${path}.modules[${idx}]`, ctx));
  }

  validatePrerequisiteGraph(ctx);
}

function validateModule(input: unknown, path: string, ctx: ValidationContext) {
  if (!isRecord(input)) {
    addError(ctx, path, "Module must be an object.");
    return;
  }
  validateId(input.id, `${path}.id`, ctx);
  expectNonEmptyString(input.title, `${path}.title`, ctx);
  expectNonEmptyString(input.summary, `${path}.summary`, ctx);

  const lessons = expectNonEmptyArray(input.lessons, `${path}.lessons`, ctx);
  if (lessons) {
    validateUniqueIds(lessons, `${path}.lessons`, ctx);
    lessons.forEach((lesson, idx) => validateLesson(lesson, `${path}.lessons[${idx}]`, ctx));
  }
}

function validateLesson(input: unknown, path: string, ctx: ValidationContext) {
  if (!isRecord(input)) {
    addError(ctx, path, "Lesson must be an object.");
    return;
  }
  validateId(input.id, `${path}.id`, ctx);
  validateId(input.slug, `${path}.slug`, ctx);
  expectNonEmptyString(input.title, `${path}.title`, ctx);
  expectNonEmptyString(input.summary, `${path}.summary`, ctx);
  expectPositiveNumber(input.estimatedMinutes, `${path}.estimatedMinutes`, ctx);
  expectOneOf(input.difficulty, ["intro", "core", "stretch"], `${path}.difficulty`, ctx);

  const objectiveIds = new Set<string>();
  const objectives = expectNonEmptyArray(input.objectives, `${path}.objectives`, ctx);
  if (objectives) {
    validateUniqueIds(objectives, `${path}.objectives`, ctx);
    objectives.forEach((obj, idx) => {
      const oPath = `${path}.objectives[${idx}]`;
      if (!isRecord(obj)) {
        addError(ctx, oPath, "Objective must be an object with id and text.");
        return;
      }
      validateId(obj.id, `${oPath}.id`, ctx);
      expectNonEmptyString(obj.text, `${oPath}.text`, ctx);
      if (typeof obj.id === "string") {
        objectiveIds.add(obj.id);
      }
    });
  }

  validateStringArray(input.prerequisiteLessonIds, `${path}.prerequisiteLessonIds`, ctx, false);

  if (typeof input.id === "string") {
    ctx.lessonIds.add(input.id);
    if (Array.isArray(input.prerequisiteLessonIds)) {
      ctx.lessonPrereqs.set(
        input.id,
        (input.prerequisiteLessonIds as unknown[]).filter(
          (item): item is string => typeof item === "string"
        )
      );
    }
  }

  const sections = expectNonEmptyArray(input.sections, `${path}.sections`, ctx);
  if (sections) {
    validateUniqueIds(sections, `${path}.sections`, ctx);
    sections.forEach((section, idx) =>
      validateSection(section, `${path}.sections[${idx}]`, ctx, objectiveIds)
    );

    const allBlockIds = new Set<string>();
    sections.forEach((section, sIdx) => {
      if (!isRecord(section) || !Array.isArray(section.blocks)) return;
      (section.blocks as unknown[]).forEach((block, bIdx) => {
        if (!isRecord(block) || typeof block.id !== "string") return;
        if (allBlockIds.has(block.id)) {
          addError(
            ctx,
            `${path}.sections[${sIdx}].blocks[${bIdx}].id`,
            `Block id "${block.id}" is duplicated within the lesson.`
          );
        } else {
          allBlockIds.add(block.id);
        }
      });
    });
  }

  if (input.revision !== undefined) {
    validateRevision(input.revision, `${path}.revision`, ctx);
  }
}

function validateSection(
  input: unknown,
  path: string,
  ctx: ValidationContext,
  objectiveIds: Set<string>
) {
  if (!isRecord(input)) {
    addError(ctx, path, "Section must be an object.");
    return;
  }
  validateId(input.id, `${path}.id`, ctx);
  expectNonEmptyString(input.title, `${path}.title`, ctx);

  const blocks = expectNonEmptyArray(input.blocks, `${path}.blocks`, ctx);
  if (blocks) {
    validateUniqueIds(blocks, `${path}.blocks`, ctx);
    blocks.forEach((block, idx) =>
      validateBlock(block, `${path}.blocks[${idx}]`, ctx, objectiveIds)
    );
  }
}

function validateBlock(
  input: unknown,
  path: string,
  ctx: ValidationContext,
  objectiveIds: Set<string>
) {
  if (!isRecord(input)) {
    addError(ctx, path, "Block must be an object.");
    return;
  }

  validateId(input.id, `${path}.id`, ctx);

  if (input.estimatedMinutes !== undefined) {
    expectPositiveNumber(input.estimatedMinutes, `${path}.estimatedMinutes`, ctx);
  }

  if (input.objectiveIds !== undefined) {
    const arr = expectArray(input.objectiveIds, `${path}.objectiveIds`, ctx);
    if (arr) {
      arr.forEach((oid, i) => {
        const oidPath = `${path}.objectiveIds[${i}]`;
        if (!expectNonEmptyString(oid, oidPath, ctx)) return;
        if (!objectiveIds.has(oid)) {
          addError(ctx, oidPath, `Block objective id "${oid}" is not declared on the lesson.`);
        }
      });
    }
  }

  switch (input.type) {
    case "title":
      expectNonEmptyString(input.title, `${path}.title`, ctx);
      expectOptionalString(input.kicker, `${path}.kicker`, ctx);
      expectOptionalString(input.subtitle, `${path}.subtitle`, ctx);
      if (input.objectives !== undefined) {
        validateRichTextRows(input.objectives, `${path}.objectives`, ctx);
      }
      break;
    case "concept":
      expectNonEmptyString(input.title, `${path}.title`, ctx);
      validateRichText(input.body, `${path}.body`, ctx);
      if (input.keyIdeas !== undefined) {
        validateRichTextRows(input.keyIdeas, `${path}.keyIdeas`, ctx);
      }
      break;
    case "intuition":
      expectNonEmptyString(input.title, `${path}.title`, ctx);
      validateRichText(input.body, `${path}.body`, ctx);
      if (input.takeaway !== undefined) {
        validateRichText(input.takeaway, `${path}.takeaway`, ctx);
      }
      break;
    case "latex":
      validateLatex(input.latex, `${path}.latex`, true, ctx);
      expectOptionalString(input.caption, `${path}.caption`, ctx);
      if (input.display !== undefined && typeof input.display !== "boolean") {
        addError(ctx, `${path}.display`, "Display must be a boolean.");
      }
      break;
    case "graph":
      expectNonEmptyString(input.title, `${path}.title`, ctx);
      expectNonEmptyString(input.description, `${path}.description`, ctx);
      validateGraphSpec(input.spec, `${path}.spec`, ctx);
      break;
    case "workedExample":
      validateWorkedExample(input, path, ctx);
      break;
    case "commonMistake":
      expectNonEmptyString(input.title, `${path}.title`, ctx);
      expectNonEmptyString(input.misconception, `${path}.misconception`, ctx);
      expectNonEmptyString(input.incorrectStep, `${path}.incorrectStep`, ctx);
      expectNonEmptyString(input.whyWrong, `${path}.whyWrong`, ctx);
      expectNonEmptyString(input.correction, `${path}.correction`, ctx);
      expectOptionalString(input.checkPrompt, `${path}.checkPrompt`, ctx);
      break;
    case "quiz":
      validateQuizBlock(input, path, ctx);
      break;
    case "summary":
      validateRichTextRows(input.items, `${path}.items`, ctx);
      break;
    default:
      addError(ctx, `${path}.type`, `Unknown block type: ${String(input.type)}.`);
  }
}

function validateWorkedExample(
  input: Record<string, unknown>,
  path: string,
  ctx: ValidationContext
) {
  expectNonEmptyString(input.title, `${path}.title`, ctx);
  expectNonEmptyString(input.goal, `${path}.goal`, ctx);
  expectOptionalString(input.given, `${path}.given`, ctx);
  expectOptionalString(input.interpretation, `${path}.interpretation`, ctx);

  const steps = expectNonEmptyArray(input.steps, `${path}.steps`, ctx);
  if (!steps) return;

  validateUniqueIds(steps, `${path}.steps`, ctx);
  steps.forEach((step, idx) => {
    const stepPath = `${path}.steps[${idx}]`;
    if (!isRecord(step)) {
      addError(ctx, stepPath, "Worked step must be an object.");
      return;
    }
    validateId(step.id, `${stepPath}.id`, ctx);
    expectNonEmptyString(step.label, `${stepPath}.label`, ctx);
    expectNonEmptyString(step.explanation, `${stepPath}.explanation`, ctx);
    if (step.latex !== undefined) {
      validateLatex(step.latex, `${stepPath}.latex`, true, ctx);
    }
  });
}

function validateQuizBlock(input: Record<string, unknown>, path: string, ctx: ValidationContext) {
  expectOptionalString(input.title, `${path}.title`, ctx);

  const questions = expectNonEmptyArray(input.questions, `${path}.questions`, ctx);
  if (!questions) return;

  validateUniqueIds(questions, `${path}.questions`, ctx);
  questions.forEach((q, idx) => validateQuizQuestion(q, `${path}.questions[${idx}]`, ctx));
}

function validateQuizQuestion(input: unknown, path: string, ctx: ValidationContext) {
  if (!isRecord(input)) {
    addError(ctx, path, "Quiz question must be an object.");
    return;
  }
  validateId(input.id, `${path}.id`, ctx);
  validateRichText(input.prompt, `${path}.prompt`, ctx);
  validateStringArray(input.conceptTags, `${path}.conceptTags`, ctx, true);
  expectOptionalString(input.hint, `${path}.hint`, ctx);

  switch (input.kind) {
    case "multipleChoice": {
      const options = expectNonEmptyArray(input.options, `${path}.options`, ctx);
      expectNonEmptyString(input.correctOptionId, `${path}.correctOptionId`, ctx);
      if (options) {
        validateUniqueIds(options, `${path}.options`, ctx);
        const optionIds = new Set<string>();
        options.forEach((option, optIdx) => {
          const oPath = `${path}.options[${optIdx}]`;
          if (!isRecord(option)) {
            addError(ctx, oPath, "Quiz option must be an object.");
            return;
          }
          validateId(option.id, `${oPath}.id`, ctx);
          if (typeof option.id === "string") optionIds.add(option.id);
          validateRichText(option.text, `${oPath}.text`, ctx);
          expectNonEmptyString(option.feedback, `${oPath}.feedback`, ctx);
        });
        if (typeof input.correctOptionId === "string" && !optionIds.has(input.correctOptionId)) {
          addError(
            ctx,
            `${path}.correctOptionId`,
            "Correct option id must match one of the question options."
          );
        }
      }
      break;
    }
    case "shortAnswer":
      validateStringArray(input.acceptedAnswers, `${path}.acceptedAnswers`, ctx, true);
      if (!isRecord(input.feedback)) {
        addError(ctx, `${path}.feedback`, "Short answer feedback is required.");
      } else {
        expectNonEmptyString(input.feedback.correct, `${path}.feedback.correct`, ctx);
        expectNonEmptyString(input.feedback.incorrect, `${path}.feedback.incorrect`, ctx);
      }
      break;
    default:
      addError(ctx, `${path}.kind`, `Unknown quiz question kind: ${String(input.kind)}.`);
  }
}

function validateGraphSpec(input: unknown, path: string, ctx: ValidationContext) {
  if (!isRecord(input)) {
    addError(ctx, path, "Graph spec must be an object.");
    return;
  }
  validateAxis(input.xAxis, `${path}.xAxis`, ctx);
  validateAxis(input.yAxis, `${path}.yAxis`, ctx);

  const series = expectNonEmptyArray(input.series, `${path}.series`, ctx);
  if (series) {
    validateUniqueIds(series, `${path}.series`, ctx);
    series.forEach((s, idx) => validateGraphSeries(s, `${path}.series[${idx}]`, ctx));
  }

  if (input.annotations !== undefined) {
    const annotations = expectArray(input.annotations, `${path}.annotations`, ctx);
    if (annotations) {
      validateUniqueIds(annotations, `${path}.annotations`, ctx);
      annotations.forEach((a, idx) =>
        validateGraphAnnotation(a, `${path}.annotations[${idx}]`, ctx)
      );
    }
  }
}

function validateAxis(input: unknown, path: string, ctx: ValidationContext) {
  if (!isRecord(input)) {
    addError(ctx, path, "Axis spec must be an object.");
    return;
  }
  expectNonEmptyString(input.label, `${path}.label`, ctx);
  expectNumber(input.min, `${path}.min`, ctx);
  expectNumber(input.max, `${path}.max`, ctx);
  if (
    typeof input.min === "number" &&
    typeof input.max === "number" &&
    Number.isFinite(input.min) &&
    Number.isFinite(input.max) &&
    input.min >= input.max
  ) {
    addError(ctx, path, "Axis min must be less than max.");
  }
  if (input.ticks !== undefined) {
    const ticks = expectArray(input.ticks, `${path}.ticks`, ctx);
    if (ticks) {
      ticks.forEach((t, idx) => expectNumber(t, `${path}.ticks[${idx}]`, ctx));
    }
  }
}

function validateGraphSeries(input: unknown, path: string, ctx: ValidationContext) {
  if (!isRecord(input)) {
    addError(ctx, path, "Graph series must be an object.");
    return;
  }
  validateId(input.id, `${path}.id`, ctx);
  expectNonEmptyString(input.label, `${path}.label`, ctx);

  switch (input.kind) {
    case "function":
      expectNonEmptyString(input.expression, `${path}.expression`, ctx);
      if (input.domain !== undefined) {
        validateNumberPair(input.domain, `${path}.domain`, ctx);
      }
      if (input.samples !== undefined) {
        validateGraphSamples(input.samples, `${path}.samples`, ctx);
      }
      break;
    case "points": {
      const points = expectNonEmptyArray(input.points, `${path}.points`, ctx);
      points?.forEach((p, idx) => validateNumberPair(p, `${path}.points[${idx}]`, ctx));
      break;
    }
    case "line":
      validateLinePoints(input.through, `${path}.through`, ctx);
      break;
    default:
      addError(ctx, `${path}.kind`, `Unknown graph series kind: ${String(input.kind)}.`);
  }
}

function validateGraphAnnotation(input: unknown, path: string, ctx: ValidationContext) {
  if (!isRecord(input)) {
    addError(ctx, path, "Graph annotation must be an object.");
    return;
  }
  validateId(input.id, `${path}.id`, ctx);
  expectNonEmptyString(input.label, `${path}.label`, ctx);
  expectOptionalString(input.text, `${path}.text`, ctx);
  if (input.point !== undefined) {
    validateNumberPair(input.point, `${path}.point`, ctx);
  }
}

function validateRevision(input: unknown, path: string, ctx: ValidationContext) {
  if (!isRecord(input)) {
    addError(ctx, path, "Revision layer must be an object.");
    return;
  }
  validateStringArray(input.keyIdeas, `${path}.keyIdeas`, ctx, false);
  validateStringArray(input.recallPrompts, `${path}.recallPrompts`, ctx, false);
  validateStringArray(input.mistakeIds, `${path}.mistakeIds`, ctx, false);
  validateStringArray(input.quizIds, `${path}.quizIds`, ctx, false);
}

function validateRichText(input: unknown, path: string, ctx: ValidationContext) {
  const segments = expectNonEmptyArray(input, path, ctx);
  if (!segments) return;

  segments.forEach((segment, idx) => {
    const segPath = `${path}[${idx}]`;
    if (!isRecord(segment)) {
      addError(ctx, segPath, "Rich text segment must be an object.");
      return;
    }
    switch (segment.kind) {
      case "text":
        expectNonEmptyString(segment.value, `${segPath}.value`, ctx);
        break;
      case "inlineMath":
        validateLatex(segment.latex, `${segPath}.latex`, false, ctx);
        break;
      case "term":
        if (expectNonEmptyString(segment.termId, `${segPath}.termId`, ctx)) {
          if (!idPattern.test(segment.termId)) {
            addError(ctx, `${segPath}.termId`, "Id must be lowercase kebab-case.");
          } else if (!ctx.glossaryIds.has(segment.termId)) {
            addError(
              ctx,
              `${segPath}.termId`,
              `Term "${segment.termId}" does not appear in the course glossary.`
            );
          }
        }
        expectNonEmptyString(segment.label, `${segPath}.label`, ctx);
        break;
      default:
        addError(
          ctx,
          `${segPath}.kind`,
          `Unknown rich text segment kind: ${String(segment.kind)}.`
        );
    }
  });
}

function validateRichTextRows(input: unknown, path: string, ctx: ValidationContext) {
  const rows = expectNonEmptyArray(input, path, ctx);
  if (!rows) return;
  rows.forEach((row, idx) => validateRichText(row, `${path}[${idx}]`, ctx));
}

function validateLatex(input: unknown, path: string, displayMode: boolean, ctx: ValidationContext) {
  if (!expectNonEmptyString(input, path, ctx)) return;
  if (!isLatexRenderable(input, displayMode)) {
    addError(ctx, path, "LaTeX must render with KaTeX.");
  }
}

function validateNumberPair(input: unknown, path: string, ctx: ValidationContext) {
  if (!Array.isArray(input) || input.length !== 2) {
    addError(ctx, path, "Expected a two-number pair.");
    return;
  }
  expectNumber(input[0], `${path}[0]`, ctx);
  expectNumber(input[1], `${path}[1]`, ctx);
}

function validateGraphSamples(input: unknown, path: string, ctx: ValidationContext) {
  const samples = expectArray(input, path, ctx);
  if (!samples) return;
  if (samples.length < 2) {
    addError(ctx, path, "Function samples must contain at least two coordinate pairs.");
  }
  samples.forEach((s, idx) => validateNumberPair(s, `${path}[${idx}]`, ctx));
}

function validateLinePoints(input: unknown, path: string, ctx: ValidationContext) {
  if (!Array.isArray(input) || input.length !== 2) {
    addError(ctx, path, "Line series must contain two points.");
    return;
  }
  validateNumberPair(input[0], `${path}[0]`, ctx);
  validateNumberPair(input[1], `${path}[1]`, ctx);
}

function validateUniqueIds(items: unknown[], path: string, ctx: ValidationContext) {
  const seen = new Map<string, number>();
  items.forEach((item, idx) => {
    if (!isRecord(item) || typeof item.id !== "string") return;
    const firstIdx = seen.get(item.id);
    if (firstIdx !== undefined) {
      addError(
        ctx,
        `${path}[${idx}].id`,
        `Duplicate id "${item.id}" also appears at ${path}[${firstIdx}].`
      );
      return;
    }
    seen.set(item.id, idx);
  });
}

function validateStringArray(
  input: unknown,
  path: string,
  ctx: ValidationContext,
  requireNonEmpty: boolean
) {
  const arr = requireNonEmpty
    ? expectNonEmptyArray(input, path, ctx)
    : expectArray(input, path, ctx);
  if (!arr) return;
  arr.forEach((item, idx) => expectNonEmptyString(item, `${path}[${idx}]`, ctx));
}

function validateId(input: unknown, path: string, ctx: ValidationContext): boolean {
  if (!expectNonEmptyString(input, path, ctx)) return false;
  if (!idPattern.test(input)) {
    addError(ctx, path, "Id must be lowercase kebab-case.");
    return false;
  }
  return true;
}

function validatePrerequisiteGraph(ctx: ValidationContext) {
  for (const [lessonId, prereqs] of ctx.lessonPrereqs) {
    for (const prereqId of prereqs) {
      if (!ctx.lessonIds.has(prereqId)) {
        addError(
          ctx,
          `$.lessonPrereqs[${lessonId}]`,
          `Prerequisite "${prereqId}" is not a lesson in this course.`
        );
      }
    }
  }

  const visited = new Map<string, "visiting" | "done">();
  const stack: string[] = [];

  function visit(id: string): boolean {
    const state = visited.get(id);
    if (state === "visiting") {
      const cycleStart = stack.indexOf(id);
      const cycle = stack.slice(cycleStart).concat(id).join(" → ");
      addError(ctx, `$.lessonPrereqs[${id}]`, `Prerequisite cycle detected: ${cycle}.`);
      return false;
    }
    if (state === "done") return true;
    visited.set(id, "visiting");
    stack.push(id);
    const prereqs = ctx.lessonPrereqs.get(id) ?? [];
    for (const p of prereqs) {
      if (ctx.lessonIds.has(p)) {
        if (!visit(p)) {
          stack.pop();
          visited.set(id, "done");
          return false;
        }
      }
    }
    stack.pop();
    visited.set(id, "done");
    return true;
  }

  for (const id of ctx.lessonIds) {
    if (!visited.has(id)) visit(id);
  }
}

function expectNonEmptyString(
  input: unknown,
  path: string,
  ctx: ValidationContext
): input is string {
  if (typeof input !== "string" || input.trim().length === 0) {
    addError(ctx, path, "Expected a non-empty string.");
    return false;
  }
  return true;
}

function expectOptionalString(input: unknown, path: string, ctx: ValidationContext) {
  if (input !== undefined && typeof input !== "string") {
    addError(ctx, path, "Expected a string when present.");
  }
}

function expectPositiveNumber(input: unknown, path: string, ctx: ValidationContext) {
  if (typeof input !== "number" || !Number.isFinite(input) || input <= 0) {
    addError(ctx, path, "Expected a positive number.");
  }
}

function expectNumber(input: unknown, path: string, ctx: ValidationContext) {
  if (typeof input !== "number" || !Number.isFinite(input)) {
    addError(ctx, path, "Expected a finite number.");
  }
}

function expectOneOf(input: unknown, allowed: string[], path: string, ctx: ValidationContext) {
  if (typeof input !== "string" || !allowed.includes(input)) {
    addError(ctx, path, `Expected one of: ${allowed.join(", ")}.`);
  }
}

function expectArray(input: unknown, path: string, ctx: ValidationContext): unknown[] | undefined {
  if (!Array.isArray(input)) {
    addError(ctx, path, "Expected an array.");
    return undefined;
  }
  return input;
}

function expectNonEmptyArray(
  input: unknown,
  path: string,
  ctx: ValidationContext
): unknown[] | undefined {
  const arr = expectArray(input, path, ctx);
  if (!arr) return undefined;
  if (arr.length === 0) {
    addError(ctx, path, "Expected a non-empty array.");
    return undefined;
  }
  return arr;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function addError(ctx: ValidationContext, path: string, message: string) {
  ctx.errors.push({ path, message });
}
