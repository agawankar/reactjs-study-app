// One-time reorganization of app/data/handbook.json.
//
//  1. Pulls every React-specific section out of "PART II — REACT" and out of
//     "PART XIII — EXTENDED TOPICS" and writes them to app/data/reactSalvaged.json
//     so app/data/parts.js can merge them into one consolidated React part
//     alongside the new 16-topic masterclass.
//  2. Pulls the remaining "write code" sections into app/data/codingSalvaged.json
//     so every coding question lives under PART XIV — CODING CHALLENGES.
//  3. Removes "PART II — REACT" and the now-empty "PART XI — CODING & OUTPUT
//     QUESTIONS".
//  4. Fixes section titles that were mangled or SHOUTED by the docx import.
//
// Section/question renumbering is NOT done here — app/data/parts.js assigns
// sequential part numbers, section numbers and question ids at build time.
//
// Safe to re-run: it is a no-op once "PART II — REACT" is gone.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const handbookPath = join(root, "app/data/handbook.json");
const reactSalvagedPath = join(root, "app/data/reactSalvaged.json");
const codingSalvagedPath = join(root, "app/data/codingSalvaged.json");

const handbook = JSON.parse(readFileSync(handbookPath, "utf8"));

const findPart = (needle) =>
  handbook.parts.find((p) => p.title.toUpperCase().includes(needle));

const partII = findPart("PART II");
const extended = findPart("EXTENDED TOPICS");
const codingOutput = findPart("CODING & OUTPUT");

if (!partII) {
  console.log("PART II — REACT already removed; nothing to do.");
  process.exit(0);
}

const takeSection = (part, title, newTitle) => {
  const idx = part.sections.findIndex((s) => s.title === title);
  if (idx === -1) throw new Error(`Section not found: ${title}`);
  const [section] = part.sections.splice(idx, 1);
  if (newTitle) section.title = newTitle;
  return section;
};

// ---------------------------------------------------------------------------
// 1. React sections — order = order they appear in the merged React part
// ---------------------------------------------------------------------------
const reactSalvaged = {
  sections: [
    takeSection(partII, "3. React Fundamentals", "React Fundamentals (Core Q&A)"),
    takeSection(partII, "3b. Modern React Features (18 & 19)", "React 18 & 19 Features"),
    takeSection(extended, "B. Modern React — 2026 Expectations", "Modern React — 2026 Expectations"),
    takeSection(extended, "N2. React Compiler and Modern Memoization Decisions", "React Compiler & Memoization Decisions"),
    takeSection(extended, "N3. useTransition, useDeferredValue and Non-Blocking UI", "useTransition, useDeferredValue & Non-Blocking UI"),
    takeSection(extended, "H. REACT.JS — ADVANCED / STAFF-LEVEL SECTION", "Advanced / Staff-Level React"),
  ],
};

// ---------------------------------------------------------------------------
// 2. Remaining coding sections → PART XIV
// ---------------------------------------------------------------------------
const codingSalvaged = {
  sections: [
    takeSection(codingOutput, "13. JavaScript Coding Patterns", "JavaScript Output & Patterns"),
    takeSection(extended, "K. Senior Coding & Problem-Solving Questions", "Senior Coding & Problem-Solving"),
    takeSection(extended, "2. Both variables reference the same object.", "JavaScript Utility Implementations"),
  ],
};

// ---------------------------------------------------------------------------
// 3. Drop emptied parts
// ---------------------------------------------------------------------------
handbook.parts = handbook.parts.filter(
  (p) => p !== partII && !(p === codingOutput && p.sections.length === 0)
);

// ---------------------------------------------------------------------------
// 4. Fix mangled / SHOUTING section titles in the extended part
// ---------------------------------------------------------------------------
const retitle = {
  "8. Explain trade-offs and evolution.": "Frontend System Design — Senior Scenarios",
  "A. JAVASCRIPT — ADVANCED MASTER SECTION": "JavaScript — Advanced Master Section",
  "B. HTML — SENIOR INTERVIEW SECTION": "HTML — Senior Interview Section",
  "C. CSS — ADVANCED MASTER SECTION": "CSS — Advanced Master Section",
  "D. STYLING METHODOLOGY & DESIGN SYSTEMS": "Styling Methodology & Design Systems",
  "E. NODE.JS — SENIOR MASTER SECTION": "Node.js — Senior Master Section",
  "F. EXPRESS.JS — SENIOR MASTER SECTION": "Express.js — Senior Master Section",
  "G. MONGODB — SENIOR MASTER SECTION": "MongoDB — Senior Master Section",
  "I. CROSS-TECHNOLOGY SENIOR SCENARIOS": "Cross-Technology Senior Scenarios",
  "M. DOCKER — COMPLETE PRACTICAL & INTERVIEW MASTERCLASS": "Docker — Complete Practical & Interview Masterclass",
};
for (const section of extended.sections) {
  if (retitle[section.title]) section.title = retitle[section.title];
}

// ---------------------------------------------------------------------------
// 5. Drop the stale flattened question list — app/data/parts.js is now the
//    single source of truth and this parallel copy only drifts out of sync.
// ---------------------------------------------------------------------------
delete handbook.questions;
handbook.meta = {
  title: handbook.meta.title,
  edition: handbook.meta.edition,
  author: handbook.meta.author,
  note: "Part/section/question numbering is assigned at build time by app/data/parts.js.",
};

// ---------------------------------------------------------------------------
// write
// ---------------------------------------------------------------------------
writeFileSync(handbookPath, JSON.stringify(handbook, null, 2) + "\n");
writeFileSync(reactSalvagedPath, JSON.stringify(reactSalvaged, null, 2) + "\n");
writeFileSync(codingSalvagedPath, JSON.stringify(codingSalvaged, null, 2) + "\n");

const n = (s) => s.questions.length;
console.log("React sections →", reactSalvagedPath);
for (const s of reactSalvaged.sections) console.log(`  ${s.title} (${n(s)} q)`);
console.log("Coding sections →", codingSalvagedPath);
for (const s of codingSalvaged.sections) console.log(`  ${s.title} (${n(s)} q)`);
console.log("Rewrote", handbookPath);
