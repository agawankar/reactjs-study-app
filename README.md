# Frontend Interview Handbook

A statically-exported Next.js + Material UI app for browsing a large frontend engineering interview question bank — JavaScript, React (including React 18/19 features), Redux, browsers, Node.js, Next.js, API/security, architecture, performance, and more.

## Features
- Part/section navigation with a responsive drawer (permanent on desktop, slide-in on mobile)
- Question and answer accordion, with source code examples where relevant
- Full-text search within the selected section
- Dark/light theme
- No backend or API required — all content is static JSON

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000/reactjs-study-app/

## Production build

```bash
npm run build
npx serve out
```

`npm run build` produces a static export in `out/` (matching the GitHub Pages deployment).

The source handbook content is stored in `app/data/handbook.json`.
