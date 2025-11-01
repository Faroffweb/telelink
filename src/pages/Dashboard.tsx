import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, Plus, LogOut, LayoutDashboard, Link as LinkIcon } from "lucide-react";
import CreatePostDialog from "@/components/CreatePostDialog";
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import LinkSection from "@/components/LinkSection";

const Dashboard = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                tellelink
                </h1>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView("dashboard")} isActive={activeView === "dashboard"}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView("links")} isActive={activeView === "links"}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Links
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="border-b border-border bg-card shadow-card">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <SidebarTrigger />
                <div className="flex items-center gap-4">
                    <Button onClick={() => setShowCreateDialog(true)} className="shadow-elegant">
                        <Plus className="h-4 w-4 mr-2" />
                        New Post
                    </Button>
                    <Button variant="outline" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </header>

        <main className="container mx-auto px-4 py-8">
            {activeView === 'dashboard' && (
                <div>
                    <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome to your dashboard.</p>
                </div>
            )}
            {activeView === 'links' && <LinkSection />}
        </main>

        <CreatePostDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onPostCreated={() => {}}
        />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
