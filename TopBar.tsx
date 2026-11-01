import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Search } from "lucide-react";

interface TopBarProps {
  user: any;
  onLogout: () => void;
}

export function TopBar({ user, onLogout }: TopBarProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 bg-white border-b border-gray-200 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:flex items-center gap-1">
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
            {user.institution_id?.slice(0, 8) || "Institution"}
          </span>
          <input
            type="text"
            placeholder="Search inquiries, students..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user.role?.replace(/_/g, " ") || "user"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
