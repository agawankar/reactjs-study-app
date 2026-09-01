// PART XIV — CODING CHALLENGES, organized into one section per language:
//   1. JavaScript   2. React   3. Node.js
//
// Every question carries a runnable code example, and questions with more than
// one idiomatic approach get their alternatives appended from
// codingAltSolutions.js. parts.js assigns the final sequential question ids.

import raw from "./javascript_react_interview_master_coding_questions.json";
import nodejsRaw from "./nodejsCodingQuestions.json";
import reactChallenges from "./reactCodingChallenges.js";
import { altSolutions, normTitle } from "./codingAltSolutions.js";

const meta = (lines) => lines.filter(Boolean).join("\n\n");

// append alternative solutions when the title has an entry
const enrich = (title, solution) => {
  const alt = altSolutions[normTitle(title)];
  return alt ? `${solution}\n\n${alt}` : solution;
};

// ---------------------------------------------------------------------------
// JavaScript
// ---------------------------------------------------------------------------
// Items 35-40 in the source "javascript" list are really React hooks/components
// (useDebounce Hook, usePrevious Hook, Search with Debounce, Pagination,
// Autocomplete, Infinite Scroll). Only the Autocomplete (39) isn't already
// covered in the React list, so it moves; the rest are dropped as duplicates.
const MOVE_TO_REACT = new Set([39]);
const DROP_FROM_JS = new Set([35, 36, 37, 38, 39, 40]);

const jsQuestions = raw.sections.javascript.questions
  .filter((item) => !DROP_FROM_JS.has(item.id))
  .map((item) => ({
    id: `js-${item.id}`,
    question: `${item.title}: ${item.question}`,
    answer: meta([
      `Difficulty: ${item.difficulty} · Category: ${item.category}`,
      item.key_concept ? `Key concept: ${item.key_concept}` : null,
    ]),
    code: enrich(item.title, item.solution),
  }));

// ---------------------------------------------------------------------------
// React
// ---------------------------------------------------------------------------
const masterReactQuestions = raw.sections.react_js.questions.map((item) => ({
  id: `react-${item.id}`,
  question: `${item.topic}: ${item.question}`,
  answer: meta([
    `Difficulty: ${item.difficulty} · Category: ${item.category}`,
    item.explanation,
    item.example
      ? `Example — Input: ${item.example.input} → Output: ${item.example.output}`
      : null,
    item.interview_tip ? `Interview tip: ${item.interview_tip}` : null,
  ]),
  code: enrich(item.topic, item.solution),
}));

const movedReactQuestions = raw.sections.javascript.questions
  .filter((item) => MOVE_TO_REACT.has(item.id))
  .map((item) => ({
    id: `react-js-${item.id}`,
    question: `${item.title}: ${item.question}`,
    answer: meta([
      `Difficulty: ${item.difficulty} · Category: ${item.category}`,
      item.key_concept ? `Key concept: ${item.key_concept}` : null,
    ]),
    code: enrich(item.title, item.solution),
  }));

// reactCodingChallenges.js — drop the ones already covered by the master list
const REACT_CHALLENGE_DUPLICATES = new Set([
  "Build a useDebounce hook and a debounced search input",
  "Implement usePrevious to track a value's previous render",
  "Write a useFetch hook with loading, error, and cancellation",
  "Implement useLocalStorage as a drop-in useState replacement",
  "Build a useOnClickOutside hook",
  "Implement an Error Boundary with a retry",
  "Lazy-load a route with Suspense, an error boundary, and preload on hover",
]);

const extraReactChallenges = reactChallenges.filter(
  (q) => !REACT_CHALLENGE_DUPLICATES.has(q.question)
);

const reactQuestions = [
  ...masterReactQuestions,
  ...movedReactQuestions,
  ...extraReactChallenges,
];

// ---------------------------------------------------------------------------
// Node.js
// ---------------------------------------------------------------------------
const nodejsQuestions = nodejsRaw.map((item) => ({
  id: `node-${item.id}`,
  question: `${item.title}: ${item.question}`,
  answer: meta([
    `Difficulty: ${item.difficulty} · Category: ${item.category}`,
    item.key_concept ? `Key concept: ${item.key_concept}` : null,
  ]),
  code: enrich(item.title, item.solution),
}));

// ---------------------------------------------------------------------------
const codingParts = [
  {
    title: "PART XIV — CODING CHALLENGES",
    sections: [
      { title: "1. JavaScript", questions: jsQuestions },
      { title: "2. React", questions: reactQuestions },
      { title: "3. Node.js", questions: nodejsQuestions },
    ],
  },
];

export default codingParts;
