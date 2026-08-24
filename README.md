# Frontend Interview Handbook

A static Vite + React + Material UI app for browsing a large frontend engineering interview question bank — JavaScript, React (including React 18/19 features), Redux, browsers, Node.js, Next.js, API/security, architecture, performance, and more.

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

Then open the local Vite URL.

## Production build

```bash
npm run build
npm run preview
```

The source handbook content is stored in `src/data/handbook.json`.
