import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Mining from "./pages/Mining";
import Spin from "./pages/Spin";
import Tasks from "./pages/Tasks";
import Referral from "./pages/Referral";
import Rewards from "./pages/Rewards";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mining" element={<Mining />} />
        <Route path="/spin" element={<Spin />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  </TooltipProvider>
);

export default App;
