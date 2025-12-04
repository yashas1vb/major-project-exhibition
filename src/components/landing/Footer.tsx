export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CollabCode. Built for developers, by
          developers.
        </p>
      </div>
    </footer>
  );
}
