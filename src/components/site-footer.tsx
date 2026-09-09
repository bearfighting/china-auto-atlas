import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-medium text-foreground">China Auto Atlas</p>
          <p>Structured automotive knowledge with traceable sources.</p>
        </div>
        <nav aria-label="Footer navigation" className="flex gap-4">
          <Link className="hover:text-foreground hover:underline" href="/news">
            News
          </Link>
          <Link className="hover:text-foreground hover:underline" href="/vehicles">
            Vehicles
          </Link>
        </nav>
      </div>
    </footer>
  );
}
