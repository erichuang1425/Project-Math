import { act, cleanup, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import courseJson from "../../content/fixtures/courses/calculus-i.course.json";
import { eachLesson, totalLessons, validateContent } from "../../content";
import { LessonView } from "../LessonView";

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  root: Document | Element | null = null;
  rootMargin: string;
  thresholds: ReadonlyArray<number> = [0];

  readonly callback: ObserverCallback;
  observed: Element[] = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback as unknown as ObserverCallback;
    this.rootMargin = options?.rootMargin ?? "";
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observed.push(target);
  }

  unobserve(target: Element) {
    this.observed = this.observed.filter((el) => el !== target);
  }

  disconnect() {
    this.observed = [];
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(visible: { id: string; top: number }[]) {
    const entries = visible.map((v) => {
      const target = this.observed.find((el) => el.id === v.id);
      if (!target) throw new Error(`No observed target with id "${v.id}"`);
      return {
        target,
        isIntersecting: true,
        boundingClientRect: { top: v.top } as DOMRectReadOnly,
        intersectionRatio: 1,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: 0
      } as unknown as IntersectionObserverEntry;
    });
    this.callback(entries);
  }
}

function validatedCourse() {
  const result = validateContent(courseJson);
  if (!result.ok) {
    throw new Error(result.errors.map((e) => `${e.path}: ${e.message}`).join("\n"));
  }
  return result.course;
}

describe("LessonView active-section indicator", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    MockIntersectionObserver.instances = [];
  });

  it("marks the first section as active on mount with a visible 'You are here' marker", () => {
    const course = validatedCourse();
    const first = eachLesson(course)[0];

    render(
      <LessonView
        course={course}
        module={first.module}
        lesson={first.lesson}
        lessonNumber={first.globalLessonIndex + 1}
        totalLessons={totalLessons(course)}
      />
    );

    const nav = screen.getByRole("navigation", { name: "Lesson sections" });
    const activeLink = within(nav).getByRole("link", { current: "step" });
    expect(activeLink).toHaveTextContent("Step 1");
    expect(within(activeLink).getByText("You are here")).toBeInTheDocument();

    const announcement = screen.getByTestId("active-section-announcement");
    expect(announcement).toHaveTextContent("");
  });

  it("moves the active marker and announces on scroll", () => {
    const course = validatedCourse();
    const first = eachLesson(course)[0];
    expect(first.lesson.sections.length).toBeGreaterThanOrEqual(2);
    const secondSection = first.lesson.sections[1];

    render(
      <LessonView
        course={course}
        module={first.module}
        lesson={first.lesson}
        lessonNumber={first.globalLessonIndex + 1}
        totalLessons={totalLessons(course)}
      />
    );

    const observer = MockIntersectionObserver.instances[0];
    act(() => {
      observer.trigger([{ id: secondSection.id, top: 100 }]);
    });

    const nav = screen.getByRole("navigation", { name: "Lesson sections" });
    const activeLink = within(nav).getByRole("link", { current: "step" });
    expect(activeLink).toHaveTextContent("Step 2");

    const announcement = screen.getByTestId("active-section-announcement");
    expect(announcement.textContent).toContain(
      `Now reading step 2 of ${first.lesson.sections.length}: ${secondSection.title}`
    );
  });

  it("notifies onSectionView when the active section changes", () => {
    const course = validatedCourse();
    const first = eachLesson(course)[0];
    const onSectionView = vi.fn();
    const secondSection = first.lesson.sections[1];

    render(
      <LessonView
        course={course}
        module={first.module}
        lesson={first.lesson}
        lessonNumber={first.globalLessonIndex + 1}
        totalLessons={totalLessons(course)}
        onSectionView={onSectionView}
      />
    );

    expect(onSectionView).toHaveBeenCalledWith(first.lesson.sections[0].id);
    onSectionView.mockClear();

    const observer = MockIntersectionObserver.instances[0];
    act(() => {
      observer.trigger([{ id: secondSection.id, top: 50 }]);
    });

    expect(onSectionView).toHaveBeenCalledWith(secondSection.id);
  });

  it("resumes at initialSectionId by scrolling and marking it active", () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy as unknown as Element["scrollIntoView"];

    const course = validatedCourse();
    const first = eachLesson(course)[0];
    const target = first.lesson.sections[1];

    render(
      <LessonView
        course={course}
        module={first.module}
        lesson={first.lesson}
        lessonNumber={first.globalLessonIndex + 1}
        totalLessons={totalLessons(course)}
        initialSectionId={target.id}
      />
    );

    expect(scrollSpy).toHaveBeenCalled();
    const nav = screen.getByRole("navigation", { name: "Lesson sections" });
    const activeLink = within(nav).getByRole("link", { current: "step" });
    expect(activeLink).toHaveTextContent("Step 2");
  });
});
