import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-glow">
      <div className="text-center">
        <h1 className="mb-4 text-8xl font-bold text-gradient">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Oops! This page doesn't exist
        </p>
        <Link to="/">
          <Button variant="hero">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
