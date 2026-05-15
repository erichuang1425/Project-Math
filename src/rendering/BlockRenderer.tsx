import type { Block, Course } from "../content/schema";
import { getQuizAttempts, type LearnerState } from "../storage/learnerState";
import { CommonMistakeBlockView } from "./blocks/CommonMistakeBlockView";
import { ConceptBlockView } from "./blocks/ConceptBlockView";
import { GraphBlockView } from "./blocks/GraphBlockView";
import { IntuitionBlockView } from "./blocks/IntuitionBlockView";
import { LatexBlockView } from "./blocks/LatexBlockView";
import { QuizBlockView, type QuizAttemptSubmission } from "./blocks/QuizBlockView";
import { SummaryBlockView } from "./blocks/SummaryBlockView";
import { TitleBlockView } from "./blocks/TitleBlockView";
import { WorkedExampleBlockView } from "./blocks/WorkedExampleBlockView";
import { GlossaryContext } from "./GlossaryContext";
import styles from "./lesson.module.css";

type BlockRendererProps = {
  block: Block;
  lessonId: string;
  course?: Course;
  learnerState?: LearnerState;
  onQuizAttempt?: (attempt: QuizAttemptSubmission) => void;
};

export function BlockRenderer({
  block,
  lessonId,
  course,
  learnerState,
  onQuizAttempt
}: BlockRendererProps) {
  return (
    <GlossaryContext.Provider value={course?.glossary ?? []}>
      <BlockSwitch
        block={block}
        lessonId={lessonId}
        learnerState={learnerState}
        onQuizAttempt={onQuizAttempt}
      />
    </GlossaryContext.Provider>
  );
}

function BlockSwitch({
  block,
  lessonId,
  learnerState,
  onQuizAttempt
}: Omit<BlockRendererProps, "course">) {
  switch (block.type) {
    case "title":
      return <TitleBlockView block={block} />;
    case "concept":
      return <ConceptBlockView block={block} />;
    case "intuition":
      return <IntuitionBlockView block={block} />;
    case "latex":
      return <LatexBlockView block={block} />;
    case "graph":
      return <GraphBlockView block={block} />;
    case "workedExample":
      return <WorkedExampleBlockView block={block} />;
    case "commonMistake":
      return <CommonMistakeBlockView block={block} />;
    case "quiz":
      return (
        <QuizBlockView
          block={block}
          lessonId={lessonId}
          attemptCountsByQuestionId={Object.fromEntries(
            block.questions.map((question) => [
              question.id,
              getQuizAttempts(learnerState, lessonId, block.id, question.id).length
            ])
          )}
          onQuizAttempt={onQuizAttempt}
        />
      );
    case "summary":
      return <SummaryBlockView block={block} />;
    default:
      return (
        <section className={styles.block} aria-label="Unknown content block">
          Unknown content block.
        </section>
      );
  }
}
