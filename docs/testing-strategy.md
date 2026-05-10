# Testing Strategy

## Testing Goal

Tests should protect the content contract, rendering behavior, math display, quiz logic, local-first behavior, and desktop smoke path.

## Test Layers

### Unit Tests

Use for pure logic:

- Schema validation.
- Content normalization.
- ID uniqueness checks.
- Quiz scoring.
- Revision selection.
- Export data preparation.
- Storage interface behavior with test doubles.

### Component Tests

Use for reusable React behavior:

- Block renderer dispatch.
- Math inline and display rendering.
- Worked example rendering.
- Quiz states and feedback.
- Validation error view.

### Fixture Tests

Use committed content fixtures:

- Valid minimal studybook.
- Valid derivatives MVP studybook.
- Invalid unknown block type.
- Invalid duplicate IDs.
- Invalid quiz correct option.
- Invalid LaTeX.
- Invalid graph axis labels.

### Desktop Smoke Tests

Use for app startup and core flows:

- App opens offline.
- Studybook library appears.
- First lesson opens.
- LaTeX renders.
- Quiz can be answered.
- Local learner state can be saved and reloaded if implemented.
- Validation error content shows a useful error.

Learner-state smoke addition:

- Answer a quiz, close and reopen the app, and confirm the saved attempt count is still visible.
- Mark the lesson complete, close and reopen the app, and confirm the lesson still shows complete.
- If saved learner-state JSON is corrupt, the app should reset that studybook state and show a clear recovery notice.

## Regression Rules

- Add a regression test for every fixed bug.
- If a bug is visual, add the nearest practical component or smoke coverage.
- If a bug is caused by content shape, add an invalid fixture.
- If a bug is caused by math content, add a math rendering or content validation test.

## Test Data Rules

- Fixtures should be small and readable.
- Use stable IDs.
- Do not use random data.
- Keep first-principles derivative examples mathematically correct.
- Invalid fixtures should fail for one main reason each.

## Manual Verification

Manual verification is acceptable only when automation is not practical yet. Record:

- Exact steps.
- Expected result.
- Actual result.
- Any limitation.

## What Done Means

Testing work is done when:

- The changed behavior has automated coverage at the lowest useful layer.
- Fixture changes include both valid and invalid cases when schema behavior changes.
- Desktop smoke behavior is automated or documented.
- The final response states which tests were run and which were not.
