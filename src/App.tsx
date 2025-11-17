import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { ThemeProvider } from "@/components/theme-provider";
import { AccountProvider, useAccount } from "@/context/AccountContext";
import Accounts from "./pages/Accounts";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Charts from "./pages/Charts";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Journal from "./pages/Journal";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { VerifyEmail } from '@/pages/VerifyEmail';
import { VerifyEmailInstructions } from '@/pages/VerifyEmailInstructions';
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

// Dashboard Layout
const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accounts, selectedAccount, isLoading } = useAccount();

  useEffect(() => {
    if (isLoading) return;
    const onAccountsPage = location.pathname === '/accounts';
    const exemptRoutes = ['/charts', '/settings'];
    const isExempt = exemptRoutes.includes(location.pathname);

    if (isExempt) return;

    if (!accounts.length && !onAccountsPage) {
      navigate('/accounts', { replace: true });
      return;
    }

    if (accounts.length && !selectedAccount && !onAccountsPage) {
      navigate('/accounts', { replace: true });
    }
  }, [accounts.length, isLoading, location.pathname, navigate, selectedAccount]);

  // Show loading state while accounts are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavigation />
          <main className="flex-1 overflow-auto mobile-container section-padding">
            <div className="content-spacing max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Standalone Layout (no sidebar/nav)
const StandaloneLayout = () => (
  <div className="min-h-screen w-screen flex items-center justify-center">
    <Outlet />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccountProvider>
      <ThemeProvider defaultTheme="dark" storageKey="tradejournal-ui-theme">
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
            {/* Charts page with full screen layout */}
            <Route path="/charts" element={<Charts />} />
            
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AccountProvider>
  </QueryClientProvider>
);

export default App;
