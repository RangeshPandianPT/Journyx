import { QueryClient } from "@tanstack/react-query";
import { createRouter, createHashHistory } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const isNative = typeof window !== "undefined" && (Capacitor.isNativePlatform() || window.location.protocol === "file:");

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Disable scrollRestoration on native — it conflicts with hash history
    // in Capacitor WebView and can cause the app to freeze/stop responding.
    ...(isNative ? {} : { scrollRestoration: true }),
    defaultPreloadStaleTime: 0,
    ...(isNative ? { history: createHashHistory() } : {}),
  });

  return router;
};

