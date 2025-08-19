import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-80">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="h-14 bg-primary border-b flex items-center px-4 gap-4">
            <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10" />
            <div className="flex-1">
              <h2 className="text-primary-foreground font-semibold">
                Recruitment & Rewards System
              </h2>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-background">
            {children}
          </main>

          {/* Footer */}
          <footer className="h-12 bg-primary border-t flex items-center justify-center">
            <p className="text-primary-foreground/80 text-sm">
              © 2025 EDJEMER ENTERPRISES. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}