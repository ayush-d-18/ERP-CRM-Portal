import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  LogOut,
  Layers,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";
import Button from "./ui/Button";

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

interface NavItem {
  icon: ReactNode;
  label: string;
  path: string;
}

export default function Layout({ children, pageTitle = "Dashboard" }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "")
    : null;

  const navItems: NavItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ icon: <Users className="w-5 h-5" />, label: "Customers", path: "/customers" });
    navItems.push({ icon: <Package className="w-5 h-5" />, label: "Products", path: "/products" });
    navItems.push({ icon: <FileText className="w-5 h-5" />, label: "Challans", path: "/challans" });
  } else if (user?.role === "SALES") {
    navItems.push({ icon: <Users className="w-5 h-5" />, label: "Customers", path: "/customers" });
    navItems.push({ icon: <FileText className="w-5 h-5" />, label: "Challans", path: "/challans" });
  } else if (user?.role === "WAREHOUSE") {
    navItems.push({ icon: <Package className="w-5 h-5" />, label: "Products", path: "/products" });
  } else if (user?.role === "ACCOUNTS") {
    navItems.push({ icon: <FileText className="w-5 h-5" />, label: "Challans", path: "/challans" });
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ERP Portal</h1>
            <p className="text-xs text-slate-400">v1.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                location.pathname === item.path
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-700 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(user?.name || "User")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white">
              {user?.role}
            </span>
          </div>

          <Button
            variant="danger"
            size="sm"
            fullWidth
            icon={<LogOut className="w-4 h-4" />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <nav className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <h2 className="text-xl font-semibold text-slate-900">{pageTitle}</h2>
          </div>

          {/* Desktop Right Items */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut className="w-4 h-4" />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </nav>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-slate-300 border-b border-slate-700">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    location.pathname === item.path
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  )}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
