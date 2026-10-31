import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Materials from "./pages/Materials";
import NotFound from "./pages/NotFound";
import PublicationRecord from "./pages/PublicationRecord";
import Publications from "./pages/Publications";
import ReadingProgress from "./components/ReadingProgress";
import ShareButton from "./components/ShareButton";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/publications/"} component={Publications} />
      <Route path={"/publications/the-missing-meter/"} component={PublicationRecord} />
      <Route path={"/materials/"} component={Materials} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <ReadingProgress />
          <ShareButton />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
