
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { Header } from "./components/Layout/Header";
import { TabNavigation } from "./components/Layout/TabNavigation";
import { ThreadFeed } from "./components/Feed/ThreadFeed";
import { DraftFeed } from "./components/Feed/DraftFeed";
import { ThreadDetail } from "./components/Threads/ThreadDetail";
import { CreateThread } from "./components/Threads/CreateThread";
import { AuthForm } from "./components/Auth/AuthForm";
import { AnalyticsCharts } from "./components/Analytics/AnalyticsCharts";
import Collections from "./pages/Collections";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <TabNavigation />
            <Routes>
              <Route path="/" element={<ThreadFeed />} />
              <Route path="/drafts" element={<DraftFeed />} />
              <Route path="/thread/:id" element={<ThreadDetail />} />
              <Route path="/create" element={<CreateThread />} />
              <Route path="/login" element={<AuthForm mode="login" />} />
              <Route path="/register" element={<AuthForm mode="register" />} />
              <Route path="/analytics" element={<div className="max-w-7xl mx-auto px-4 py-8"><AnalyticsCharts /></div>} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
