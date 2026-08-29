"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

export function Providers({ children }) {
  return <AppRouterCacheProvider options={{ key: "mui" }}>{children}</AppRouterCacheProvider>;
}
