import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DeviceDetail from "./pages/DeviceDetail";
import NotFound from "./pages/NotFound";
import GeofencingConfigPage from "./pages/GeofencingConfigPage";
import SettingsPage from "./pages/Settings";
import TrackPage from "./pages/TrackPage";
import DeliveryPage from "./pages/DeliveryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/deliveries" element={<DeliveryPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/geofencing-settings" element={<GeofencingConfigPage />} />
          <Route path="/device/:id" element={<DeviceDetail />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
