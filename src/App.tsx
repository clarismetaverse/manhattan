import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import RestaurantDetail from "./pages/RestaurantDetail";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import UGCTiktokerProfilePinned from "./pages/UGCTiktokerProfilePinned";
import CaseShowcasePage from "./pages/CaseShowcasePage";
import UGCViewPage from "./pages/UGCViewPage";
import PortfolioNewPage from "./pages/PortfolioNewPage";
import MemberspassHome from "./pages/MemberspassHome";
import MemberspassDetail from "./pages/MemberspassDetail";
import MemberspassTickets from "./pages/MemberspassTickets";
import GeneralRequestSent from "./pages/GeneralRequestSent";
import GuestMatch from "./pages/GuestMatch";



const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/ugc-tiktoker-profile" element={<UGCTiktokerProfilePinned />} />
              <Route path="/ugc" element={<UGCViewPage />} />
              <Route path="/case/:id" element={<CaseShowcasePage />} />
              <Route path="/portfolio/new" element={<PortfolioNewPage />} />
              <Route path="/memberspass" element={<MemberspassHome />} />
              <Route path="/memberspass/tickets" element={<MemberspassTickets />} />
              <Route path="/memberspass/:clubId" element={<MemberspassDetail />} />
              <Route path="/memberspass/guest-match" element={<GuestMatch />} />
              <Route path="/general-request-sent" element={<GeneralRequestSent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
