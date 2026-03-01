import { Code, Home, LogOut, Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/hooks/mutations/use-user-mutations";
import { useUserStore } from "@/stores/user-store";

interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
}

const menuItems: MenuItem[] = [
  { key: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
  { key: "/admin/userManage", label: "User Management" },
  { key: "/admin/appManage", label: "App Management" },
];

export default function GlobalHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser, setLoginUser } = useUserStore();
  const selectedKey = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.key.startsWith("/admin")) {
      return loginUser?.userRole === "admin";
    }
    return true;
  });

  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res.code === 0) {
          setLoginUser({ userName: "Not logged in" });
          toast.success("Logged out successfully");
          navigate("/user/login");
        } else {
          toast.error("Logout failed: " + res.message);
        }
      },
      onError: () => {
        toast.error("Logout failed");
      },
    });
  };

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        {/* Left: Logo and Title */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <Code className="text-primary h-8 w-8" />
          <h1 className="hidden text-lg font-semibold text-blue-500 sm:block">
            AI App Generator
          </h1>
        </Link>

        {/* Center: Navigation Menu (Desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.key}
              to={item.key}
              className={`rounded-md px-4 py-2 text-sm font-medium no-underline transition-colors ${
                selectedKey === item.key
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </Link>
          ))}
          <a
            href="https://github.com/161043261"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 no-underline hover:bg-gray-100 hover:text-gray-900"
          >
            AI Codegen
          </a>
        </nav>

        {/* Right: User Actions */}
        <div className="flex items-center gap-3">
          {loginUser?.id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={loginUser.userAvatar} />
                    <AvatarFallback>
                      {loginUser.userName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:inline">
                    {loginUser.userName || "Anonymous"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/user/login">Login</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="mt-4 border-t pt-4 pb-2 md:hidden">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.key}
              to={item.key}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-md px-4 py-2 text-sm font-medium no-underline ${
                selectedKey === item.key
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
