// Alternative solutions for coding-challenge questions that have more than one
// idiomatic approach. Keyed by the normalized question title (lowercase, every
// run of non-alphanumerics collapsed to a single space, trimmed).
//
// codingQuestions.js appends the matching block after the primary solution so
// every such question shows the trade-offs between approaches.

const norm = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const raw = {
  "reverse a string": `// ── Other approaches ──

// 2. Spread + reverse (handles astral chars / emoji better than split(""))
const reverse2 = (str) => [...str].reverse().join("");

// 3. Manual loop — O(n), no intermediate array
function reverse3(str) {
  let out = "";
  for (let i = str.length - 1; i >= 0; i--) out += str[i];
  return out;
}

// 4. reduce
const reverse4 = (str) => [...str].reduce((rev, ch) => ch + rev, "");`,

  "check palindrome": `// ── Other approaches ──

// 2. Reverse-and-compare (concise; allocates a copy)
const isPalindrome2 = (str) => str === [...str].reverse().join("");

// 3. Normalize first, then two-pointer (ignore case, spaces, punctuation)
function isPalindromeClean(str) {
  const s = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  let l = 0, r = s.length - 1;
  while (l < r) if (s[l++] !== s[r--]) return false;
  return true;
}
// isPalindromeClean("A man, a plan, a canal: Panama") // true`,

  "find largest number": `// ── Other approaches ──

// 2. Math.max + spread (throws "Maximum call stack" for very large arrays)
const findLargest2 = (arr) => Math.max(...arr);

// 3. reduce (safe for any size)
const findLargest3 = (arr) => arr.reduce((max, n) => (n > max ? n : max), -Infinity);`,

  "find second largest number": `// ── Other approach ──

// 2. Dedupe → sort desc → take index 1 (O(n log n), very readable)
function secondLargest2(arr) {
  const unique = [...new Set(arr)].sort((a, b) => b - a);
  return unique[1] ?? null;
}`,

  "remove duplicates": `// ── Other approaches ──

// 2. filter + indexOf — O(n^2), no Set
const unique2 = (arr) => arr.filter((v, i) => arr.indexOf(v) === i);

// 3. reduce into an accumulator
const unique3 = (arr) =>
  arr.reduce((acc, v) => (acc.includes(v) ? acc : [...acc, v]), []);

// 4. Deduplicate objects by a key
const uniqueBy = (arr, key) => [
  ...new Map(arr.map((o) => [o[key], o])).values(),
];`,

  "find duplicate values": `// ── Other approach ──

// 2. Set-based: seen vs. reported
function findDuplicates2(arr) {
  const seen = new Set();
  const dupes = new Set();
  for (const v of arr) (seen.has(v) ? dupes : seen).add(v);
  return [...dupes];
}`,

  "character frequency": `// ── Other approaches ──

// 2. reduce
const charFrequency2 = (str) =>
  [...str].reduce((m, c) => ((m[c] = (m[c] || 0) + 1), m), {});

// 3. Map (preserves insertion order, allows non-string keys)
function charFrequencyMap(str) {
  const m = new Map();
  for (const c of str) m.set(c, (m.get(c) || 0) + 1);
  return m;
}`,

  "find missing number": `// ── Other approaches ──

// 2. XOR — no overflow risk, still O(n)
function findMissingXor(arr) {
  let x = 0;
  for (let i = 1; i <= arr.length + 1; i++) x ^= i;
  for (const n of arr) x ^= n;
  return x;
}

// 3. Set lookup — works when the range isn't a clean 1..n
function findMissingSet(arr, start, end) {
  const s = new Set(arr);
  for (let i = start; i <= end; i++) if (!s.has(i)) return i;
}`,

  "two sum": `// ── Other approaches ──

// 2. Brute force — O(n^2), no extra space
function twoSumBrute(arr, target) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] + arr[j] === target) return [i, j];
  return [];
}

// 3. Sorted array → two pointers — O(n log n), returns values not indices
function twoSumSorted(arr, target) {
  const s = [...arr].sort((a, b) => a - b);
  let l = 0, r = s.length - 1;
  while (l < r) {
    const sum = s[l] + s[r];
    if (sum === target) return [s[l], s[r]];
    sum < target ? l++ : r--;
  }
  return [];
}`,

  "flatten nested array": `// ── Other approaches ──

// 2. Built-in (allowed outside the "no flat()" constraint)
const flatten2 = (arr) => arr.flat(Infinity);

// 3. reduce + recursion
const flatten3 = (arr) =>
  arr.reduce(
    (acc, v) => acc.concat(Array.isArray(v) ? flatten3(v) : v),
    []
  );

// 4. Iterative with a stack — avoids call-stack limits on deep input
function flattenIterative(input) {
  const stack = [...input];
  const out = [];
  while (stack.length) {
    const next = stack.pop();
    Array.isArray(next) ? stack.push(...next) : out.push(next);
  }
  return out.reverse();
}`,

  "intersection of two arrays": `// ── Other approach ──

// 2. Both filtered through Sets, de-duplicated result
function intersection2(a, b) {
  const setB = new Set(b);
  return [...new Set(a)].filter((x) => setB.has(x));
}`,

  "union of two arrays": `// ── Other approach ──

// 2. Concat + filter (no Set)
const union2 = (a, b) =>
  a.concat(b.filter((x) => !a.includes(x)));`,

  "maximum occurring element": `// ── Other approach ──

// 2. Build a frequency map, then pick the max entry
function maxOccurrence2(arr) {
  const freq = arr.reduce((m, n) => ((m[n] = (m[n] || 0) + 1), m), {});
  return Object.keys(freq).reduce((a, b) => (freq[b] > freq[a] ? b : a));
}`,

  "deep clone": `// ── Other approaches ──

// 2. structuredClone — built-in, handles Date/Map/Set/circular refs
const copy1 = structuredClone(value);

// 3. JSON round-trip — simple but drops functions, undefined, Dates → strings,
//    and throws on circular references
const copy2 = JSON.parse(JSON.stringify(value));

// 4. Manual recursion — full control, handles arrays + plain objects
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  );
}`,

  memoization: `// ── Other approaches ──

// 2. Single-arg fast path with a Map key (no JSON.stringify cost)
function memoizeOne(fn) {
  const cache = new Map();
  return (arg) => {
    if (cache.has(arg)) return cache.get(arg);
    const value = fn(arg);
    cache.set(arg, value);
    return value;
  };
}

// 3. Bounded LRU-ish cache — evicts the oldest entry past maxSize
function memoizeBounded(fn, maxSize = 100) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      const v = cache.get(key);
      cache.delete(key);
      cache.set(key, v); // mark as most-recently-used
      return v;
    }
    const value = fn(...args);
    cache.set(key, value);
    if (cache.size > maxSize) cache.delete(cache.keys().next().value);
    return value;
  };
}`,

  debounce: `// ── Variations ──

// 2. With leading edge + cancel/flush (Lodash-style)
function debounce(fn, delay, { leading = false } = {}) {
  let timer = null;
  function debounced(...args) {
    const callNow = leading && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!leading) fn.apply(this, args);
    }, delay);
    if (callNow) fn.apply(this, args);
  }
  debounced.cancel = () => (clearTimeout(timer), (timer = null));
  return debounced;
}`,

  throttle: `// ── Other approach ──

// 2. Timer-based — guarantees a trailing call with the latest args
function throttleTrailing(fn, delay) {
  let timer = null;
  let lastArgs = null;
  return function (...args) {
    lastArgs = args;
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, lastArgs);
      timer = null;
    }, delay);
  };
}`,

  "event loop output": `// ── Deeper variant ──

console.log("start");
setTimeout(() => console.log("timeout"), 0);
Promise.resolve()
  .then(() => console.log("promise 1"))
  .then(() => console.log("promise 2"));
queueMicrotask(() => console.log("microtask"));
console.log("end");

// Output:
// start
// end
// promise 1
// microtask      ← all microtasks drain before any macrotask
// promise 2
// timeout        ← macrotask (setTimeout) runs last`,

  "query string to object": `// ── Other approach ──

// 2. URLSearchParams — handles encoding, repeated keys, "?" prefix
function queryToObject2(query) {
  return Object.fromEntries(new URLSearchParams(query));
}
// Repeated keys → collect into arrays:
function queryToObjectMulti(query) {
  const params = new URLSearchParams(query);
  const out = {};
  for (const key of params.keys()) {
    const all = params.getAll(key);
    out[key] = all.length > 1 ? all : all[0];
  }
  return out;
}`,

  "flatten object": `// ── Other approach ──

// 2. Iterative with a stack (no recursion depth limit)
function flattenObjectIterative(obj) {
  const out = {};
  const stack = [["", obj]];
  while (stack.length) {
    const [prefix, current] = stack.pop();
    for (const [k, v] of Object.entries(current)) {
      const key = prefix ? \`\${prefix}.\${k}\` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        stack.push([key, v]);
      } else {
        out[key] = v;
      }
    }
  }
  return out;
}`,

  "find longest word": `// ── Other approaches ──

// 2. reduce
const longestWord2 = (s) =>
  s.split(/\\s+/).reduce((a, b) => (b.length > a.length ? b : a), "");

// 3. Sort by length desc
const longestWord3 = (s) =>
  s.split(/\\s+/).sort((a, b) => b.length - a.length)[0];`,

  "implement promise race": `// ── Related: Promise.any (first fulfilled, ignores rejections) ──

function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    let pending = promises.length;
    const errors = [];
    promises.forEach((p, i) => {
      Promise.resolve(p).then(resolve, (err) => {
        errors[i] = err;
        if (--pending === 0) reject(new AggregateError(errors));
      });
    });
  });
}`,

  "implement map": `// ── Other approach ──

// 2. As a standalone function (not on the prototype) built on reduce
const myMap = (arr, cb) =>
  arr.reduce((acc, v, i) => {
    acc.push(cb(v, i, arr));
    return acc;
  }, []);`,

  "implement filter": `// ── Other approach ──

// 2. Standalone function built on reduce
const myFilter = (arr, cb) =>
  arr.reduce((acc, v, i) => {
    if (cb(v, i, arr)) acc.push(v);
    return acc;
  }, []);`,

  // ---- React ----

  counter: `// ── Other approach: useReducer ──
// Preferred once the transitions become "named events" rather than raw setters.

import { useReducer } from "react";

function reducer(count, action) {
  switch (action) {
    case "inc":   return count + 1;
    case "dec":   return count - 1;
    case "reset": return 0;
    default:      return count;
  }
}

function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);
  return (
    <div>
      <h2>{count}</h2>
      <button onClick={() => dispatch("inc")}>+</button>
      <button onClick={() => dispatch("dec")}>-</button>
      <button onClick={() => dispatch("reset")}>Reset</button>
    </div>
  );
}`,

  toggle: `// ── Other approaches ──

// 2. useReducer — the classic "one-liner reducer"
const [on, toggle] = useReducer((v) => !v, false);
// <button onClick={toggle}>{on ? "ON" : "OFF"}</button>

// 3. Extract a reusable hook with a stable API
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle];
}`,

  "debounced search": `// ── Other approach: useDeferredValue (React 18+) ──
// No timers — React renders results at low priority while the input stays snappy.

function Search({ items }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => items.filter((i) => i.includes(deferredQuery)),
    [items, deferredQuery]
  );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{results.map((r) => <li key={r}>{r}</li>)}</ul>
    </>
  );
}`,

  modal: `// ── Production variant: render through a portal + trap focus ──

import { createPortal } from "react-dom";

function Modal({ onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}`,

  "form validation": `// ── Other approach: schema-driven validation ──
// For anything non-trivial, validate against a schema (Zod / Yup) instead of
// hand-rolled per-field checks, and let a form library own the wiring.

import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

function validate(values) {
  const result = schema.safeParse(values);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((i) => [i.path[0], i.message])
  );
}

// With react-hook-form:
// const { register, handleSubmit, formState: { errors } } =
//   useForm({ resolver: zodResolver(schema) });`,
};

export const altSolutions = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => [norm(k), v])
);

export const normTitle = norm;
