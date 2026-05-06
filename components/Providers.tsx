"use client";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { getAccessToken } from "@/lib/api";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function StoreHydrator({ children }: { children: React.ReactNode }) {
  const { loadProfile, loadIntelligence, loadStats, syncAll } = useStore();

  useEffect(() => {
    if (!getAccessToken()) return;

    // Initial load
    loadProfile().then(() => {
      loadIntelligence();
      loadStats();
    });

    // Re-sync every 30s to pick up pipeline results from assessment
    // (handles the case where user just finished assessment and pipeline is still running)
    const interval = setInterval(() => {
      if (!getAccessToken()) return;
      syncAll();
    }, 30000);

    // Also re-sync after 5s (catches quick pipeline completions)
    const quick = setTimeout(() => {
      if (getAccessToken()) loadProfile();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(quick);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <StoreHydrator>{children}</StoreHydrator>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
