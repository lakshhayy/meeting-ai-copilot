import { Switch, Route } from "wouter";
import { ClerkProvider } from "@clerk/clerk-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import CreateWorkspace from "@/pages/CreateWorkspace";
import WorkspaceDetail from "@/pages/WorkspaceDetail";
import NotFound from "@/pages/not-found";

// Components
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Fallback key for development if env var is missing
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_ZHVtbXkua2V5LmNsZXJrLmFjY291bnRzLmRldiQ";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/create-workspace">
        <ProtectedRoute>
          <CreateWorkspace />
        </ProtectedRoute>
      </Route>
      
      <Route path="/workspace/:slug">
        <ProtectedRoute>
          <WorkspaceDetail />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
