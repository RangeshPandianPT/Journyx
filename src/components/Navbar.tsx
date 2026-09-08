import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Bus } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
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
              search={{ from: "", to: "", date: "" }}
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
          <Button variant="ghost" className="hidden sm:inline-flex">
            Log in
          </Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </header>
  );
}
