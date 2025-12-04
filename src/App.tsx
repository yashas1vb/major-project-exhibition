import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Workspaces from "./pages/Workspaces";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import EditorView from "./pages/EditorView";
import OnlineEditor from "./pages/OnlineEditor";
import CodeRoom from "./pages/CodeRoom";
import Whiteboard from "./pages/Whiteboard";
import WhiteboardRoom from "./pages/WhiteboardRoom";
import NotFound from "./pages/NotFound";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthSuccess from "./pages/AuthSuccess";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => {
  const { checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/editor" element={<OnlineEditor />} />
            <Route path="/room" element={<CodeRoom />} />
            <Route path="/room/:roomId" element={<CodeRoom />} />
            <Route path="/whiteboard" element={<Whiteboard />} />
            <Route path="/whiteboard/room" element={<WhiteboardRoom />} />
            <Route path="/whiteboard/room/:roomId" element={<WhiteboardRoom />} />
            <Route path="/workspaces" element={<Workspaces />} />
            <Route path="/workspaces/:workspaceId" element={<WorkspaceDetail />} />
            <Route path="/workspaces/:workspaceId/files/:fileId" element={<EditorView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
};

export default App;
