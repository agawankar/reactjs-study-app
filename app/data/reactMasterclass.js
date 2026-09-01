// React interview masterclass — 16 topics, prepared in interview order.
// Content is authored without global IDs/section numbers; app/data/parts.js
// assigns sequential section numbers and question IDs at build time so the
// numbering stays consistent no matter how sections are reordered or merged.

const q = (question, answer, code = "") => ({ question, answer, code });

const sections = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Hooks (in interview order)",
    questions: [
      q(
        "What are hooks and what are the Rules of Hooks?",
        "Hooks are functions that let a function component use React features — state, lifecycle-style side effects, context, refs — without writing a class. The Rules of Hooks: (1) only call hooks at the top level of a component or another hook, never inside conditions, loops or nested functions, and (2) only call them from React function components or custom hooks. React relies on a stable call order between renders to associate each hook call with its stored state, which is why conditional calls break it. The eslint-plugin-react-hooks rules enforce both.",
        `// ❌ breaks call order
function Bad({ show }) {
  if (show) {
    const [x, setX] = useState(0); // conditional hook
  }
}

// ✅ hook is unconditional; the condition lives in the value
function Good({ show }) {
  const [x, setX] = useState(0);
  return show ? <span>{x}</span> : null;
}`
      ),
      q(
        "useState — how does it work and when do you use the updater form?",
        "useState returns the current state for this render and a setter. Calling the setter schedules a re-render; it does not mutate the variable in the current render (state is a per-render snapshot). Use the functional updater setX(prev => ...) whenever the next value depends on the previous one, because multiple updates in the same event are batched and all read the same snapshot otherwise. Pass a function to useState(() => expensiveInit()) for lazy initialization so the expensive work runs only on mount.",
        `const [count, setCount] = useState(0);

// ❌ both calls see count = 0 → ends at 1
setCount(count + 1);
setCount(count + 1);

// ✅ each call gets the latest queued value → ends at 2
setCount(c => c + 1);
setCount(c => c + 1);

// lazy init: readFromStorage() runs once, not every render
const [prefs, setPrefs] = useState(() => readFromStorage());`
      ),
      q(
        "useEffect — what is it for, and what does the dependency array mean?",
        "useEffect synchronizes a component with an external system — subscriptions, timers, manual DOM work, network requests, logging — and runs after the render is committed to the screen. The dependency array lists every reactive value (props, state, context-derived values) the effect reads; React re-runs the effect whenever one of those changes. `[]` means 'set up once after mount, tear down on unmount'. Omitting the array runs the effect after every render. The returned function is the cleanup, run before the next effect and on unmount. Do not use an effect for data you can compute during render or for logic that belongs in an event handler.",
        `useEffect(() => {
  const id = setInterval(() => setTick(t => t + 1), 1000);
  return () => clearInterval(id); // cleanup: prevents leak + duplicate timers
}, []); // no deps read → runs once

useEffect(() => {
  const ctrl = new AbortController();
  fetch(\`/api/users/\${userId}\`, { signal: ctrl.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(e => { if (e.name !== "AbortError") setError(e); });
  return () => ctrl.abort(); // cancel stale request when userId changes
}, [userId]);`
      ),
      q(
        "useContext — what does it do and what is its main performance pitfall?",
        "useContext(MyContext) reads the value from the nearest matching <MyContext.Provider> above the component and subscribes the component to it. When the provider's `value` changes by reference, every consumer re-renders — React does not diff individual fields. The common pitfall is passing a fresh object literal as `value` on every render, which re-renders all consumers even when nothing they care about changed. Fix it by memoizing the value, splitting a large context into stable slices (e.g. separate state and dispatch contexts), or using a store library for high-frequency updates.",
        `const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // ✅ stable reference unless user changes
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}`
      ),
      q(
        "useReducer — how does it work and when is it better than useState?",
        "useReducer(reducer, initialState) returns [state, dispatch]. You dispatch action objects; the pure reducer computes the next state from (state, action). Reach for it over useState when: multiple pieces of state change together, the next state depends on complex logic, transitions should be described as named events rather than scattered setters, or you want to move update logic out of the component to unit-test it in isolation. dispatch has a stable identity, so passing it down never causes extra renders.",
        `function reducer(state, action) {
  switch (action.type) {
    case "submit":  return { ...state, status: "loading", error: null };
    case "success": return { ...state, status: "done", data: action.data };
    case "error":   return { ...state, status: "error", error: action.error };
    default:        throw new Error(\`Unknown action: \${action.type}\`);
  }
}

const [state, dispatch] = useReducer(reducer, {
  status: "idle", data: null, error: null,
});

dispatch({ type: "submit" });`
      ),
      q(
        "useMemo — what does it cache and when is it worth it?",
        "useMemo(fn, deps) runs fn during render and caches its return value, recomputing only when a dependency changes. Use it for genuinely expensive calculations, or to keep a referential identity stable (an object/array passed to a memoized child or used as another hook's dependency). It is not free: React stores the value and compares deps every render, so wrapping trivial math is noise. With the React Compiler enabled, most of this memoization is inserted automatically and you write far less useMemo by hand.",
        `// expensive derived data — recompute only when inputs change
const visibleRows = useMemo(
  () => rows.filter(r => r.active).sort((a, b) => a.name.localeCompare(b.name)),
  [rows]
);

// stable reference so <Chart> (React.memo) doesn't re-render every tick
const chartConfig = useMemo(() => ({ type: "bar", color }), [color]);`
      ),
      q(
        "useCallback — how is it different from useMemo?",
        "useCallback(fn, deps) caches a function reference; useCallback(fn, deps) is exactly useMemo(() => fn, deps). It matters only when the function identity is observed: it is passed to a React.memo child, used as a dependency of another hook, or registered/unregistered as an event listener in an effect. Wrapping every handler in useCallback without a consumer that cares just adds overhead. Like useMemo, the React Compiler makes most manual useCallback unnecessary.",
        `const handleSelect = useCallback((id) => {
  setSelected(prev => (prev === id ? null : id));
}, []); // stable identity → <Row> wrapped in React.memo won't re-render

// used as an effect dependency without churning the effect
useEffect(() => {
  socket.on("message", handleSelect);
  return () => socket.off("message", handleSelect);
}, [handleSelect]);`
      ),
      q(
        "useRef — what are its two uses and how does it differ from state?",
        "useRef(initial) returns a mutable object { current } that persists for the component's lifetime. Mutating ref.current does not trigger a re-render. Two uses: (1) hold a reference to a DOM node via the ref attribute, and (2) store a mutable value that should survive renders but isn't rendered — a timer id, the previous value of a prop, a flag for 'has mounted', a latest-callback holder. Use state when a change must update the UI; use a ref when it must not.",
        `function StopWatch() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null); // survives renders, no re-render on write

  function start() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }
  function stop() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
  return <><span>{seconds}s</span><button onClick={start}>Start</button><button onClick={stop}>Stop</button></>;
}

// DOM ref
const inputRef = useRef(null);
<input ref={inputRef} />;
inputRef.current.focus();`
      ),
      q(
        "How do the hooks map to what class components used to do?",
        "useState / useReducer replace this.state and this.setState. useEffect covers componentDidMount, componentDidUpdate and componentWillUnmount as a single synchronization primitive keyed by dependencies. useContext replaces the render-prop / contextType consumer. useRef replaces instance fields (this.x = ...) and createRef. There is no direct hook for getSnapshotBeforeUpdate or the old error-boundary lifecycles — error boundaries still require a class (or a library wrapper).",
        `// class
class Timer extends React.Component {
  state = { n: 0 };
  componentDidMount() { this.id = setInterval(this.tick, 1000); }
  componentWillUnmount() { clearInterval(this.id); }
  tick = () => this.setState(s => ({ n: s.n + 1 }));
  render() { return <p>{this.state.n}</p>; }
}

// hooks
function Timer() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN(v => v + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{n}</p>;
}`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Higher-Order Components (HOC)",
    questions: [
      q(
        "What is a Higher-Order Component?",
        "A HOC is a function that takes a component and returns a new component that wraps it, injecting props or behavior. It is a pattern, not a React API — the name mirrors higher-order functions. `const Enhanced = withThing(Component)`. Classic examples: connect() from react-redux, withRouter, withTranslation. The wrapped component stays presentational; the HOC owns the cross-cutting logic (subscriptions, data, auth checks).",
        `function withUser(Component) {
  return function WithUser(props) {
    const { user } = useAuth();
    return <Component {...props} user={user} />;
  };
}

const ProfileWithUser = withUser(Profile);`
      ),
      q(
        "When would you use a HOC versus a custom hook or render props?",
        "Since hooks arrived, a custom hook is the default way to share stateful logic — no wrapper component, no extra tree depth, no prop-name collisions. Use a HOC when you must wrap a component you do not control, when you need to conditionally swap the rendered component (e.g. render a login screen instead of the page), when integrating with an older library that expects the pattern, or when the enhancement must apply to class components. Render props solve the same 'share logic' problem as HOCs but express it as a child function; hooks have largely replaced both for new code.",
        `// hook — preferred for logic reuse
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

// HOC — appropriate when it decides WHAT renders
function withAuthGate(Component) {
  return function Guarded(props) {
    const { user } = useAuth();
    if (!user) return <LoginScreen />;
    return <Component {...props} />;
  };
}`
      ),
      q(
        "Why can HOCs be problematic?",
        "They add a wrapper node at every layer, so stacking several produces 'wrapper hell' in the tree and DevTools. Injected props are implicit — it is not obvious from the call site where `user` or `t` came from, and two HOCs can inject the same prop name and silently collide. Static methods and refs are not forwarded unless you do it explicitly (hoist-non-react-statics, forwardRef). Types get harder to express. These are the reasons hooks are preferred now.",
        `// prop collision: which \`data\` wins?
export default withUsers(withPosts(Dashboard)); // both inject props.data

// ref is lost unless forwarded
function withLog(Component) {
  return React.forwardRef((props, ref) => {
    useEffect(() => console.log("mounted"), []);
    return <Component ref={ref} {...props} />;
  });
}`
      ),
      q(
        "How do you write a well-behaved HOC?",
        "Spread through all props you do not consume ({...props}), set a readable displayName so DevTools shows withThing(Original), forward refs when the wrapped component needs them, copy non-React statics if the wrapped component exposes any, and never mutate the input component — always compose. Keep the HOC's own concern narrow (one cross-cutting behavior per HOC).",
        `function withErrorLog(Component) {
  function WithErrorLog(props) {
    useEffect(() => {
      return () => reportUnmount(Component.name);
    }, []);
    return <Component {...props} />;
  }
  WithErrorLog.displayName =
    \`withErrorLog(\${Component.displayName || Component.name || "Component"})\`;
  return WithErrorLog;
}`
      ),
      q(
        "Example: withLoading — swap the component for a spinner while data loads",
        "A classic presentational HOC. It reads a well-known prop (isLoading) and renders a fallback instead of the wrapped component, so every screen gets consistent loading UI without repeating the check. It still spreads the rest of the props through.",
        `function withLoading(Component, Fallback = DefaultSpinner) {
  function WithLoading({ isLoading, ...rest }) {
    if (isLoading) return <Fallback />;
    return <Component {...rest} />;
  }
  WithLoading.displayName =
    \`withLoading(\${Component.displayName || Component.name || "Component"})\`;
  return WithLoading;
}

const UserListWithLoading = withLoading(UserList);

// <UserListWithLoading isLoading={query.isPending} users={query.data} />`
      ),
      q(
        "Example: withErrorBoundary — wrap any component in an error boundary",
        "Error boundaries must be classes, so a HOC is a natural way to apply one declaratively to many components. The HOC also lets you pass a per-component fallback and onError handler without every caller writing the boundary JSX.",
        `class Boundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { this.props.onError?.(error, info); }
  render() {
    if (this.state.error) return this.props.fallback ?? <p role="alert">Something broke.</p>;
    return this.props.children;
  }
}

function withErrorBoundary(Component, { fallback, onError } = {}) {
  function Wrapped(props) {
    return (
      <Boundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </Boundary>
    );
  }
  Wrapped.displayName =
    \`withErrorBoundary(\${Component.displayName || Component.name || "Component"})\`;
  return Wrapped;
}

export default withErrorBoundary(Dashboard, { onError: reportError });`
      ),
      q(
        "Example: withDataFetching — a generic data-loading HOC",
        "A parameterized HOC: it takes a function that builds the URL from props, manages loading/error/data state, cancels stale requests, and injects the result. This is the pattern react-redux's connect and Relay's containers generalized before hooks. Today you would write a useQuery hook instead, but interviewers often ask you to show the HOC version.",
        `function withDataFetching(getUrl) {
  return function (Component) {
    function WithData(props) {
      const [state, setState] = React.useState({
        status: "loading", data: null, error: null,
      });
      const url = getUrl(props);

      React.useEffect(() => {
        const ctrl = new AbortController();
        setState({ status: "loading", data: null, error: null });
        fetch(url, { signal: ctrl.signal })
          .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(data => setState({ status: "success", data, error: null }))
          .catch(err => {
            if (err.name !== "AbortError")
              setState({ status: "error", data: null, error: err });
          });
        return () => ctrl.abort();
      }, [url]);

      return <Component {...props} {...state} />;
    }
    WithData.displayName =
      \`withDataFetching(\${Component.displayName || Component.name || "Component"})\`;
    return WithData;
  };
}

const UserProfile = withDataFetching(props => \`/api/users/\${props.id}\`)(ProfileView);
// <UserProfile id={7} />  → ProfileView gets { status, data, error, id }`
      ),
      q(
        "Example: withPermission / withFeatureFlag — gate rendering on access",
        "A decision HOC: it chooses whether to render the component at all based on a permission or a feature flag, returning null or a fallback otherwise. Centralizing the check here keeps the rule in one place and out of every screen.",
        `function withPermission(permission, Fallback = null) {
  return function (Component) {
    function Guarded(props) {
      const can = useCan(permission); // reads roles → permissions from context
      if (!can) return Fallback ? <Fallback /> : null;
      return <Component {...props} />;
    }
    Guarded.displayName =
      \`withPermission(\${permission})(\${Component.displayName || Component.name})\`;
    return Guarded;
  };
}

const BillingSettings = withPermission("billing:manage", Forbidden)(BillingSettingsView);

function withFeatureFlag(flag) {
  return (Component) => (props) =>
    useFlags()[flag] ? <Component {...props} /> : null;
}`
      ),
      q(
        "Example: connect — how react-redux's HOC works under the hood",
        "connect(mapStateToProps, mapDispatchToProps)(Component) is the archetypal HOC: it subscribes to the store, computes derived props for the wrapped component, and re-renders it only when those props change. A minimal version shows the shape — subscribe in an effect, select with the map functions, force an update on change.",
        `function connect(mapStateToProps, mapDispatchToProps) {
  return function (Component) {
    function Connected(ownProps) {
      const store = React.useContext(StoreContext);
      const [, forceRender] = React.useReducer(n => n + 1, 0);

      React.useEffect(() => store.subscribe(forceRender), [store]);

      const stateProps = mapStateToProps(store.getState(), ownProps);
      const dispatchProps = mapDispatchToProps
        ? mapDispatchToProps(store.dispatch, ownProps)
        : { dispatch: store.dispatch };

      return <Component {...ownProps} {...stateProps} {...dispatchProps} />;
    }
    Connected.displayName =
      \`connect(\${Component.displayName || Component.name || "Component"})\`;
    return Connected;
  };
}

export default connect(
  state => ({ items: state.cart.items }),
  dispatch => ({ add: item => dispatch(itemAdded(item)) })
)(Cart);`
      ),
      q(
        "Example: composing multiple HOCs with a compose helper",
        "Stacking HOCs by hand — a(b(c(Component))) — reads inside-out and is noisy. A compose utility (right-to-left function composition, the same one Redux ships) flattens it. Keep the stack shallow; each layer is a wrapper node and an implicit prop source.",
        `const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

const enhance = compose(
  withErrorBoundary,
  withLoading,
  withPermission("reports:view", Forbidden),
  withDataFetching(props => \`/api/reports/\${props.id}\`)
);

export default enhance(ReportView);
// equivalent to:
// withErrorBoundary(withLoading(withPermission(...)(withDataFetching(...)(ReportView))))`
      ),
      q(
        "Example: typing a HOC in TypeScript",
        "The tricky part is that the HOC removes some props (the ones it injects) from the public surface and keeps the rest. Use a generic that takes the wrapped component's full props and returns a component whose props are those minus the injected ones.",
        `interface WithUserProps {
  user: User;
}

function withUser<P extends WithUserProps>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, keyof WithUserProps>> {
  return function WithUser(props) {
    const { user } = useAuth();
    return <Component {...(props as P)} user={user} />;
  };
}

// Profile requires { user: User; id: string }
// withUser(Profile) is now <FC<{ id: string }>> — \`user\` is supplied internally`
      ),
      q(
        "Migrating a HOC to a hook — before and after",
        "Most legacy HOCs that only inject data (not decide what renders) become a one-line hook call. The component loses a wrapper layer, the injected value's origin becomes explicit, and there are no prop-name collisions.",
        `// HOC version
function withWindowSize(Component) {
  return function (props) {
    const [size, setSize] = React.useState({ w: innerWidth, h: innerHeight });
    React.useEffect(() => {
      const on = () => setSize({ w: innerWidth, h: innerHeight });
      addEventListener("resize", on);
      return () => removeEventListener("resize", on);
    }, []);
    return <Component {...props} windowSize={size} />;
  };
}
export default withWindowSize(Chart); // Chart reads props.windowSize

// hook version
function useWindowSize() {
  const [size, setSize] = React.useState({ w: innerWidth, h: innerHeight });
  React.useEffect(() => {
    const on = () => setSize({ w: innerWidth, h: innerHeight });
    addEventListener("resize", on);
    return () => removeEventListener("resize", on);
  }, []);
  return size;
}
function Chart(props) {
  const windowSize = useWindowSize(); // explicit, no wrapper, no injected prop
}`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Component Lifecycle (class components)",
    questions: [
      q(
        "What are the three lifecycle phases of a class component?",
        "Mounting (the instance is created and inserted into the DOM), Updating (it re-renders because of new props or state), and Unmounting (it is removed from the DOM). Each phase has methods React calls in a defined order. Function components express the same phases through useState/useEffect rather than named methods.",
        ""
      ),
      q(
        "Which methods run during mounting, and in what order?",
        "constructor → static getDerivedStateFromProps → render → React updates the DOM → componentDidMount. The constructor sets initial state and binds handlers. render must be pure. componentDidMount is where you start subscriptions, fetch data, or read layout — the DOM exists at this point.",
        `class UserCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }
  componentDidMount() {
    this.controller = new AbortController();
    fetch(\`/api/users/\${this.props.id}\`, { signal: this.controller.signal })
      .then(r => r.json())
      .then(user => this.setState({ user }));
  }
  componentWillUnmount() {
    this.controller.abort();
  }
  render() {
    return this.state.user ? <h2>{this.state.user.name}</h2> : <Spinner />;
  }
}`
      ),
      q(
        "Which methods run during updating?",
        "static getDerivedStateFromProps → shouldComponentUpdate → render → getSnapshotBeforeUpdate → React commits DOM changes → componentDidUpdate(prevProps, prevState, snapshot). shouldComponentUpdate returning false skips render (PureComponent implements a shallow-prop version). componentDidUpdate is where you react to a specific prop change — always guard it with a comparison to avoid an infinite update loop.",
        `componentDidUpdate(prevProps) {
  if (prevProps.userId !== this.props.userId) {
    this.loadUser(this.props.userId); // guarded: only when it actually changed
  }
}

shouldComponentUpdate(nextProps, nextState) {
  return nextProps.value !== this.props.value;
}`
      ),
      q(
        "What runs during unmounting, and why does it matter?",
        "Only componentWillUnmount. It is your one chance to clean up anything that outlives the component: clear timers and intervals, unsubscribe from stores or sockets, remove manually attached event listeners, cancel in-flight requests. Skipping it causes memory leaks and 'setState on an unmounted component' style bugs. This is exactly what a useEffect cleanup function does in a function component.",
        `componentWillUnmount() {
  clearInterval(this.timer);
  window.removeEventListener("resize", this.onResize);
  this.socket.close();
}`
      ),
      q(
        "What are the modern equivalents, and which lifecycles were removed?",
        "componentWillMount, componentWillReceiveProps and componentWillUpdate were deprecated (aliased as UNSAFE_*) because they misbehave with concurrent rendering. Their use cases moved to getDerivedStateFromProps, componentDidUpdate, or deriving values during render. In function components: constructor → useState initializer; componentDidMount → useEffect(fn, []); componentDidUpdate → useEffect(fn, [deps]); componentWillUnmount → the cleanup return. Error boundaries still need a class with componentDidCatch / static getDerivedStateFromError.",
        `class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { reportError(error, info); }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "State Management — state, props, prop drilling, context",
    questions: [
      q(
        "What is the difference between state and props?",
        "Props are inputs passed into a component by its parent — read-only from the child's perspective. State is data a component owns and can update over time with its setter; updating it re-renders that component and its children. A change flows down: state in one component becomes props in the components it renders. If two components need the same changing value, that value should be state in their nearest common ancestor and passed down as props.",
        `function Parent() {
  const [query, setQuery] = useState("");     // state: owned here
  return (
    <>
      <SearchBox value={query} onChange={setQuery} />  {/* props: passed down */}
      <Results query={query} />
    </>
  );
}

function SearchBox({ value, onChange }) {       // props are read-only here
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}`
      ),
      q(
        "What is prop drilling and why is it a problem?",
        "Prop drilling is passing a prop through many intermediate components that do not use it, just to reach a deep consumer. It couples unrelated components to that prop, makes refactors noisy (every layer's signature changes), and clutters components with pass-through props. It is only a real problem at depth — passing a prop one or two levels is normal and clearer than indirection.",
        `// drilling: <Layout> and <Sidebar> don't use \`user\`, only forward it
<App>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} />   {/* the only real consumer */}
    </Sidebar>
  </Layout>
</App>`
      ),
      q(
        "How do you fix prop drilling, and what are the options?",
        "Options, roughly in order of reach: (1) component composition — pass the element as children/slots so the data-owning parent renders the consumer directly and no middle layer sees the prop; (2) React Context for genuinely app-wide, low-frequency values (current user, theme, locale); (3) a state library (Redux Toolkit, Zustand, Jotai) for large, frequently updated, cross-cutting state; (4) a server-cache library (React Query, SWR, RTK Query) when the 'state' is really server data. Composition solves a surprising amount before you need context.",
        `// composition removes the drill: Layout just renders whatever it's given
function Page() {
  const { user } = useAuth();
  return (
    <Layout sidebar={<Sidebar><UserMenu user={user} /></Sidebar>}>
      <Content />
    </Layout>
  );
}

function Layout({ sidebar, children }) {
  return <div className="grid">{sidebar}<main>{children}</main></div>;
}`
      ),
      q(
        "How does Context work and when should you use it?",
        "createContext() gives a Provider and a value readable anywhere below it with useContext. Use it for data that is truly global and changes rarely: theme, authenticated user, locale, feature flags. Every consumer re-renders when the provider's value changes by reference, so it is a poor fit for high-frequency state (mouse position, form keystrokes, anything per-frame). Wrap useContext in a small custom hook that throws if the provider is missing.",
        `const ThemeContext = createContext("light");

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggle = useCallback(() => setTheme(t => (t === "light" ? "dark" : "light")), []);
  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) throw new Error("useTheme must be inside <ThemeProvider>");
  return ctx;
}`
      ),
      q(
        "How do you keep Context from causing unnecessary re-renders?",
        "Memoize the provider value so its reference is stable. Split one big context into narrower ones so a change to A does not re-render consumers of B — a common split is a state context and a separate dispatch context, since dispatch never changes. Push state down / colocate it so fewer things live in context at all. For genuinely hot state, use an external store (useSyncExternalStore, Zustand, Redux) where components subscribe to selected slices instead of the whole value.",
        `// two contexts: components that only dispatch never re-render on state change
const StateCtx = createContext(null);
const DispatchCtx = createContext(null);

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}`
      ),
      q(
        "How do you decide where a piece of state should live?",
        "Start with the component that uses it and move up only as far as needed. Local UI state (is a dropdown open, input value before submit) stays in the component. Shared UI state goes to the nearest common ancestor. App-wide preferences go in context. Server data belongs in a query cache, not hand-rolled useState + useEffect. Global client state (cart, multi-step wizard spanning routes) goes in a store. Over-lifting state causes wide re-renders and prop drilling; under-lifting causes duplication and sync bugs.",
        ""
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Redux & Zustand",
    questions: [
      q(
        "How does Redux work — the core data flow?",
        "There is one immutable store holding the whole app state tree. The UI dispatches a plain action object describing what happened. A pure reducer (state, action) => newState computes the next state without mutating the old one. Subscribed components read what they need via selectors and re-render when that slice changes. The strict one-way cycle — dispatch → reducer → new state → re-render — is what makes state changes predictable, loggable, and time-travel debuggable.",
        `// action
const added = { type: "cart/itemAdded", payload: { id: 42, qty: 1 } };

// reducer (pure, returns new state)
function cartReducer(state = { items: [] }, action) {
  switch (action.type) {
    case "cart/itemAdded":
      return { ...state, items: [...state.items, action.payload] };
    default:
      return state;
  }
}

// component
const itemCount = useSelector(s => s.cart.items.length);
const dispatch = useDispatch();
dispatch(added);`
      ),
      q(
        "Why use Redux — what problems does it actually solve?",
        "A predictable, centralized place for state that many distant parts of the app read and write; a serializable action log that makes bugs reproducible and enables DevTools time-travel; middleware as a single choke point for side effects, logging, and analytics; and decoupling — components dispatch intent without knowing who handles it. The cost is boilerplate and indirection, which is why Redux Toolkit exists and why you should not use it for state that is local or purely server-cached.",
        ""
      ),
      q(
        "When should you reach for Redux, and when should you not?",
        "Use it when you have substantial client-side state that is updated from many places, needs to persist across routes, benefits from an audit trail, or has complex cross-slice update logic. Do not use it for: local component state, form field state, or server data (use React Query / RTK Query / SWR — caching, revalidation and dedupe are their job, not a reducer's). Many modern apps need only Context + a server-cache library and never add Redux.",
        ""
      ),
      q(
        "What does Redux Toolkit (RTK) change?",
        "RTK is the official, batteries-included way to write Redux. configureStore sets up the store with good defaults (DevTools, thunk, immutability & serializability checks). createSlice generates the reducer and action creators from one object and lets you write 'mutating' code that Immer turns into immutable updates. createAsyncThunk handles pending/fulfilled/rejected for async work. RTK Query adds full data fetching + caching. It cuts Redux boilerplate by roughly 70% and removes most manual action-type constants.",
        `import { createSlice, configureStore } from "@reduxjs/toolkit";

const cart = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    itemAdded: (state, action) => {
      state.items.push(action.payload); // Immer → safe immutable update
    },
    itemRemoved: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
  },
});

