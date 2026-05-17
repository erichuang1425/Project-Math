import { act, cleanup, render } from "@testing-library/react";
import React, { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useActiveSection } from "../useActiveSection";

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  root: Document | Element | null = null;
  rootMargin: string;
  thresholds: ReadonlyArray<number> = [0];

  readonly callback: ObserverCallback;
  observed: Element[] = [];
  disconnected = false;

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
    this.disconnected = true;
    this.observed = [];
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Test helper: trigger the callback with synthetic entries. */
  trigger(visible: { id: string; top: number; isIntersecting?: boolean }[]) {
    const entries = visible.map((v) => {
      const target = this.observed.find((el) => el.id === v.id);
      if (!target) throw new Error(`No observed target with id "${v.id}"`);
      return {
        target,
        isIntersecting: v.isIntersecting ?? true,
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

function TestHarness({
  sectionIds,
  initialSectionId,
  onActiveChange
}: {
  sectionIds: string[];
  initialSectionId?: string;
  onActiveChange: (id: string | null) => void;
}) {
  const active = useActiveSection({ sectionIds, initialSectionId });
  useEffect(() => {
    onActiveChange(active);
  }, [active, onActiveChange]);
  return (
    <div>
      {sectionIds.map((id) => (
        <section key={id} id={id}>
          {id}
        </section>
      ))}
    </div>
  );
}

describe("useActiveSection", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    MockIntersectionObserver.instances = [];
  });

  it("starts with the first section active", () => {
    const onChange = vi.fn();
    render(<TestHarness sectionIds={["alpha", "beta", "gamma"]} onActiveChange={onChange} />);
    expect(onChange).toHaveBeenLastCalledWith("alpha");
  });

  it("returns null when there are no sections", () => {
    const onChange = vi.fn();
    render(<TestHarness sectionIds={[]} onActiveChange={onChange} />);
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("registers each section element with the observer", () => {
    render(<TestHarness sectionIds={["alpha", "beta", "gamma"]} onActiveChange={() => {}} />);
    const [observer] = MockIntersectionObserver.instances;
    expect(observer.observed.map((el) => el.id)).toEqual(["alpha", "beta", "gamma"]);
    expect(observer.rootMargin).toBe("0px 0px -70% 0px");
  });

  it("updates the active section to the topmost visible entry", () => {
    const onChange = vi.fn();
    render(<TestHarness sectionIds={["alpha", "beta", "gamma"]} onActiveChange={onChange} />);
    const [observer] = MockIntersectionObserver.instances;

    act(() => {
      observer.trigger([
        { id: "gamma", top: 400 },
        { id: "beta", top: 120 }
      ]);
    });

    expect(onChange).toHaveBeenLastCalledWith("beta");
  });

  it("ignores entries that are not intersecting", () => {
    const onChange = vi.fn();
    render(<TestHarness sectionIds={["alpha", "beta", "gamma"]} onActiveChange={onChange} />);
    const [observer] = MockIntersectionObserver.instances;

    act(() => {
      observer.trigger([
        { id: "alpha", top: -300, isIntersecting: false },
        { id: "gamma", top: 600 }
      ]);
    });

    expect(onChange).toHaveBeenLastCalledWith("gamma");
  });

  it("scrolls to initialSectionId on mount and marks it active", () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy as unknown as Element["scrollIntoView"];

    const onChange = vi.fn();
    render(
      <TestHarness
        sectionIds={["alpha", "beta", "gamma"]}
        initialSectionId="beta"
        onActiveChange={onChange}
      />
    );

    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("beta");
  });

  it("does not call scrollIntoView when initialSectionId equals the first section", () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy as unknown as Element["scrollIntoView"];

    render(
      <TestHarness
        sectionIds={["alpha", "beta"]}
        initialSectionId="alpha"
        onActiveChange={() => {}}
      />
    );

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = render(
      <TestHarness sectionIds={["alpha", "beta"]} onActiveChange={() => {}} />
    );
    const [observer] = MockIntersectionObserver.instances;
    unmount();
    expect(observer.disconnected).toBe(true);
  });

  it("resets to the first section when section ids change", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TestHarness sectionIds={["alpha", "beta"]} onActiveChange={onChange} />
    );
    const firstObserver = MockIntersectionObserver.instances[0];
    act(() => {
      firstObserver.trigger([{ id: "beta", top: 100 }]);
    });
    expect(onChange).toHaveBeenLastCalledWith("beta");

    rerender(<TestHarness sectionIds={["one", "two"]} onActiveChange={onChange} />);
    expect(onChange).toHaveBeenLastCalledWith("one");
  });
});
