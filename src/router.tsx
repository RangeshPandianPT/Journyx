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
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    history: isNative ? createHashHistory() : undefined,
  });

  return router;
};

