import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  BookOpen,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inquiries", label: "Inquiries", icon: FileText },
  { path: "/students", label: "Students", icon: Users },
  { path: "/follow-ups", label: "Follow-ups", icon: Calendar },
  { path: "/courses", label: "Courses", icon: BookOpen },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

const adminItems = [
  { path: "/users", label: "Users", icon: Users },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar({ user, onLogout }: SidebarProps) {
  const isAdmin = ["super_admin", "institution_admin"].includes(user.role || "");
  const roleLabel = (user.role || "user")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform -translate-x-full transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 lg:border-r lg:bg-white shadow-lg">
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
          <span className="font-bold text-lg text-indigo-600">EdTech CRM</span>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="p-4 space-y-1">
          <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
          {isAdmin && (
            <>
              <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider my-4">
                Administration
              </div>
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-900">{user.full_name}</p>
            <p className="text-xs text-gray-500">{roleLabel}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm hidden" />
    </>
  );
}
