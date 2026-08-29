import raw from "./javascript_react_interview_master_coding_questions.json";
import nodejsRaw from "./nodejsCodingQuestions.json";

function meta(lines) {
  return lines.filter(Boolean).join("\n\n");
}

const jsQuestions = raw.sections.javascript.questions.map((item) => ({
  id: item.id,
  question: `${item.title}: ${item.question}`,
  answer: meta([
    `Category: ${item.category} · Difficulty: ${item.difficulty}`,
    item.key_concept ? `Key concept: ${item.key_concept}` : null,
  ]),
  code: item.solution,
}));

const reactQuestions = raw.sections.react_js.questions.map((item) => ({
  id: item.id,
  question: `${item.topic}: ${item.question}`,
  answer: meta([
    `Category: ${item.category} · Difficulty: ${item.difficulty}`,
    item.explanation,
    item.example ? `Example — Input: ${item.example.input} → Output: ${item.example.output}` : null,
    item.interview_tip ? `Interview tip: ${item.interview_tip}` : null,
  ]),
  code: item.solution,
}));

const nodejsQuestions = nodejsRaw.map((item) => ({
  id: item.id,
  question: `${item.title}: ${item.question}`,
  answer: meta([
    `Category: ${item.category} · Difficulty: ${item.difficulty}`,
    item.key_concept ? `Key concept: ${item.key_concept}` : null,
  ]),
  code: item.solution,
}));

const codingParts = [
  {
    title: "PART XIV — CODING CHALLENGES",
    sections: [
      { title: "1. JavaScript Coding Challenges", questions: jsQuestions },
      { title: "2. React Coding Challenges", questions: reactQuestions },
      { title: "3. Node.js Coding Challenges", questions: nodejsQuestions },
    ],
  },
];

export default codingParts;
