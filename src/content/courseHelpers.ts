import type { Block, Course, GlossaryTerm, Lesson, LessonSection, Module } from "./schema";

export interface LessonLocation {
  course: Course;
  module: Module;
  moduleIndex: number;
  lesson: Lesson;
  lessonIndex: number;
  globalLessonIndex: number;
}

export function findLesson(course: Course, lessonId: string): LessonLocation | null {
  let globalIndex = 0;
  for (let m = 0; m < course.modules.length; m++) {
    const mod = course.modules[m];
    for (let l = 0; l < mod.lessons.length; l++) {
      const lesson = mod.lessons[l];
      if (lesson.id === lessonId) {
        return {
          course,
          module: mod,
          moduleIndex: m,
          lesson,
          lessonIndex: l,
          globalLessonIndex: globalIndex
        };
      }
      globalIndex++;
    }
  }
  return null;
}

export function eachLesson(course: Course): LessonLocation[] {
  const out: LessonLocation[] = [];
  let globalIndex = 0;
  course.modules.forEach((mod, moduleIndex) => {
    mod.lessons.forEach((lesson, lessonIndex) => {
      out.push({ course, module: mod, moduleIndex, lesson, lessonIndex, globalLessonIndex: globalIndex });
      globalIndex++;
    });
  });
  return out;
}

export function totalLessons(course: Course): number {
  return course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
}

export function findGlossaryTerm(course: Course, termId: string): GlossaryTerm | undefined {
  return course.glossary.find((term) => term.id === termId);
}

export function quizBlocks(lesson: Lesson): Block[] {
  return lessonBlocks(lesson).filter((b) => b.type === "quiz");
}

export function lessonBlocks(lesson: Lesson): Block[] {
  return lesson.sections.flatMap((section) => section.blocks);
}

export function lessonSections(lesson: Lesson): LessonSection[] {
  return lesson.sections;
}

export function isLessonBlocked(course: Course, lesson: Lesson, completedLessonIds: Set<string>): boolean {
  return lesson.prerequisiteLessonIds.some((id) => !completedLessonIds.has(id));
}

export function neighborLessons(
  course: Course,
  lessonId: string
): { previous: Lesson | null; next: Lesson | null } {
  const lessons = eachLesson(course).map((l) => l.lesson);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return { previous: null, next: null };
  return {
    previous: idx > 0 ? lessons[idx - 1] : null,
    next: idx < lessons.length - 1 ? lessons[idx + 1] : null
  };
}
