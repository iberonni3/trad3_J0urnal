import { useEffect, useState } from "react";
import { Bell, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAuth, onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";

export function TopNavigation() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { setTheme, theme } = useTheme();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // redirect to AuthPage
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <SidebarTrigger className="touch-friendly sm:p-2" />
          <div className="relative flex-1 max-w-md mobile-hidden">
            <Input
              placeholder="Search trades, symbols, or notes..."
              className="pl-10 w-full bg-muted/50 border-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* Live P&L */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-light border border-success/20">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-success">+$2,456.78</span>
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" className="touch-friendly sm:h-9 sm:w-9 sm:p-0" onClick={toggleTheme}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="touch-friendly sm:h-9 sm:w-9 sm:p-0 relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-danger">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block font-medium">
                  {user?.displayName || user?.email || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.displayName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
