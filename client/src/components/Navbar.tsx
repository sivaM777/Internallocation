import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, ChartLine, Handshake, User, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface NavbarProps {
  currentView: 'student' | 'company' | 'admin';
  onViewChange: (view: 'student' | 'company' | 'admin') => void;
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartLine, path: '/' },
    { id: 'matches', label: 'Matches', icon: Handshake, path: '/matches' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'admin', label: 'Admin', icon: Settings, path: '/admin' }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    return user.email.split('@')[0];
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Brain className="h-8 w-8 text-primary mr-2" />
                <h1 className="text-2xl font-bold text-primary">InternAlloc</h1>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex space-x-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <Link 
                      key={item.id}
                      href={item.path}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                      data-testid={`nav-${item.id}`}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Role Selector */}
            {user?.role === 'admin' && (
              <Select value={currentView} onValueChange={onViewChange}>
                <SelectTrigger className="w-40" data-testid="role-selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Portal</SelectItem>
                  <SelectItem value="company">Company Portal</SelectItem>
                  <SelectItem value="admin">Admin Portal</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium" data-testid="user-name">{getDisplayName()}</span>
              </span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link 
                    key={item.id}
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex items-center px-3 py-2">
                  <User className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span className="text-sm font-medium">{getDisplayName()}</span>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
