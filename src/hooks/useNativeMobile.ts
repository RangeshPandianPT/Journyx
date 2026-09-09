import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { useRouter } from "@tanstack/react-router";

export function useNativeMobile() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Initialize Status Bar
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#ffffff" }).catch(() => {});

    // 2. Hide Splash Screen after app load
    SplashScreen.hide().catch(() => {});

    // 3. Handle Android Native Back Button
    const backButtonListener = App.addListener("backButton", ({ canGoBack }) => {
      const currentPath = window.location.pathname + window.location.hash;

      if (canGoBack && currentPath !== "/" && currentPath !== "/#/") {
        // Use router's history so TanStack Router state stays in sync
        router.history.back();
      } else if (currentPath !== "/" && currentPath !== "/#/") {
        router.navigate({ to: "/" });
      } else {
        App.exitApp();
      }
    });

    return () => {
      backButtonListener.then((handler) => handler.remove()).catch(() => {});
    };
  }, [router]);
}
