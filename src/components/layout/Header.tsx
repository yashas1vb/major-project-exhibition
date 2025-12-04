import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Code2, User, LogOut } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useStore();
  const isLanding = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', href: '/home' },
    { label: 'About', href: '/#about' },
    { label: 'FAQs', href: '/#faqs' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={currentUser ? "/home" : "/"} className="flex items-center gap-2 text-foreground">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">CollabCode</span>
        </Link>

        {isLanding && (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{currentUser.username || currentUser.name}</span>
              </div>
              <Link to="/workspaces">
                <Button variant="hero" size="sm">
                  Workspaces
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link to="/">
                <Button variant="hero">Create</Button>
              </Link>
              <Link to="/">
                <Button variant="heroOutline">Join</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
