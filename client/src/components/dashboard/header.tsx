import { Leaf, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useTranslations } from "@/lib/translations";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [location] = useLocation();
  const { t } = useTranslations();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Reload to trigger authentication check
        window.location.reload();
      } else {
        toast({
          title: "Logout failed",
          description: "Failed to logout. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user?.firstName || !user?.lastName) return "U";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getUserName = () => {
    if (!user?.firstName || !user?.lastName) return "User";
    return `${user.firstName} ${user.lastName}`;
  };
  return (
    <header className="bg-white material-shadow-1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-semibold text-neutral-900">CSRD Buddy</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`transition-colors pb-4 ${
                location === "/" 
                  ? "text-primary font-medium border-b-2 border-primary" 
                  : "text-neutral-700 hover:text-primary"
              }`}
            >
              {t('dashboard')}
            </Link>
            <Link 
              href="/reports" 
              className={`transition-colors pb-4 ${
                location === "/reports" 
                  ? "text-primary font-medium border-b-2 border-primary" 
                  : "text-neutral-700 hover:text-primary"
              }`}
            >
              {t('reports')}
            </Link>
            <Link 
              href="/data-sources" 
              className={`transition-colors pb-4 ${
                location === "/data-sources" 
                  ? "text-primary font-medium border-b-2 border-primary" 
                  : "text-neutral-700 hover:text-primary"
              }`}
            >
              {t('dataSource')}
            </Link>
            <Link 
              href="/settings" 
              className={`transition-colors pb-4 ${
                location === "/settings" 
                  ? "text-primary font-medium border-b-2 border-primary" 
                  : "text-neutral-700 hover:text-primary"
              }`}
            >
              {t('settings')}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-700">
              <Bell className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 h-auto">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-secondary text-white text-sm font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-neutral-900">
                    {getUserName()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
