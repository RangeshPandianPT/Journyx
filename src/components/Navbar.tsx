import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Bus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const location = useLocation();
  const { user, login, logout } = useAuth();
  
  if (location.pathname.startsWith('/book')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print pt-[env(safe-area-inset-top)]">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Bus className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Journyx
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium"> 
            <Link
              to="/"
              className="text-muted-foreground transition-colors hover:text-primary [&.active]:text-foreground [&.active]:font-semibold"
            >
              Home
            </Link>
            <Link
              to="/search"
              search={{ from: "", to: "", date: "", passengers: 1 }}
              className="text-muted-foreground transition-colors hover:text-primary [&.active]:text-foreground [&.active]:font-semibold"
            >
              Search
            </Link>
            <Link
              to="/my-bookings"
              className="text-muted-foreground transition-colors hover:text-primary [&.active]:text-foreground [&.active]:font-semibold"
            >
              My Bookings
            </Link>
            <Link
              to="/"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Help
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:inline-flex text-sm font-medium">Hello, {user}</span>
              <Button onClick={logout} variant="outline">Sign Out</Button>
            </>
          ) : (
            <>
              <Button onClick={login} variant="ghost" className="hidden sm:inline-flex">
                Log in
              </Button>
              <Button onClick={login}>Sign Up</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
