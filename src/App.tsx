import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Journal from "./pages/Journal";
import Import from "./pages/Import";
import NotFound from "./pages/NotFound";
import { VerifyEmail } from '@/pages/VerifyEmail';
import { VerifyEmailInstructions } from '@/pages/VerifyEmailInstructions';
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

// Dashboard Layout
const AppLayout = () => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <TopNavigation />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  </SidebarProvider>
);

// Standalone Layout (no sidebar/nav)
const StandaloneLayout = () => (
  <div className="min-h-screen w-screen bg-background dark:bg-background-dark flex items-center justify-center">
    <Outlet />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Page */}
          <Route element={<StandaloneLayout />}>
            <Route path="/" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email-instructions" element={<VerifyEmailInstructions />} />
          </Route>

          {/* Protected Dashboard Pages */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/import" element={<Import />} />
              <Route path="/accounts" element={
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Accounts</h1>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              } />
              <Route path="/strategies" element={
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Strategies</h1>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              } />
              <Route path="/settings" element={
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              } />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
