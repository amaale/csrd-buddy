import { Leaf, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
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
            <a href="#" className="text-primary font-medium border-b-2 border-primary pb-4">Dashboard</a>
            <a href="#" className="text-neutral-700 hover:text-primary transition-colors">Reports</a>
            <a href="#" className="text-neutral-700 hover:text-primary transition-colors">Data Sources</a>
            <a href="#" className="text-neutral-700 hover:text-primary transition-colors">Settings</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-700">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-secondary text-white text-sm font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium text-neutral-900">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
