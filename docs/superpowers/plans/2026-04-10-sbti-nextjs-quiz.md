# SBTI Next.js Quiz Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Next.js version of the SBTI test using the extracted questions, result copy, and poster images, with lossless image optimization for lower bandwidth.

**Architecture:** Use a data-driven app-router Next.js app. Keep core quiz/result logic in pure TypeScript functions (`src/lib/sbti.ts`) and verify via Vitest. Render a single client-side quiz flow component that mirrors original behavior (question randomization, drink hidden type trigger, fallback type logic).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Vitest, imagemin (optipng + jpegtran) for lossless image compression.

---

### Task 1: Scaffold Next.js app and test tooling

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/*`, `vitest.config.ts`
- Modify: root scripts and dependencies
- Test: `npm run test`

- [ ] **Step 1: Initialize Next.js app**

```bash
cd /Users/colin/Dev/SBTI && npx create-next-app@latest . --ts --eslint --app --src-dir --import-alias "@/*" --use-npm --no-tailwind --yes
```

- [ ] **Step 2: Add Vitest dependencies**

```bash
cd /Users/colin/Dev/SBTI && npm i -D vitest
```

- [ ] **Step 3: Add test script**

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Verify test runner works**

Run: `cd /Users/colin/Dev/SBTI && npm run test`
Expected: process exits 0 or reports no test files without crash.

### Task 2: Build strongly-typed quiz data module

**Files:**
- Create: `src/types/sbti.ts`
- Create: `src/data/sbti-data.ts`
- Test: logic tests importing data

- [ ] **Step 1: Add data type definitions**

```ts
export type QuestionOption = { label: string; value: number };
export type Question = { id: string; dim: string; text: string; options: QuestionOption[]; special?: boolean; kind?: string };
export type TypeEntry = { code: string; cn: string; intro: string; desc: string };
```

- [ ] **Step 2: Convert extracted JSON into typed TS constants**

```ts
export const questions = [...];
export const specialQuestions = [...];
export const TYPE_LIBRARY = {...};
export const TYPE_IMAGES = {...};
export const NORMAL_TYPES = [...];
export const DIM_EXPLANATIONS = {...};
export const dimensionMeta = {...};
export const dimensionOrder = [...];
```

- [ ] **Step 3: Verify module compiles**

Run: `cd /Users/colin/Dev/SBTI && npm run typecheck`
Expected: no TS errors.

### Task 3: TDD quiz flow helpers (visible question logic)

**Files:**
- Create: `src/lib/sbti.test.ts`
- Modify: `src/lib/sbti.ts`
- Test: `src/lib/sbti.test.ts`

- [ ] **Step 1: Write failing test for drink gate visibility**

```ts
it('inserts drink trigger question only when drink_gate_q1 is option 3', () => {
  const base = [{ id: 'q1' }, { id: 'drink_gate_q1' }, { id: 'q2' }] as any;
  expect(getVisibleQuestions(base, {}, specialQuestions).map(q => q.id)).toEqual(['q1', 'drink_gate_q1', 'q2']);
  expect(getVisibleQuestions(base, { drink_gate_q1: 3 }, specialQuestions).map(q => q.id)).toEqual(['q1', 'drink_gate_q1', 'drink_gate_q2', 'q2']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/colin/Dev/SBTI && npm run test -- src/lib/sbti.test.ts`
Expected: FAIL due missing function.

- [ ] **Step 3: Implement minimal helper**

```ts
export function getVisibleQuestions(shuffledQuestions, answers, specialQuestions) {
  const visible = [...shuffledQuestions];
  const gateIndex = visible.findIndex((q) => q.id === 'drink_gate_q1');
  if (gateIndex !== -1 && answers['drink_gate_q1'] === 3) {
    visible.splice(gateIndex + 1, 0, specialQuestions[1]);
  }
  return visible;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/colin/Dev/SBTI && npm run test -- src/lib/sbti.test.ts`
Expected: PASS.

### Task 4: TDD result computation logic (normal + hidden result)

**Files:**
- Modify: `src/lib/sbti.test.ts`
- Modify: `src/lib/sbti.ts`
- Test: `src/lib/sbti.test.ts`

- [ ] **Step 1: Write failing tests for computeResult**

```ts
it('matches CTRL when answers map to CTRL pattern', () => { /* arrange answers by dimension levels */ });
it('forces DRUNK when drink trigger answer is 2', () => { /* set drink_gate_q2: 2 */ });
```

- [ ] **Step 2: Run tests to verify RED**

Run: `cd /Users/colin/Dev/SBTI && npm run test -- src/lib/sbti.test.ts`
Expected: FAIL with missing computeResult.

- [ ] **Step 3: Implement minimal computeResult from original html**

```ts
export function computeResult(answers) {
  // rawScores + levels
  // vector distance ranking with NORMAL_TYPES
  // DRUNK override and HHHH fallback when similarity < 60
  // return modeKicker/badge/sub/finalType + metadata
}
```

- [ ] **Step 4: Verify GREEN**

Run: `cd /Users/colin/Dev/SBTI && npm run test -- src/lib/sbti.test.ts`
Expected: PASS.

### Task 5: Build Next.js quiz UI and result rendering

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/quiz-app.tsx`
- Modify: `src/app/globals.css`
- Test: `npm run build`

- [ ] **Step 1: Write failing render test for intro title**

```ts
it('renders intro screen with start button', () => {
  render(<QuizApp />);
  expect(screen.getByText('SBTI 人格测试')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd /Users/colin/Dev/SBTI && npm run test -- src/components/quiz-app.test.tsx`
Expected: FAIL missing component.

- [ ] **Step 3: Implement `QuizApp` with three states (`intro | test | result`)**

```tsx
const [screen, setScreen] = useState<'intro'|'test'|'result'>('intro');
// start test -> shuffle + insert special gate
// answer selection + progress
// submit -> computeResult + render poster/text
```

- [ ] **Step 4: Render result copy and image from data mapping**

```tsx
<img src={TYPE_IMAGES[result.finalType.code]} alt={`${result.finalType.code}（${result.finalType.cn}）`} />
<p>{result.finalType.desc}</p>
```

- [ ] **Step 5: Verify build works**

Run: `cd /Users/colin/Dev/SBTI && npm run build`
Expected: Next.js production build succeeds.

### Task 6: Lossless image optimization and wiring

**Files:**
- Create: `scripts/optimize-images.mjs`
- Create: `public/images/results/*`
- Modify: `src/data/sbti-data.ts` image paths
- Test: `npm run optimize:images`

- [ ] **Step 1: Install optimization deps**

```bash
cd /Users/colin/Dev/SBTI && npm i -D imagemin imagemin-optipng imagemin-jpegtran
```

- [ ] **Step 2: Add optimization script**

```js
// copy raw files to public/images/results
// run optipng for .png and jpegtran for .jpg (lossless)
// emit before/after report with byte savings
```

- [ ] **Step 3: Add npm script**

```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.mjs"
  }
}
```

- [ ] **Step 4: Run optimizer and verify output**

Run: `cd /Users/colin/Dev/SBTI && npm run optimize:images`
Expected: all 27 images processed, report shows byte totals and no failures.

### Task 7: Final verification

**Files:**
- Verify full tree

- [ ] **Step 1: Run tests**

Run: `cd /Users/colin/Dev/SBTI && npm run test`
Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `cd /Users/colin/Dev/SBTI && npm run lint`
Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run: `cd /Users/colin/Dev/SBTI && npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Run production build**

Run: `cd /Users/colin/Dev/SBTI && npm run build`
Expected: PASS.
