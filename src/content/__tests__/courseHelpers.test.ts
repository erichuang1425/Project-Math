import { describe, expect, it } from "vitest";
import type { Block, Course, Lesson } from "../schema";
import { isBlockOfType } from "../schema";
import {
  eachLesson,
  findGlossaryTerm,
  findLesson,
  isLessonBlocked,
  lessonBlocks,
  lessonSections,
  neighborLessons,
  quizBlocks,
  totalLessons
} from "../courseHelpers";
import { makeMinimalCourse } from "./makeMinimalCourse";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function addLesson(course: Course, lesson: Lesson, moduleIndex = 0): void {
  course.modules[moduleIndex].lessons.push(lesson);
}

function makeSecondLesson(): Lesson {
  return {
    id: "second-lesson",
    slug: "second-lesson",
    title: "Second Lesson",
    summary: "Builds on the first lesson.",
    objectives: [{ id: "obj-extend", text: "Extend the idea" }],
    prerequisiteLessonIds: ["intro-lesson"],
    estimatedMinutes: 10,
    difficulty: "intro",
    sections: [
      {
        id: "main",
        title: "Main",
        blocks: [
          {
            type: "concept",
            id: "second-concept",
            title: "Continued",
            body: [{ kind: "text", value: "More." }]
          }
        ]
      }
    ]
  };
}

describe("isBlockOfType", () => {
  it("narrows to the requested block type", () => {
    const course = makeMinimalCourse();
    const quiz: Block = course.modules[0].lessons[0].sections[0].blocks.find(
      (block) => block.id === "intro-quiz"
    )!;
    expect(isBlockOfType(quiz, "quiz")).toBe(true);
    expect(isBlockOfType(quiz, "title")).toBe(false);
  });
});

describe("findLesson", () => {
  it("returns the location for an existing lesson id", () => {
    const course = makeMinimalCourse();
    const location = findLesson(course, "intro-lesson");
    expect(location).not.toBeNull();
    expect(location?.lesson.id).toBe("intro-lesson");
    expect(location?.moduleIndex).toBe(0);
    expect(location?.lessonIndex).toBe(0);
    expect(location?.globalLessonIndex).toBe(0);
    expect(location?.module.id).toBe("intro-module");
  });

  it("increments globalLessonIndex across modules", () => {
    const course = clone(makeMinimalCourse());
    addLesson(course, makeSecondLesson());
    course.modules.push({
      id: "second-module",
      title: "Second Module",
      summary: "Another module.",
      lessons: [
        {
          ...makeSecondLesson(),
          id: "third-lesson",
          slug: "third-lesson",
          prerequisiteLessonIds: []
        }
      ]
    });

    expect(findLesson(course, "third-lesson")?.globalLessonIndex).toBe(2);
    expect(findLesson(course, "third-lesson")?.moduleIndex).toBe(1);
    expect(findLesson(course, "third-lesson")?.lessonIndex).toBe(0);
  });

  it("returns null when the lesson id is missing", () => {
    const course = makeMinimalCourse();
    expect(findLesson(course, "no-such-lesson")).toBeNull();
  });
});

describe("eachLesson", () => {
  it("yields every lesson in module then lesson order", () => {
    const course = clone(makeMinimalCourse());
    addLesson(course, makeSecondLesson());
    const ids = eachLesson(course).map((entry) => entry.lesson.id);
    expect(ids).toEqual(["intro-lesson", "second-lesson"]);
  });

  it("returns an empty array for a course with no modules", () => {
    const course = clone(makeMinimalCourse());
    course.modules = [];
    expect(eachLesson(course)).toEqual([]);
  });
});

describe("totalLessons", () => {
  it("sums lessons across modules", () => {
    const course = clone(makeMinimalCourse());
    addLesson(course, makeSecondLesson());
    expect(totalLessons(course)).toBe(2);
  });

  it("is zero for an empty module list", () => {
    const course = clone(makeMinimalCourse());
    course.modules = [];
    expect(totalLessons(course)).toBe(0);
  });
});

describe("findGlossaryTerm", () => {
  it("returns the term when the id matches", () => {
    const course = makeMinimalCourse();
    expect(findGlossaryTerm(course, "derivative")?.term).toBe("derivative");
  });

  it("returns undefined when the id is missing", () => {
    const course = makeMinimalCourse();
    expect(findGlossaryTerm(course, "no-such-term")).toBeUndefined();
  });
});

describe("quizBlocks / lessonBlocks / lessonSections", () => {
  const course = makeMinimalCourse();
  const lesson = course.modules[0].lessons[0];

  it("lessonBlocks returns every block flattened in section order", () => {
    const ids = lessonBlocks(lesson).map((block) => block.id);
    expect(ids).toEqual([
      "intro-title",
      "intro-concept",
      "intro-intuition",
      "intro-latex",
      "intro-graph",
      "intro-worked",
      "intro-mistake",
      "intro-quiz",
      "intro-summary"
    ]);
  });

  it("quizBlocks returns only quiz blocks", () => {
    const blocks = quizBlocks(lesson);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe("intro-quiz");
  });

  it("lessonSections returns the lesson sections", () => {
    expect(lessonSections(lesson)).toBe(lesson.sections);
  });
});

describe("isLessonBlocked", () => {
  it("is false when prerequisites are empty", () => {
    const course = makeMinimalCourse();
    expect(isLessonBlocked(course, course.modules[0].lessons[0], new Set())).toBe(false);
  });

  it("is true when a prerequisite is not completed", () => {
    const course = clone(makeMinimalCourse());
    addLesson(course, makeSecondLesson());
    const second = course.modules[0].lessons[1];
    expect(isLessonBlocked(course, second, new Set())).toBe(true);
  });

  it("is false when every prerequisite is completed", () => {
    const course = clone(makeMinimalCourse());
    addLesson(course, makeSecondLesson());
    const second = course.modules[0].lessons[1];
    expect(isLessonBlocked(course, second, new Set(["intro-lesson"]))).toBe(false);
  });
});

describe("neighborLessons", () => {
  function threeLessonCourse(): Course {
    const course = clone(makeMinimalCourse());
    addLesson(course, makeSecondLesson());
    addLesson(course, {
      ...makeSecondLesson(),
      id: "third-lesson",
      slug: "third-lesson",
      prerequisiteLessonIds: []
    });
    return course;
  }

  it("returns null neighbors at the start", () => {
    const course = threeLessonCourse();
    const { previous, next } = neighborLessons(course, "intro-lesson");
    expect(previous).toBeNull();
    expect(next?.id).toBe("second-lesson");
  });

  it("returns both neighbors in the middle", () => {
    const course = threeLessonCourse();
    const { previous, next } = neighborLessons(course, "second-lesson");
    expect(previous?.id).toBe("intro-lesson");
    expect(next?.id).toBe("third-lesson");
  });

  it("returns null neighbors at the end", () => {
    const course = threeLessonCourse();
    const { previous, next } = neighborLessons(course, "third-lesson");
    expect(previous?.id).toBe("second-lesson");
    expect(next).toBeNull();
  });

  it("returns null on both sides for a missing lesson id", () => {
    const course = threeLessonCourse();
    expect(neighborLessons(course, "no-such-lesson")).toEqual({ previous: null, next: null });
  });
});