export const { itemAdded, itemRemoved } = cart.actions;
export const store = configureStore({ reducer: { cart: cart.reducer } });`
      ),
      q(
        "How is Zustand different from Redux?",
        "Zustand is a small store built on hooks. You create a store with a function that receives set/get and returns state plus the functions that update it — no actions, no reducers, no providers, no context wrapper. Components subscribe with a selector and re-render only when that selected value changes. It keeps Redux's best idea (a single external store with selective subscription) while dropping the ceremony. Trade-off: less structure and a lighter middleware/DevTools story than the Redux ecosystem, though a devtools middleware exists.",
        `import { create } from "zustand";

const useCart = create((set) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  clear: () => set({ items: [] }),
}));

// no <Provider> needed
function CartBadge() {
  const count = useCart((s) => s.items.length); // re-renders only when count changes
  return <span>{count}</span>;
}`
      ),
      q(
        "How do you choose between Redux Toolkit, Zustand, and Context?",
        "Context: a handful of low-frequency global values, no extra dependency. Zustand: you want a real store with selective subscription and minimal boilerplate, and you do not need the full Redux tooling/conventions — great default for small-to-medium apps. Redux Toolkit: large apps, big teams, strict conventions, rich DevTools/time-travel, complex middleware, or RTK Query for server state. For server data specifically, prefer React Query / RTK Query regardless of which client-state tool you pick.",
        ""
      ),
      q(
        "How do you write an efficient selector?",
        "Select the smallest value a component needs, not a whole slice, so it re-renders only when that value changes. Avoid returning a new object/array from a selector inline — it fails reference equality every time; use useSelector with a shallowEqual comparator, or a memoized selector (Reselect / RTK's createSelector) for derived data. In Zustand, use the useShallow wrapper when selecting multiple fields at once.",
        `// ❌ new array every render → always re-renders
