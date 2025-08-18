import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
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