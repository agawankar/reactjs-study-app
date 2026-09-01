// React coding challenges — the "write code on the spot" React questions,
// kept together in one place under PART XIV so all coding practice lives in
// the CODING CHALLENGES part. Concept explanations stay in PART II — REACT;
// this section is deliberately code-first.
//
// Shape matches the other data modules: { question, answer, code }.
// parts.js assigns the sequential QN. ids.

const c = (question, answer, code) => ({ question, answer, code });

const reactCodingChallenges = [
  c(
    "Build a useDebounce hook and a debounced search input",
    "Difficulty: Easy · Category: Hooks\n\nThe cleanup clears the previous timeout on every change, so the debounced value only updates once the input has been idle for the delay. Mention that the API-call effect keys off the debounced value, not the raw one.",
    `function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function Search() {
  const [query, setQuery] = React.useState("");
  const debounced = useDebounce(query, 400);

  React.useEffect(() => {
    if (!debounced) return;
    const ctrl = new AbortController();
    fetch(\`/api/search?q=\${debounced}\`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(setResults)
      .catch(() => {});
    return () => ctrl.abort();
  }, [debounced]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}`
  ),
  c(
    "Implement usePrevious to track a value's previous render",
    "Difficulty: Easy · Category: Hooks\n\nThe ref is updated in an effect, so during render it still holds the value from the previous commit. Useful for animating on change or comparing old vs new props.",
    `function usePrevious(value) {
  const ref = React.useRef(undefined);
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function Counter({ count }) {
  const prev = usePrevious(count);
  return <p>Now: {count}, before: {prev ?? "—"}</p>;
}`
  ),
  c(
    "Write a useFetch hook with loading, error, and cancellation",
    "Difficulty: Medium · Category: Data fetching\n\nModel the three states explicitly, key the effect on the url, and abort the previous request so a slow earlier response cannot overwrite a newer one. In a real app, prefer React Query / SWR.",
    `function useFetch(url) {
  const [state, setState] = React.useState({
    status: "idle", data: null, error: null,
  });

  React.useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading", data: null, error: null });

    fetch(url, { signal: ctrl.signal })
      .then(r => {
        if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
        return r.json();
      })
      .then(data => setState({ status: "success", data, error: null }))
      .catch(err => {
        if (err.name !== "AbortError")
          setState({ status: "error", data: null, error: err });
      });

    return () => ctrl.abort();
  }, [url]);

  return state;
}`
  ),
  c(
    "Implement useLocalStorage as a drop-in useState replacement",
    "Difficulty: Medium · Category: Hooks\n\nLazy-initialize from storage, persist in an effect, and wrap storage access in try/catch for private mode and quota errors. Returns the same [value, setValue] tuple as useState.",
    `function useLocalStorage(key, initialValue) {
  const [value, setValue] = React.useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota / private mode */
    }
  }, [key, value]);

  return [value, setValue];
}`
  ),
  c(
    "Build a useOnClickOutside hook",
    "Difficulty: Medium · Category: Hooks / DOM\n\nAttach a document listener, ignore clicks that land inside the ref'd element, and clean up. Handle touchstart too for mobile. Common for closing dropdowns, popovers, and modals.",
    `function useOnClickOutside(ref, handler) {
  React.useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

function Dropdown() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  useOnClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref}>
      <button onClick={() => setOpen(o => !o)}>Menu</button>
      {open && <ul>...</ul>}
    </div>
  );
}`
  ),
  c(
    "Implement a self-correcting useInterval hook",
    "Difficulty: Medium · Category: Hooks / timers\n\nKeeping the latest callback in a ref means the interval always fires with fresh state without being torn down and recreated. Passing delay = null pauses it.",
    `function useInterval(callback, delay) {
  const savedCallback = React.useRef(callback);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// usage: pause by passing null
useInterval(() => setCount(c => c + 1), running ? 1000 : null);`
  ),
  c(
    "Write a withAuthGate Higher-Order Component",
    "Difficulty: Medium · Category: Patterns\n\nThe HOC decides what renders — login screen, forbidden page, or the wrapped component — based on auth and role. Set displayName, spread props through. Note that client gating is UX only; the server must still authorize.",
    `function withAuthGate(Component, requiredRoles = []) {
  function Guarded(props) {
    const { user } = useAuth();
    if (!user) return <LoginScreen />;
    const allowed =
      requiredRoles.length === 0 ||
      requiredRoles.some(r => user.roles.includes(r));
    if (!allowed) return <Forbidden />;
    return <Component {...props} />;
  }
  Guarded.displayName =
    \`withAuthGate(\${Component.displayName || Component.name || "Component"})\`;
  return Guarded;
}

const AdminPanel = withAuthGate(AdminPanelBase, ["admin"]);`
  ),
  c(
    "Implement an Error Boundary with a retry",
    "Difficulty: Medium · Category: Resilience\n\nError boundaries must be class components: getDerivedStateFromError sets fallback state, componentDidCatch reports. The retry resets state and a key bump forces the subtree to remount cleanly.",
    `class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    reportError(error, info);
  }
  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div role="alert">
          <p>Something went wrong.</p>
          <button onClick={this.reset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}`
  ),
  c(
    "Build a Tabs compound component with context",
    "Difficulty: Medium · Category: Patterns / a11y\n\nParent owns the active index in context; Tab and Panel read it. Add roles (tablist/tab/tabpanel), aria-selected, and arrow-key navigation for a complete answer.",
    `const TabsContext = React.createContext(null);

function Tabs({ children, defaultIndex = 0 }) {
  const [index, setIndex] = React.useState(defaultIndex);
  const value = React.useMemo(() => ({ index, setIndex }), [index]);
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ i, children }) {
  const { index, setIndex } = React.useContext(TabsContext);
  return (
    <button role="tab" aria-selected={index === i} onClick={() => setIndex(i)}>
      {children}
    </button>
  );
}

function TabPanel({ i, children }) {
  const { index } = React.useContext(TabsContext);
  return index === i ? <div role="tabpanel">{children}</div> : null;
}

Tabs.List = TabList; Tabs.Tab = Tab; Tabs.Panel = TabPanel;`
  ),
  c(
    "Create a global store with useReducer + Context (no Redux)",
    "Difficulty: Medium · Category: State management\n\nSplitting state and dispatch into two contexts means components that only dispatch never re-render when state changes. dispatch identity is stable.",
    `const StateCtx = React.createContext(null);
const DispatchCtx = React.createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "increment": return { ...state, count: state.count + 1 };
    case "reset":     return { ...state, count: 0 };
    default:          throw new Error(\`Unknown: \${action.type}\`);
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, { count: 0 });
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useStoreState = () => React.useContext(StateCtx);
export const useDispatch = () => React.useContext(DispatchCtx);`
  ),
  c(
    "Implement a virtualized list from scratch",
    "Difficulty: Hard · Category: Performance\n\nRender only the rows in the scroll window plus overscan. A spacer div of totalHeight preserves the scrollbar; visible rows are absolutely positioned by index. In production use react-window / TanStack Virtual.",
    `function VirtualList({ items, rowHeight = 40, height = 600, overscan = 5 }) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const total = items.length * rowHeight;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(
    items.length,
    Math.ceil((scrollTop + height) / rowHeight) + overscan
  );
  const visible = items.slice(start, end);

  return (
    <div
      style={{ height, overflowY: "auto", position: "relative" }}
      onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: total }} />
      {visible.map((item, i) => (
        <div
          key={start + i}
          style={{
            position: "absolute",
            top: (start + i) * rowHeight,
            height: rowHeight,
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}`
  ),
  c(
    "Build a useToggle / useBoolean hook with a stable API",
    "Difficulty: Easy · Category: Hooks\n\nReturn memoized callbacks so consumers wrapped in React.memo don't re-render. Expose intent-named actions rather than a raw setter.",
    `function useToggle(initial = false) {
  const [on, setOn] = React.useState(initial);
  const toggle = React.useCallback(() => setOn(o => !o), []);
  const setTrue = React.useCallback(() => setOn(true), []);
  const setFalse = React.useCallback(() => setOn(false), []);
  return { on, toggle, setTrue, setFalse };
}`
  ),
  c(
    "Implement useMediaQuery with SSR safety",
    "Difficulty: Medium · Category: Hooks / SSR\n\nGuard window access, subscribe to the MediaQueryList, and clean up. Returning a stable default on the server keeps first client render matching the server HTML to avoid hydration mismatch.",
    `function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;

  const [matches, setMatches] = React.useState(getMatch);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}`
  ),
  c(
    "Write a controlled + uncontrolled input that works both ways",
    "Difficulty: Medium · Category: Forms\n\nA reusable input should accept an optional value/onChange (controlled) and fall back to internal state (uncontrolled) — the pattern behind most component-library inputs.",
    `function Input({ value: controlled, defaultValue = "", onChange }) {
  const isControlled = controlled !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = isControlled ? controlled : internal;

  function handleChange(e) {
    if (!isControlled) setInternal(e.target.value);
    onChange?.(e);
  }

  return <input value={value} onChange={handleChange} />;
}`
  ),
  c(
    "Fix the stale-closure bug in a setInterval counter",
    "Difficulty: Easy · Category: Hooks / debugging\n\nThe broken version captures count = 0 forever because the effect runs once and the closure never updates. Fix with a functional updater (or the useInterval ref pattern).",
    `// ❌ logs / sets 1 forever
React.useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []); // count is frozen at its mount value

// ✅ functional update doesn't depend on the captured value
React.useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []);`
  ),
  c(
    "Lazy-load a route with Suspense, an error boundary, and preload on hover",
    "Difficulty: Medium · Category: Performance / code splitting\n\nReact.lazy + Suspense splits the chunk; the error boundary handles a failed chunk load after a deploy; importing on hover warms the cache so the click feels instant.",
    `const Reports = React.lazy(() => import("./pages/Reports"));

function App() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  );
}

<Link to="/reports" onMouseEnter={() => import("./pages/Reports")}>
  Reports
</Link>`
  ),
];

export default reactCodingChallenges;
