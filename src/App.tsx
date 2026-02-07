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
import MemberspassTicketList from "./pages/MemberspassTicketList";
import MemberspassTicketListV2 from "./pages/MemberspassTicketListV2";
import MembersgroupsHomepage from "./pages/MembersgroupsHomepage";
import MembersgroupDetail from "./pages/MembersgroupDetail";
import GeneralRequestSent from "./pages/GeneralRequestSent";
import GuestMatch from "./pages/GuestMatch";
import AuraProfile from "./pages/AuraProfile";
import BookingsScreen from "./pages/BookingsScreen";
import BookingDetails from "./pages/BookingDetails";
import VenuesPage from "./app/venues/Page";
import BookingPreview from "./pages/BookingPreview";
import BookingPreviewConfirm from "./pages/BookingPreviewConfirm";
import VenueCreatorsHome from "./features/venues/VenueCreatorsHome";



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
              <Route path="/aura-profile" element={<AuraProfile />} />
              <Route path="/aura-profile/:id" element={<AuraProfile />} />
              <Route path="/memberspass" element={<MemberspassHome />} />
              <Route path="/memberspass/groups" element={<MembersgroupsHomepage />} />
              <Route path="/memberspass/venues" element={<VenuesPage />} />
              <Route path="/memberspass/venues/:id" element={<RestaurantDetail />} />
              <Route path="/memberspass/creators" element={<VenueCreatorsHome />} />
              <Route path="/memberpass/venues" element={<VenuesPage />} />
              <Route path="/app/venues" element={<VenuesPage />} />
              <Route path="/booking/preview" element={<BookingPreview />} />
              <Route path="/booking/preview/confirm" element={<BookingPreviewConfirm />} />
              <Route path="/memberspass/bookings" element={<BookingsScreen />} />
              <Route path="/memberspass/booking/:id" element={<BookingDetails />} />
              <Route path="/memberspass/tickets" element={<MemberspassTickets />} />
              <Route path="/memberspass/ticket-list" element={<MemberspassTicketList />} />
              <Route path="/memberspass/tickets-v2" element={<MemberspassTicketListV2 />} />
              <Route path="/memberspass/groups/:id" element={<MembersgroupDetail />} />
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