const active = useSelector(s => s.users.filter(u => u.active));

// ✅ memoized derived selector
import { createSelector } from "@reduxjs/toolkit";
const selectActiveUsers = createSelector(
  (s) => s.users,
  (users) => users.filter(u => u.active)
);
const active = useSelector(selectActiveUsers);`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Custom Hooks",
    questions: [
      q(
        "What is a custom hook and when should you create one?",
        "A custom hook is a function whose name starts with 'use' and that calls other hooks. Create one when the same stateful logic — an effect + its state, a subscription, a piece of derived state with its own updates — appears in more than one component, or when a single component's logic has grown tangled and a named hook would make it readable and testable. It shares logic, not state: each call site gets its own independent state.",
        ""
      ),
      q(
        "Write a useFetch / useLocalStorage style hook.",
        "A good custom hook has a small, intention-revealing return value, handles its own cleanup, and does not leak implementation details. useLocalStorage below syncs a state value to localStorage and stays in the same shape as useState so it is a drop-in replacement.",
        `function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [key, value]);

  return [value, setValue]; // same API as useState
}

// usage
const [theme, setTheme] = useLocalStorage("theme", "light");`
      ),
      q(
        "Show a useDebounce hook and explain the cleanup.",
        "useDebounce returns a value that only updates after the input has stopped changing for `delay` ms. Each render schedules a timeout; the cleanup clears the previous one, so rapid changes keep resetting the timer and only the final value 'wins'. This is the pattern behind debounced search inputs.",
        `function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // cancel the pending update on each change
  }, [value, delay]);

  return debounced;
}

