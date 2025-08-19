import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Purchases from "./pages/Purchases";
import PurchaseDetails from "./pages/PurchaseDetails";
import Tiers from "./pages/Tiers";
import TierDetails from "./pages/TierDetails";
import Payouts from "./pages/Payouts";
import PayoutDetails from "./pages/PayoutDetails";
import Benefits from "./pages/Benefits";
import AuditLogs from "./pages/AuditLogs";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/customers" element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            } />
            
            <Route path="/customers/:id" element={
              <ProtectedRoute>
                <CustomerDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/purchases" element={
              <ProtectedRoute>
                <Purchases />
              </ProtectedRoute>
            } />
            
            <Route path="/purchases/:id" element={
              <ProtectedRoute>
                <PurchaseDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/tiers" element={
              <ProtectedRoute requiredRole="manager">
                <Tiers />
              </ProtectedRoute>
            } />
            
            <Route path="/tiers/:id" element={
              <ProtectedRoute requiredRole="manager">
                <TierDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/payouts" element={
              <ProtectedRoute>
                <Payouts />
              </ProtectedRoute>
            } />
            
            <Route path="/payouts/:id" element={
              <ProtectedRoute>
                <PayoutDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/benefits" element={
              <ProtectedRoute>
                <Benefits />
              </ProtectedRoute>
            } />
            
            <Route path="/audit-logs" element={
              <ProtectedRoute requiredRole="super_admin">
                <AuditLogs />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute requiredRole="manager">
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
