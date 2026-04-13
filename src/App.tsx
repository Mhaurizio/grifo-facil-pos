import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { POSProvider } from "@/context/POSContext";
import LoginScreen from "./pages/LoginScreen";
import TableMap from "./pages/TableMap";
import OrderScreen from "./pages/OrderScreen";
import BillScreen from "./pages/BillScreen";
import OwnerPanel from "./pages/OwnerPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <POSProvider>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/tables" element={<TableMap />} />
            <Route path="/order" element={<OrderScreen />} />
            <Route path="/bill" element={<BillScreen />} />
            <Route path="/owner" element={<OwnerPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </POSProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