function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  useEffect(() => {
    if (debouncedQuery) searchApi(debouncedQuery);
  }, [debouncedQuery]);
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}`
      ),
      q(
        "Why do custom hooks make code better?",
        "They make components cleaner (the component reads as 'what it renders', not 'how it wires effects'), more maintainable (the logic lives in one place, so a bug is fixed once), more readable (useOnlineStatus() says what it does), more reusable (any component can adopt it), and more testable (you can test the hook in isolation with a hooks testing utility, separate from any UI). They also give the logic a name, which is documentation.",
        `// before: component is 60% wiring
function Header() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return <Badge status={online ? "online" : "offline"} />;
}

// after: intent is obvious, logic is reusable + testable
function Header() {
  const online = useOnlineStatus();
  return <Badge status={online ? "online" : "offline"} />;
}`
      ),
      q(
        "What are common mistakes when writing custom hooks?",
        "Returning unstable references (a fresh object/array/function each render) that make consumers' memoization useless — memoize what you return. Doing too much in one hook instead of composing several small ones. Forgetting cleanup. Calling hooks conditionally inside the custom hook. Coupling the hook to a specific component's data shape so it cannot actually be reused. Naming it without the 'use' prefix, which disables the lint rules that keep it correct.",
        ""
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Lazy Loading, Code Splitting & Suspense",
    questions: [
      q(
        "What is code splitting and why does it matter?",
        "Code splitting breaks the bundle into multiple smaller files (chunks) that load on demand instead of shipping the whole app in one download. It matters because JavaScript is parse- and execute-expensive: a large initial bundle delays interactivity even on a fast network. Splitting by route means a user visiting the landing page never downloads the admin dashboard's code. Bundlers create a split point wherever they see a dynamic import().",
        `// this dynamic import becomes its own chunk
const loadEditor = () => import("./RichTextEditor");`
      ),
      q(
        "How do you lazy-load a component in React?",
        "React.lazy takes a function returning a dynamic import() of a module with a default export and gives you a component. You must render it inside a <Suspense> boundary that provides a fallback while the chunk loads. Route-level splitting is the highest-value place to do this.",
        `import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}`
      ),
      q(
        "What is chunking and how do you influence it?",
        "A chunk is one output file the bundler emits. Every dynamic import() is a chunk boundary; the bundler also splits out shared dependencies (vendor code) so they can be cached separately from your app code. You influence it by where you place import() calls, by webpack magic comments like /* webpackChunkName: \"editor\" */ for readable filenames, and by config (splitChunks / manualChunks) to group vendors. The goal: small initial chunk, long-lived cacheable vendor chunk, feature chunks loaded on navigation.",
        `const Editor = lazy(() =>
  import(/* webpackChunkName: "editor" */ "./Editor")
);`
      ),
      q(
        "What does Suspense do?",
        "Suspense lets a component 'suspend' — tell React it is not ready to render because it is waiting on something (a lazy chunk, or data via a Suspense-enabled source / the use() hook). React shows the nearest <Suspense fallback> until the child is ready, then swaps it in. You can nest boundaries so different regions have their own loading states, and combine it with useTransition so navigating does not flash a fallback for already-visible content.",
        `<Suspense fallback={<Spinner />}>
  <ProfileHeader userId={id} />
  <Suspense fallback={<CommentsSkeleton />}>
    <Comments userId={id} />   {/* its own boundary; header shows first */}
  </Suspense>
</Suspense>`
      ),
      q(
        "How do you avoid the downsides of lazy loading?",
        "Preload likely-next chunks on hover/focus or when the network is idle so the click feels instant. Always provide a sensible fallback (skeleton, not a spinner jump) and wrap lazy boundaries in an error boundary to handle a failed chunk load (e.g. after a deploy) with a retry. Do not over-split — dozens of tiny chunks add request overhead and waterfalls. Keep above-the-fold and shared UI in the main bundle.",
        `const Settings = lazy(() => import("./Settings"));

// preload on intent
<Link
  to="/settings"
  onMouseEnter={() => import("./Settings")}
>
  Settings
</Link>`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Virtual DOM, Reconciliation & Fiber",
    questions: [
      q(
        "What is the Virtual DOM?",
        "It is a lightweight in-memory description of the UI made of plain JS objects (React elements) that JSX compiles to. On each render React builds a new tree, compares it with the previous one, and applies only the minimal set of real DOM operations needed. The value is not 'JS objects are faster than the DOM' — it is that React batches and minimizes DOM mutations and gives you a declarative model where you describe the target UI and React figures out the transition.",
        `// JSX
