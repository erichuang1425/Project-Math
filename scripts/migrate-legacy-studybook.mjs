#!/usr/bin/env node
/**
 * One-time migrator: legacy Studybook (schemaVersion 1.0) → Course (schemaVersion 2.0).
 *
 * Reads src/studybook/fixtures/derivatives-first-principles.studybook.json,
 * writes src/content/fixtures/courses/calculus-i.course.json. Does not delete the source.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

const SOURCE = join(repoRoot, "src/studybook/fixtures/derivatives-first-principles.studybook.json");
const TARGET = join(repoRoot, "src/content/fixtures/courses/calculus-i.course.json");

function migrateLesson(lesson, difficulty) {
  const objectives = lesson.objectives.map((text, idx) => ({
    id: `${lesson.id}-obj-${idx + 1}`,
    text
  }));

  return {
    id: lesson.id,
    slug: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    objectives,
    prerequisiteLessonIds: lesson.prerequisiteLessonIds ?? [],
    estimatedMinutes: lesson.estimatedMinutes ?? 20,
    difficulty,
    sections: lesson.sections,
    ...(lesson.revision ? { revision: lesson.revision } : {})
  };
}

function buildCourse(legacy) {
  const lessons = legacy.lessons;
  const firstPrinciples = lessons.map((lesson) => migrateLesson(lesson, "intro"));

  return {
    schemaVersion: "2.0",
    id: "calculus-i",
    slug: "calculus-i",
    title: "Calculus I",
    subject: "math",
    level: "intro",
    summary:
      "Foundations through derivatives from first principles and the standard differentiation rules.",
    illustrationId: "tangent-curve",
    prerequisites: legacy.prerequisites ?? ["algebra", "functions"],
    modules: [
      {
        id: "first-principles",
        title: "Derivatives from First Principles",
        summary:
          "Build the derivative as a limit of slopes between two points. Stay inside the definition before invoking shortcuts.",
        lessons: firstPrinciples
      }
    ],
    glossary: [
      {
        id: "derivative",
        term: "derivative",
        definition:
          "The instantaneous rate of change of a function at a point, defined as the limit of the difference quotient.",
        aliases: ["instantaneous rate"]
      },
      {
        id: "difference-quotient",
        term: "difference quotient",
        definition:
          "The ratio (f(x + h) − f(x))/h. The derivative is the limit of this ratio as h approaches zero.",
        aliases: ["average rate of change"]
      },
      {
        id: "secant-line",
        term: "secant line",
        definition:
          "A line passing through two points on the graph of a function. Its slope is the average rate of change between those points."
      },
      {
        id: "tangent-line",
        term: "tangent line",
        definition:
          "The line through a single point of a curve whose slope equals the derivative of the function at that point.",
        aliases: ["tangent"]
      },
      {
        id: "limit",
        term: "limit",
        definition:
          "The value a function approaches as the input approaches a target value. Written as lim_{x→a} f(x)."
      },
      {
        id: "continuity",
        term: "continuity",
        definition:
          "A function is continuous at x = a when lim_{x→a} f(x) exists, f(a) exists, and the two are equal."
      },
      {
        id: "differentiability",
        term: "differentiability",
        definition:
          "A function is differentiable at x = a when its derivative exists at that point. Differentiability implies continuity, but not the reverse."
      },
      {
        id: "constant-function",
        term: "constant function",
        definition:
          "A function whose output never changes, written f(x) = c for some real number c."
      },
      {
        id: "slope",
        term: "slope",
        definition:
          "The ratio of vertical change to horizontal change between two points; for a line, the rise over the run."
      }
    ]
  };
}

const legacy = JSON.parse(readFileSync(SOURCE, "utf8"));
const course = buildCourse(legacy);
mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(TARGET, JSON.stringify(course, null, 2) + "\n");

console.log(`Wrote ${TARGET}`);
console.log(`Modules: ${course.modules.length}`);
console.log(`Lessons: ${course.modules.reduce((sum, m) => sum + m.lessons.length, 0)}`);
console.log(`Glossary terms: ${course.glossary.length}`);
