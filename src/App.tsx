import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

// App Layout for authenticated pages
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <TopNavigation />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/trades" element={<AppLayout><Trades /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/calendar" element={<AppLayout><Calendar /></AppLayout>} />
          <Route path="/journal" element={<AppLayout><Journal /></AppLayout>} />
          <Route path="/import" element={<AppLayout><Import /></AppLayout>} />
          <Route path="/accounts" element={<AppLayout><div className="p-6"><h1 className="text-3xl font-bold">Accounts</h1><p className="text-muted-foreground">Coming soon...</p></div></AppLayout>} />
          <Route path="/strategies" element={<AppLayout><div className="p-6"><h1 className="text-3xl font-bold">Strategies</h1><p className="text-muted-foreground">Coming soon...</p></div></AppLayout>} />
          <Route path="/settings" element={<AppLayout><div className="p-6"><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground">Coming soon...</p></div></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
