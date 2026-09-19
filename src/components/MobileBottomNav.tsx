import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, Ticket, HelpCircle } from "lucide-react";

export function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: Home,
      isActive: location.pathname === "/",
    },
    {
      label: "Search",
      to: "/search",
      search: { from: "", to: "", date: "", passengers: 1 },
      icon: Search,
      isActive: location.pathname === "/search",
    },
    {
      label: "My Bookings",
      to: "/my-bookings",
      icon: Ticket,
      isActive: location.pathname === "/my-bookings",
    },
    {
      label: "Help",
      to: "/",
      icon: HelpCircle,
      isActive: false,
    },
  ];

  if (location.pathname.startsWith('/book')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border no-print safe-area-bottom">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-colors ${
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`p-1 rounded-full transition-transform ${
                  active ? "scale-110 bg-primary/10" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
