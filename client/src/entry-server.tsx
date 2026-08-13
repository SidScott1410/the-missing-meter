// entry-server.tsx — SSR entry point for prerender
// Uses wouter's ssrPath prop so the router doesn't need window.location.
// @ts-nocheck — this file is only used by the prerender build script, not the app
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

export function render() {
  return renderToString(
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router ssrPath="/">
            <Home />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
