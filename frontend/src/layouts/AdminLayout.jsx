import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Menu, X, LogOut, LayoutDashboard, IndianRupee,
  Settings, Briefcase, Users, Gauge
} from "lucide-react";

const menuItems = [
  { name: "Dashboard",  path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Income",     path: "/admin/income",    icon: IndianRupee },
  { name: "Expenses",   path: "/admin/expenses",  icon: IndianRupee },
  { name: "Rates",      path: "/admin/rates",     icon: Gauge },
  { name: "Jobs",       path: "/admin/jobs",      icon: Briefcase },
  { name: "Users",      path: "/admin/users",     icon: Users },
];

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentPage = menuItems.find(m => location.pathname.startsWith(m.path))?.name || "Admin";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-yellow-50">

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl flex flex-col
        transform transition-transform duration-250 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:shadow-md
      `}>
        {/* Logo / Title */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-green-700 tracking-tight">Harvester Admin</h2>
          <button
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <div className={`
                    flex items-center px-4 py-2.5 rounded-xl transition-all text-sm font-semibold
                    ${isActive
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"}
                  `}>
                    <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? "text-white" : "text-green-500"}`} />
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center h-14 px-4 bg-white border-b border-gray-200 shadow-sm lg:hidden">
          <button
            className="p-2 mr-3 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-base font-bold text-gray-800">{currentPage}</span>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
