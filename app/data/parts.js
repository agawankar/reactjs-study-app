// Single source of truth for the handbook's part/section/question tree.
//
// It merges:
//   • handbook.json                — the imported handbook (React content removed)
//   • reactMasterclass.js          — the new 16-topic React masterclass
//   • reactSalvaged.json           — React sections lifted out of the old
//                                    PART II and PART XIII, so all React
//                                    content sits in one consolidated part
//   • codingQuestions.js           — every "write code" question, in one part
//
// It then normalizes numbering: parts get sequential roman numerals, sections
// get sequential numbers (1..N across the whole book), and questions get
// sequential ids (Q1..QN in reading order). Authoring files therefore never
// hard-code a global number — reorder freely and the numbering stays correct.

import handbook from "./handbook.json";
import reactMasterclass from "./reactMasterclass.js";
import reactSalvaged from "./reactSalvaged.json";
import codingParts from "./codingQuestions.js";

// --- build the consolidated React part -----------------------------------
const [coreQA, ...restSalvaged] = reactSalvaged.sections;

const reactPart = {
  title: "PART II — REACT",
  sections: [coreQA, ...reactMasterclass, ...restSalvaged],
};

// --- assemble in reading order ------------------------------------------
// handbook.parts[0] is PART I — JAVASCRIPT; React slots in right after it.
const assembled = [
  handbook.parts[0],
  reactPart,
  ...handbook.parts.slice(1),
  ...codingParts,
];

// --- numbering ---------------------------------------------------------
const ROMAN = [
  ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400], ["C", 100], ["XC", 90],
  ["L", 50], ["XL", 40], ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1],
];
const toRoman = (n) => {
  let out = "";
  for (const [sym, val] of ROMAN) while (n >= val) (out += sym), (n -= val);
  return out;
};

const partName = (title) =>
  title.replace(/^PART\s+[IVXLCDM]+\s+[—-]\s*/i, "").trim();

const sectionName = (title) =>
  title
    .replace(/^\d+[a-z]?\.\s*/i, "")
    .replace(/^[A-Z]\d*\.\s*/, "")
    .trim();

function normalize(parts) {
  let sectionNo = 0;
  let questionNo = 0;

  return parts.map((part, i) => ({
    ...part,
    title: `PART ${toRoman(i + 1)} — ${partName(part.title)}`,
    sections: part.sections.map((section) => {
      sectionNo += 1;
      return {
        ...section,
        title: `${sectionNo}. ${sectionName(section.title)}`,
        questions: section.questions.map((question) => {
          questionNo += 1;
          return { ...question, id: `Q${questionNo}.` };
        }),
      };
    }),
  }));
}

const parts = normalize(assembled);

export default parts;