<h1 className="title">Hi</h1>
// compiles to a plain object
React.createElement("h1", { className: "title" }, "Hi")
// ≈ { type: "h1", props: { className: "title", children: "Hi" } }`
      ),
      q(
        "What is reconciliation and what is the diffing algorithm?",
        "Reconciliation is the process of diffing the previous and next element trees to decide what changed. A general tree diff is O(n³); React uses O(n) heuristics: (1) different element types at the same position → destroy the old subtree and build the new one; (2) same type → keep the DOM node, update only changed attributes, recurse into children; (3) for lists, use the `key` prop to match children across renders by identity instead of by index.",
        `// type changed: <a> → <button> ⇒ old node + its subtree are thrown away
{isLink ? <a href={url}>Go</a> : <button onClick={go}>Go</button>}

// same type: only the className attribute is patched
<div className={active ? "on" : "off"}>...</div>`
      ),
      q(
        "Why are keys important and why not use the array index?",
        "Keys tell React which item is which across renders so it can move/keep/remove DOM nodes correctly instead of rebuilding them. With an index key, inserting or reordering makes every subsequent item's key point at a different item — React keeps the wrong DOM nodes, so component state (input values, focus, animations) attaches to the wrong row and you get subtle bugs. Use a stable id from the data. Index keys are acceptable only for a static list that never reorders.",
        `// ❌ prepend shifts every index → wrong rows keep wrong state
{todos.map((t, i) => <TodoRow key={i} todo={t} />)}

// ✅ identity is stable regardless of position
{todos.map((t) => <TodoRow key={t.id} todo={t} />)}`
      ),
      q(
        "What is React Fiber?",
        "Fiber is the reconciler rewrite (React 16+) that made rendering interruptible. A 'fiber' is a work unit — one per element — holding its type, props, state and pointers to parent/child/sibling. React does render work in two phases: a render/reconcile phase that builds the work-in-progress fiber tree and can be paused, resumed, or discarded, and a commit phase that applies all DOM changes synchronously. Because the render phase can yield to the browser, React can keep the main thread responsive and prioritize urgent updates — the foundation for concurrent features like useTransition and Suspense.",
        ""
      ),
      q(
        "What happens, step by step, when a component renders?",
        "(1) A trigger: initial mount, a state/context update, or a parent re-render. (2) Render phase: React calls the component function (or render()), producing a new element tree; it diffs this against the current fiber tree, marking fibers with effect flags for what changed. This phase is pure and interruptible. (3) Commit phase: React applies the marked DOM mutations, then runs layout effects (useLayoutEffect) synchronously and paints, then runs passive effects (useEffect) after paint. A render does not always touch the DOM — if the output is identical, the commit phase has nothing to do.",
        ""
      ),
      q(
        "What actually causes a component to re-render, and how do you prevent wasted renders?",
        "A component re-renders when its own state changes, when a context value it consumes changes, or when its parent re-renders (by default React re-renders the whole subtree). New prop values are a consequence of the parent rendering, not an independent trigger. To cut wasted renders: wrap pure children in React.memo, pass stable props (useCallback/useMemo or the React Compiler), colocate state so fewer components sit above the change, pass elements as children so they are not re-created by the re-rendering parent, and split hot context. Measure with the DevTools Profiler before optimizing.",
        `const Row = React.memo(function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function List({ items }) {
  // stable identity so React.memo on <Row> is effective
  const onSelect = useCallback((id) => console.log(id), []);
  return <ul>{items.map(i => <Row key={i.id} item={i} onSelect={onSelect} />)}</ul>;
}`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "SSR vs CSR (and hydration)",
    questions: [
      q(
        "What are CSR and SSR?",
        "Client-Side Rendering: the server sends a near-empty HTML shell plus a JS bundle; the browser downloads and runs it, and React builds the DOM on the client. Server-Side Rendering: the server runs React for the request and sends fully-formed HTML, then the same JS loads on the client and 'hydrates' it — attaches event listeners and takes over. Related variants: SSG (render to HTML at build time), ISR (regenerate static pages on a schedule), and streaming SSR (send HTML in chunks as it is ready).",
        ""
      ),
      q(
        "What are the concrete differences?",
        "First paint: SSR shows meaningful content on the first response; CSR shows nothing until JS executes. TTFB: CSR is usually faster to first byte (static shell) but slower to content; SSR does per-request work so TTFB is higher. SEO: SSR/SSG serve complete HTML crawlers can read immediately; CSR relies on the crawler executing JS. Server cost & complexity: SSR needs a running Node server (or edge runtime) and careful handling of request-scoped data; CSR can be a static file host / CDN. Data: SSR fetches on the server before responding; CSR fetches after mount, often causing loading spinners and layout shift.",
        ""
      ),
      q(
        "Why is SSR better for SEO and perceived performance?",
        "SEO: the crawler receives the full content, correct <title>/<meta>, and links in the initial HTML — no dependency on JS execution, no crawl-budget cost for rendering, correct social preview cards. Performance: content is visible sooner (better LCP and First Contentful Paint), and for content-heavy pages the user can read while JS loads in the background. It also centralizes data fetching (no client waterfall) and can leverage server/edge caching. The trade-off is a slower TTFB and Time To Interactive gap between 'looks ready' and 'is interactive'.",
        ""
      ),
      q(
        "What is hydration and what can go wrong?",
        "Hydration is React on the client walking the server-rendered DOM and attaching event handlers and internal state instead of re-creating nodes. It fails or warns when the client's first render does not match the server HTML — caused by rendering Date.now()/Math.random()/locale-dependent output, reading window/localStorage during render, or invalid nested HTML. The fix: render deterministic markup on both sides and move browser-only values into an effect (or use a mounted flag / suppressHydrationWarning for intentionally dynamic bits).",
        `function Clock() {
  const [now, setNow] = useState(null); // same on server + first client render
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <time>{now ? now.toLocaleTimeString() : "--:--:--"}</time>;
}`
      ),
      q(
        "How do you choose CSR vs SSR for a project?",
        "Public, content-driven, SEO-sensitive, or slow-device audiences → SSR/SSG (Next.js, Remix). Internal tools, dashboards behind auth, highly interactive app-like UIs where SEO is irrelevant → CSR is simpler and cheaper to host. Most real apps are a mix: SSR/SSG the marketing and content routes, CSR the authenticated app shell. Modern frameworks let you decide per route, and React Server Components push it further by rendering some components only on the server and shipping zero JS for them.",
        ""
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Routing & Role-Based Access Control (RBAC)",
    questions: [
      q(
        "How does client-side routing with react-router work?",
        "react-router maps URL paths to components without a full page reload. It intercepts navigation, updates the History API, and re-renders the matched route. You declare routes (nested routes render into a parent's <Outlet>), navigate with <Link>/<NavLink> or the useNavigate hook, and read the current location with useLocation. Data routers (createBrowserRouter) add loaders/actions that run before a route renders.",
        `import { createBrowserRouter, RouterProvider, Outlet, NavLink } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,       // renders <Outlet /> for children
    children: [
      { index: true, element: <Home /> },
      { path: "users/:id", element: <UserDetail /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

<RouterProvider router={router} />;`
      ),
      q(
        "How do you implement protected routes?",
        "Wrap protected routes in a guard component that checks auth/role from context or a store. If unauthenticated, redirect to login with <Navigate> and remember the attempted URL so you can return after login. If authenticated but lacking the role, render a 403 page rather than redirecting to login (the user is logged in, just not permitted). Do this at a layout route so a whole section is guarded in one place. Client guards are UX only — the server must still authorize every request.",
        `function RequireAuth({ roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.some(r => user.roles.includes(r))) {
    return <Forbidden />;
  }
  return <Outlet />;
}

// route config
{
  element: <RequireAuth roles={["admin"]} />,
  children: [{ path: "admin", element: <AdminDashboard /> }],
}`
      ),
      q(
        "How do you structure RBAC beyond route guards?",
        "Centralize permissions: derive a permission set from the user's roles once, expose it via context, and gate on permissions (not raw roles) everywhere — routes, UI affordances, and API calls. A small <Can> component or usePermission hook keeps checks declarative. Keep the role→permission map in one module so product changes are a data edit. Critically, mirror the same rules on the server; the client checks only decide what to show, never what is allowed.",
        `const PERMISSIONS = {
  admin:  ["user:read", "user:write", "billing:manage"],
  editor: ["user:read", "content:write"],
  viewer: ["user:read"],
};

function useCan(permission) {
  const { user } = useAuth();
  const granted = useMemo(
    () => new Set(user?.roles.flatMap(r => PERMISSIONS[r] ?? [])),
    [user]
  );
  return granted.has(permission);
}

function Can({ perform, children }) {
  return useCan(perform) ? children : null;
}

<Can perform="billing:manage"><BillingButton /></Can>`
      ),
      q(
        "How do you handle query params?",
        "Use useSearchParams — it reads and writes the URL query string and re-renders on change, so the URL stays the source of truth for filters, pagination, sort, and tab state. That makes views shareable and back/forward-friendly. Keep params minimal and serializable; debounce writes for text inputs; use replace to avoid stacking history entries for transient changes.",
        `import { useSearchParams } from "react-router-dom";

function ProductList() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? 1);
  const sort = params.get("sort") ?? "name";

  const setPage = (p) =>
    setParams(prev => {
      prev.set("page", String(p));
      return prev;
    });

  return <Pagination page={page} onChange={setPage} sort={sort} />;
}`
      ),
      q(
        "How does dynamic routing work?",
        "Dynamic segments (path=\"users/:id\") match any value and expose it via useParams. Use them for detail pages, nested resources (/projects/:projectId/tasks/:taskId), and optional segments. With data routers, a loader reads params, fetches before render, and can throw a redirect or a 404 Response. For fully data-driven route trees (e.g. CMS pages), generate the route config from data or use a catch-all (path=\"*\") that resolves the slug at runtime.",
        `function loader({ params }) {
  return fetch(\`/api/users/\${params.id}\`).then(r => {
    if (r.status === 404) throw new Response("Not Found", { status: 404 });
    return r.json();
  });
}

function UserDetail() {
  const user = useLoaderData();
  const { id } = useParams();
  return <h1>{user.name} (#{id})</h1>;
}`
      ),
      q(
        "How do you code-split and lazy-load routes?",
        "Pair routing with React.lazy so each route's code is its own chunk, loaded on navigation. With data routers, use the route's lazy property to load the route module (component + loader) together. Wrap the router output (or each boundary) in <Suspense> and an error boundary, and preload a route's chunk on link hover for instant transitions.",
        `const router = createBrowserRouter([
  {
    path: "reports",
    lazy: () => import("./routes/reports"), // exports { Component, loader }
  },
]);`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Testing (React Testing Library)",
    questions: [
      q(
        "What is React Testing Library and what is its philosophy?",
        "RTL renders components into a real DOM (via jsdom or a browser) and gives you queries to interact with them the way a user would — find by visible text, label, or role; click; type — rather than by inspecting component internals. The guiding principle: 'the more your tests resemble the way your software is used, the more confidence they give you.' You do not test state or lifecycle directly; you assert on what the user sees and can do. It pairs with Jest or Vitest as the test runner and jest-dom for DOM matchers.",
        ""
      ),
      q(
        "Write a unit test for a component.",
        "Query by accessible role/label, drive interaction with userEvent, and assert on rendered output. Prefer findBy* (async) for anything that appears after an effect or promise.",
        `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

test("increments when the button is clicked", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  expect(screen.getByText("Count: 0")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /increment/i }));

  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});`
      ),
      q(
        "How do you test asynchronous behavior and API calls?",
        "Mock the network at the boundary — Mock Service Worker (MSW) is the standard: it intercepts real fetch/XHR so the component code is unchanged. Render, then await findBy* or waitFor for the resolved UI. Test the loading state, the success state, and the error state. Avoid mocking your own modules deeply; mock the HTTP layer and let the component run for real.",
        `import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/user/1", () => HttpResponse.json({ name: "Ada" }))
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("shows the user name after loading", async () => {
  render(<UserCard id={1} />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(await screen.findByText("Ada")).toBeInTheDocument();
});`
      ),
      q(
        "What makes a component testable, and what is the interview hack around it?",
        "Testable components have logic separated from rendering (custom hooks, pure helper functions), depend on injected data/callbacks rather than reaching into globals, expose accessible roles/labels so queries are stable, and keep side effects at the edges. The interview move: when you describe a solution, say 'I'd extract this into a hook so it's unit-testable' and then actually sketch a test — naming the cases (happy path, empty, error, boundary) signals senior thinking even in a whiteboard setting.",
        `// hard to test: fetch + parsing + rendering all tangled
// easy to test: pure logic extracted
export function summarize(orders) {
  return {
    total: orders.reduce((s, o) => s + o.amount, 0),
    count: orders.length,
  };
}

test("summarize handles an empty list", () => {
  expect(summarize([])).toEqual({ total: 0, count: 0 });
});`
      ),
      q(
        "What should you test, and what should you avoid testing?",
        "Test: user-visible behavior, conditional rendering, form validation and submission, error and empty states, and integration between a few components. Avoid: implementation details (state variable names, whether useMemo ran), exact markup/snapshots of large trees (brittle), third-party libraries, and styling. A useful split: many fast unit tests on hooks/utilities, a moderate number of component/integration tests with RTL, and a few end-to-end tests (Playwright/Cypress) for critical flows.",
        ""
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Async Tasks — API calls, events, promises, timers",
    questions: [
      q(
        "How do you make API calls in React the right way?",
        "For anything beyond a trivial app, use a data-fetching library (React Query, SWR, RTK Query): it handles caching, deduplication, background refetch, retries, and stale-while-revalidate, and removes most manual useEffect fetching. If doing it by hand, fetch in an effect keyed by the inputs, model state as idle/loading/success/error explicitly, cancel stale requests with AbortController, and never set state after unmount. Do not fetch in render.",
        `function useUser(id) {
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading", data: null, error: null });
    fetch(\`/api/users/\${id}\`, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => setState({ status: "success", data, error: null }))
      .catch(err => {
        if (err.name !== "AbortError")
          setState({ status: "error", data: null, error: err });
      });
    return () => ctrl.abort();
  }, [id]);

  return state;
}`
      ),
      q(
        "useEffect in depth — timing, dependencies, and cleanup.",
        "Effects run after the browser paints (useLayoutEffect runs before paint, synchronously — use it only for measuring/mutating layout to avoid flicker). Before each re-run and on unmount, React runs the previous effect's cleanup. The dependency array must list every reactive value the effect reads; lying to the linter causes stale closures. In development, StrictMode intentionally mounts, unmounts, and remounts once to surface missing cleanup — production runs it once. If you find yourself syncing state to state with an effect, you probably want derived state or an event handler instead.",
        `useEffect(() => {
  const handler = (e) => console.log(query, e.key); // captures THIS render's query
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler); // remove the exact fn
}, [query]); // re-subscribe when query changes so the closure is fresh`
      ),
      q(
        "How do events work in React (synthetic events, delegation, batching)?",
        "React wraps native events in a SyntheticEvent for a consistent cross-browser API and (React 17+) attaches listeners at the root container rather than each node. Handlers are just props (onClick={fn}) — no addEventListener. State updates inside handlers are batched into one re-render (React 18 batches in async callbacks too). For events React does not model, or listeners on window/document, use useEffect + addEventListener with cleanup. e.stopPropagation() and e.preventDefault() work as expected.",
        `function Toggle() {
  const [on, setOn] = useState(false);
  const [count, setCount] = useState(0);
  function handleClick() {
    setOn(o => !o);         // both updates → a single re-render
    setCount(c => c + 1);
  }
  return <button onClick={handleClick}>{on ? "On" : "Off"} ({count})</button>;
}`
      ),
      q(
        "Explain Promises and async/await as used in components.",
        "A Promise represents a future value: pending → fulfilled or rejected. async/await is syntax over Promises; await pauses the async function until the Promise settles and throws on rejection, so you use try/catch. In React you cannot make a component function async (render must be sync), so async work lives in effects, event handlers, or (with Suspense) is read via use(). Use Promise.all for parallel independent requests, Promise.allSettled when you want every result regardless of failures, and Promise.race for timeouts.",
        `async function loadDashboard(userId) {
  try {
    const [profile, orders, notifications] = await Promise.all([
      fetch(\`/api/users/\${userId}\`).then(r => r.json()),
      fetch(\`/api/users/\${userId}/orders\`).then(r => r.json()),
      fetch(\`/api/users/\${userId}/notifications\`).then(r => r.json()),
    ]);
    return { profile, orders, notifications };
  } catch (err) {
    reportError(err);
    throw err;
  }
}`
      ),
      q(
        "How do setTimeout / setInterval behave in React, and what are the pitfalls?",
        "They are browser APIs, unaffected by renders — but the callback closes over the render where it was created, so it sees stale state unless you use a functional updater or a ref. Always store the timer id and clear it in cleanup, or you leak timers and get duplicate intervals after re-renders (and StrictMode double-invoke). For a self-adjusting interval, the robust pattern is a useInterval hook that keeps the latest callback in a ref.",
        `function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// always fires with fresh values, cleans up correctly
useInterval(() => setCount(c => c + 1), isRunning ? 1000 : null);`
      ),
      q(
        "How do you prevent race conditions from out-of-order responses?",
        "When inputs change fast (typeahead, tab switches), an earlier request can resolve after a later one and overwrite fresh data with stale data. Fixes: AbortController to cancel the previous request, an 'ignore' flag captured in the effect closure that the cleanup flips, or a request-id/sequence check so you only commit the latest. Data-fetching libraries handle this for you.",
        `useEffect(() => {
  let active = true;
  fetchResults(query).then(data => {
    if (active) setResults(data); // ignore if a newer effect has superseded this
  });
  return () => { active = false; };
}, [query]);`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Coding Practices — reusability, readability, modularity, testability",
    questions: [
      q(
        "How do you make a component reusable without over-abstracting?",
        "Design a small, predictable prop API; accept children and 'slot' props for content you cannot predict; expose behavior through callbacks, not internal state; keep styling overridable (className/style or a variant prop) but opinionated by default; and bake accessibility in. Crucially, wait for the third real use case before generalizing — premature abstraction produces components with fifteen boolean props that are harder to use than duplication. Composition beats configuration.",
        `// configuration hell
<Card hasHeader hasFooter headerBold footerMuted padded bordered />

// composition: flexible, obvious, no prop explosion
<Card>
  <Card.Header>Invoices</Card.Header>
  <Card.Body><InvoiceTable /></Card.Body>
  <Card.Footer><Pagination /></Card.Footer>
</Card>`
      ),
      q(
        "What makes React code readable?",
        "Components that do one thing and are named for it; early returns for loading/error/empty instead of deep ternary nesting in JSX; derived values computed above the return, not inline; extracting a sub-tree into a named component once it needs a comment to explain it; consistent file structure; and handlers named for intent (handleSubmit, not onClick2). If a component is longer than roughly a screen, that is a prompt to split by responsibility.",
        `function Profile({ id }) {
  const { data: user, status } = useUser(id);

  if (status === "loading") return <ProfileSkeleton />;
  if (status === "error")   return <ErrorState onRetry={/* ... */} />;
  if (!user)                return <EmptyState />;

  return <ProfileCard user={user} />; // the happy path reads cleanly
}`
      ),
      q(
        "How do you keep a React codebase modular?",
        "Organize by feature/domain, not by file type — a feature folder owns its components, hooks, api, and tests. Enforce a dependency direction: shared/ui and lib are leaf modules; features depend on them, not on each other; app wiring sits on top. Keep public surface explicit via an index barrel per feature. Push side effects (network, storage, analytics) into a thin adapter layer so the UI depends on interfaces, not implementations. This keeps changes local and makes features deletable.",
        `src/
  features/
    checkout/
      components/  hooks/  api/  checkout.test.tsx  index.ts
    catalog/
      ...
  shared/
    ui/           # Button, Modal, Input — no feature imports
    lib/          # formatMoney, http client
  app/            # routes, providers, store wiring`
      ),
      q(
        "How do you design for testability from the start?",
        "Separate the 'what' from the 'how': pure functions for calculations, custom hooks for stateful logic, thin components for rendering. Inject dependencies (pass the api client / clock / callbacks as props or via context) so tests can substitute them. Render accessible markup so queries are stable. Keep components deterministic given their props. The payoff: most logic is covered by fast unit tests, and component tests stay small. In interviews, explicitly call this out and enumerate the test cases you would write.",
        `// clock injected → test can pass a fixed time, no fake timers needed
function useCountdown(targetDate, now = () => Date.now()) {
  const [remaining, setRemaining] = useState(() => targetDate - now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(targetDate - now()), 1000);
    return () => clearInterval(id);
  }, [targetDate, now]);
  return Math.max(0, remaining);
}`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Performance — rendering, bundles, assets, delivery",
    questions: [
      q(
        "What is your process for diagnosing a slow React app?",
        "Measure before changing anything. Use the React DevTools Profiler to find which components render, how often, and why (the 'why did this render' data). Use the browser Performance panel and Lighthouse for main-thread work, long tasks, and Core Web Vitals (LCP, INP, CLS). Check the bundle with a visualizer (source-map-explorer, webpack-bundle-analyzer). Then fix the largest measured cause first — usually one of: oversized bundle, an unvirtualized list, a re-render storm, or a network waterfall.",
        ""
      ),
      q(
        "How do you reduce unnecessary re-renders?",
        "Colocate state so the update happens low in the tree; pass JSX as children so a re-rendering parent does not re-create it; React.memo pure leaf components that get stable props; stabilize callbacks/objects with useCallback/useMemo (or adopt the React Compiler, which does this automatically); split hot contexts; and use useTransition / useDeferredValue to keep input responsive while expensive subtrees update at low priority.",
        `// children passed in are NOT re-created when <Parent> re-renders
function Parent({ children }) {
  const [n, setN] = useState(0);
  return <><button onClick={() => setN(n + 1)}>{n}</button>{children}</>;
}
<Parent><ExpensiveTree /></Parent> // ExpensiveTree renders once`
      ),
      q(
        "How do you optimize the JavaScript and CSS you ship?",
        "JS: route-based code splitting, tree-shaking (ES modules, no side-effectful barrel imports), swap heavy deps for lighter ones (date-fns/dayjs over moment), lazy-load below-the-fold widgets, and keep a stable vendor chunk for caching. Minify and compress with Brotli. CSS: ship only what is used (Tailwind's purge / CSS Modules / critical CSS inlined), avoid large unused component-library CSS, and load non-critical styles async. Set long-lived cache headers on content-hashed filenames.",
        `// dynamic import keeps a 300KB charting lib out of the initial bundle
const Charts = lazy(() => import(/* webpackChunkName: "charts" */ "./Charts"));`
      ),
      q(
        "How do you optimize assets (images, fonts, media)?",
        "Images: modern formats (AVIF/WebP), responsive srcset/sizes, explicit width/height or aspect-ratio to prevent layout shift, lazy-load off-screen images (loading=\"lazy\"), and use a framework image component or a CDN that resizes on the fly. Fonts: subset, self-host or preconnect, use font-display: swap, and preload the one font used above the fold. Serve everything gzip/Brotli-compressed with content hashing for immutable caching.",
        `<img
  src="/hero-800.avif"
  srcSet="/hero-400.avif 400w, /hero-800.avif 800w, /hero-1600.avif 1600w"
  sizes="(max-width: 600px) 100vw, 800px"
  width="800" height="450"
  alt="Team collaborating at a whiteboard"
  loading="eager" fetchpriority="high"
/>`
      ),
      q(
        "What is the role of the bundler and the CDN in performance?",
        "The bundler (Vite/webpack/esbuild/Turbopack) decides module graph, chunking, tree-shaking, minification, asset hashing, and dev/prod builds — most shipping-less-code wins are bundler configuration. The CDN puts static assets physically close to users, serves them with HTTP/2-3 and compression, and caches immutable hashed files at the edge so repeat visits and other users pay near-zero latency. Together: bundler makes files small and cacheable; CDN delivers them fast. Add server/edge caching (SSR output, API responses) on top.",
        ""
      ),
      q(
        "How do you handle a list of tens of thousands of rows?",
        "Do not render them all. Virtualize so only the visible window plus a small overscan is in the DOM (react-window / react-virtual / TanStack Virtual). Push filtering, sorting, and pagination to the server where possible. Give rows stable keys, memoize the row component, and keep row height predictable. For heavy per-row computation, precompute or move it to a Web Worker. Debounce search input and cancel stale requests.",
        `import { FixedSizeList } from "react-window";

<FixedSizeList height={600} itemCount={rows.length} itemSize={40} width="100%">
  {({ index, style }) => (
    <div style={style}>{rows[index].name}</div>
  )}
</FixedSizeList>`
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Styling — Tailwind, CSS-in-JS, component libraries, CSS/SCSS",
    questions: [
      q(
        "What are the main styling approaches for a React app and their trade-offs?",
        "Plain CSS / SCSS with CSS Modules: zero runtime, scoped class names, full CSS power; you manage the design system yourself. Utility-first (Tailwind): fast to build, consistent scale, tiny production CSS after purge, styles co-located with markup; verbose className strings and a learning curve. CSS-in-JS (styled-components/Emotion): dynamic styling from props, colocation, theming; runtime cost and SSR setup, and the ecosystem is shifting toward zero-runtime. Compile-time CSS-in-JS (StyleX, vanilla-extract, Linaria): type-safe, colocated, but compiled to static CSS with no runtime. Component libraries (MUI, Ant, Chakra): accessible components out of the box, fastest to a working UI; heavier bundle and a distinctive look to override.",
        ""
      ),
      q(
        "When would you choose Tailwind, and how do you keep it maintainable?",
        "Choose Tailwind for product UIs where you want velocity and a consistent spacing/color scale without inventing a CSS architecture, and where the team is comfortable with utilities in markup. Keep it maintainable by: driving the scale from tailwind.config (tokens, not arbitrary values), extracting repeated clusters into components (not @apply-heavy CSS), using a class-merge helper (clsx / tailwind-merge) for conditional and override-safe classes, and enabling the Prettier plugin to keep class order consistent. Production CSS stays small because unused utilities are removed at build time.",
        `import clsx from "clsx";

function Button({ variant = "primary", className, ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "ghost" && "bg-transparent text-blue-600 hover:bg-blue-50",
        className
      )}
      {...props}
    />
  );
}`
      ),
      q(
        "What is StyleX and how does it differ from styled-components?",
        "StyleX (from Meta) is a compile-time styling library: you author styles as typed JS objects and a build step compiles them to atomic CSS classes with deterministic specificity. Unlike styled-components/Emotion there is no runtime style injection, so no per-render cost and no SSR hydration of styles. Merging is predictable — the last style applied wins regardless of source order, which fixes the specificity fights common in large CSS-in-JS codebases. It trades some dynamic flexibility for performance and scalability; vanilla-extract occupies a similar niche.",
        `import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  base:    { padding: 12, borderRadius: 8, fontSize: 14 },
  primary: { backgroundColor: "#2563eb", color: "white" },
});

function Button({ primary, ...props }) {
  return <button {...stylex.props(styles.base, primary && styles.primary)} {...props} />;
}`
      ),
      q(
        "When do component libraries like MUI, Ant Design, or Bootstrap make sense — and what are the costs?",
        "They make sense for internal tools, admin dashboards, and MVPs where time-to-UI matters more than a bespoke look, and where you value ready-made accessible components (dialogs, comboboxes, date pickers) that are genuinely hard to build well. Ant Design is dense and enterprise-oriented; MUI implements Material Design with a strong theming system; Bootstrap is simple and ubiquitous but dated. Costs: bundle weight, a recognizable default aesthetic you must theme away, override friction when designs diverge, and coupling to the library's release cadence. A common compromise is a headless library (Radix, React Aria, Headless UI) for behavior + your own styles.",
        ""
      ),
      q(
        "How do you build a design system / theming layer regardless of the styling tool?",
        "Define design tokens once — colors, spacing scale, typography, radii, shadows, z-index, breakpoints — as the single source of truth (CSS custom properties, a Tailwind config, or a typed theme object). Build primitives (Button, Input, Stack, Text) on those tokens; build features on primitives. Support light/dark by swapping token values, not rewriting components. CSS custom properties are the most portable mechanism: they work with plain CSS, SCSS, Tailwind (via arbitrary values), and CSS-in-JS, and they enable runtime theme switching with no re-render.",
        `:root {
  --color-bg: #ffffff;
  --color-text: #142033;
  --space-2: 8px;
  --radius-md: 10px;
}
:root[data-theme="dark"] {
  --color-bg: #080d18;
  --color-text: #edf3ff;
}
.card {
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--space-2);
  border-radius: var(--radius-md);
}`
      ),
      q(
        "What still requires real CSS/SCSS knowledge even when using a framework?",
        "Layout with Flexbox and Grid; the cascade, specificity, and inheritance; stacking contexts and z-index; container queries and media queries; logical properties for i18n; transitions, transforms, and keyframe animations; and modern features like :has(), clamp(), and aspect-ratio. Utility and component libraries are abstractions over these — when something does not lay out or paint as expected, you debug at the CSS level. SCSS adds nesting, variables (largely superseded by custom properties), mixins, and partials, useful for organizing hand-written stylesheets.",
        ""
      ),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Accessibility (a11y)",
    questions: [
      q(
        "What is web accessibility and why should a frontend engineer own it?",
        "Accessibility means people with disabilities — visual, motor, auditory, cognitive — can perceive, operate, and understand your UI, typically using assistive technology like screen readers, switch devices, or magnification. WCAG 2.2 at level AA is the common target and is a legal requirement in many jurisdictions. It is a frontend concern because it is created and broken in markup, focus management, and interaction code. It also overlaps heavily with good engineering: semantic HTML, keyboard support, and clear state are better for everyone, including SEO and testability.",
        ""
      ),
      q(
        "How does semantic HTML improve accessibility? Give examples.",
        "Native elements come with roles, states, keyboard behavior, and focus management that assistive tech understands for free. A <button> is focusable, announces as a button, and fires on Enter/Space; a <div onClick> does none of that. Use landmarks (<header>, <nav>, <main>, <footer>) so screen-reader users can jump between regions; one <h1> per page and a logical heading order for navigation; <label> tied to inputs; <ul>/<ol> for lists; <table> with <th scope> for data. Reserve ARIA for gaps native HTML cannot fill.",
        `// ❌ not focusable, no keyboard, announced as plain text
<div className="btn" onClick={save}>Save</div>

// ✅ free focus, keyboard, and role
<button type="button" onClick={save}>Save</button>

// page structure screen readers can navigate
<header>…</header>
<nav aria-label="Primary">…</nav>
<main>
  <h1>Orders</h1>
  …
</main>`
      ),
      q(
        "When and how do you use ARIA correctly?",
        "First rule of ARIA: don't use ARIA if a native element works. Use it to (1) label things that have no visible text (aria-label, aria-labelledby), (2) describe extra context (aria-describedby), (3) expose state on custom widgets (aria-expanded, aria-selected, aria-checked, aria-current), and (4) announce dynamic changes via live regions (aria-live=\"polite\" for status, \"assertive\" for errors). Do not put interactive roles on non-focusable elements, and keep ARIA state in sync with your React state — a stale aria-expanded is worse than none.",
        `function Disclosure({ label, children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        {label}
      </button>
      <div id={id} hidden={!open}>{children}</div>
    </>
  );
}

// announce async results to screen readers
<p aria-live="polite">{status === "saved" ? "Changes saved" : ""}</p>`
      ),
      q(
        "How do you handle keyboard navigation and focus management in React?",
        "Everything actionable must be reachable and operable with Tab / Shift+Tab / Enter / Space / Arrow keys, with a visible focus indicator (never outline: none without a replacement). Keep DOM order matching visual order; avoid positive tabindex. For dialogs and menus: move focus into the component on open, trap focus while it is open, restore focus to the trigger on close, and close on Escape. Use tabIndex={-1} + ref.focus() to move focus programmatically (e.g. to an error summary or a newly revealed region). Follow the WAI-ARIA Authoring Practices for widget key patterns.",
        `function Modal({ onClose, children }) {
  const ref = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus(); // restore focus on close
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" tabIndex={-1} ref={ref}>
      {children}
    </div>
  );
}`
      ),
      q(
        "How do you make forms accessible?",
        "Every field needs a programmatically associated <label> (htmlFor/id) — placeholders are not labels. Group related fields with <fieldset>/<legend> (radio groups, address blocks). Mark required fields in text, not color alone. On validation error: set aria-invalid, link the message with aria-describedby, move focus to the first invalid field or a summary, and announce it. Do not disable the submit button as the only feedback. Keep error text specific ('Enter a valid email', not 'Invalid').",
        `<div>
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    type="email"
    required
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && <p id="email-error" role="alert">{error}</p>}
</div>`
      ),
      q(
        "How do you handle images, icons, color, and motion accessibly?",
        "Images: meaningful ones need descriptive alt text; decorative ones get alt=\"\" (or role=\"presentation\") so screen readers skip them; complex charts need a longer text alternative nearby. Icon-only buttons need an aria-label. Color: never the sole carrier of meaning (pair with text or an icon), and maintain contrast ratios — 4.5:1 for body text, 3:1 for large text and UI components. Motion: respect prefers-reduced-motion by disabling non-essential animation and parallax.",
        `<button aria-label="Delete item"><TrashIcon aria-hidden="true" /></button>

<img src="/logo.svg" alt="" />           {/* decorative */}
<img src="/chart.png" alt="Revenue rose 20% from Q1 to Q2" />

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}`
      ),
      q(
        "How do you test accessibility?",
        "Automated tooling catches ~30–40%: eslint-plugin-jsx-a11y in the editor, jest-axe / @axe-core/react in component tests, and Lighthouse or axe DevTools on pages. The rest needs manual checks: navigate the whole flow with the keyboard only, run a screen reader (VoiceOver, NVDA) through key tasks, zoom to 200–400%, and verify with prefers-reduced-motion and forced-colors. Bake the automated checks into CI and the manual pass into QA for critical flows.",
        `import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

test("SignupForm has no automatically detectable a11y violations", async () => {
  const { container } = render(<SignupForm />);
  expect(await axe(container)).toHaveNoViolations();
});`
      ),
    ],
  },
];

export default sections;
