import { Providers } from "./providers.jsx";

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%236ea8ff'/%3E%3Cstop offset='1' stop-color='%238b7cff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='22' fill='url(%23g)'/%3E%3Ctext x='50' y='66' font-family='Arial,sans-serif' font-weight='800' font-size='42' fill='white' text-anchor='middle'%3EAG%3C/text%3E%3C/svg%3E";

export const metadata = {
  title: "Frontend Interview Handbook",
  description:
    "Frontend Interview Handbook — a searchable guide covering JavaScript, React, system design, and more for frontend engineering interviews.",
  icons: { icon: favicon },
  openGraph: {
    title: "Frontend Interview Handbook",
    description:
      "A searchable, bookmarkable guide covering JavaScript, React, system design, and more for frontend engineering interviews.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#f5f7fb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
