import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TitleBlockView } from "../TitleBlockView";

afterEach(() => cleanup());

describe("TitleBlockView", () => {
  it("renders kicker, title, subtitle, and objectives when provided", () => {
    render(
      <TitleBlockView
        block={{
          type: "title",
          id: "t",
          kicker: "Lesson 1",
          title: "Title text",
          subtitle: "Subtitle text",
          objectives: [[{ kind: "text", value: "Goal one" }], [{ kind: "text", value: "Goal two" }]]
        }}
      />
    );

    expect(screen.getByText("Lesson 1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Title text" })).toBeInTheDocument();
    expect(screen.getByText("Subtitle text")).toBeInTheDocument();
    expect(screen.getByText("Goal one")).toBeInTheDocument();
    expect(screen.getByText("Goal two")).toBeInTheDocument();
  });

  it("omits kicker, subtitle, and objectives when not provided", () => {
    render(
      <TitleBlockView
        block={{
          type: "title",
          id: "t",
          title: "Bare title"
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Bare title" })).toBeInTheDocument();
    expect(screen.queryByText("Lesson 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Subtitle text")).not.toBeInTheDocument();
  });
});
