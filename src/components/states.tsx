import Link from "next/link";
import { AlertTriangle, FileQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UnknownState({ label = "Unknown" }: { label?: string }) {
  return <span className="text-sm text-muted-foreground">{label}</span>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <FileQuestion className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h2 className="font-semibold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void } = {}) {
  return (
    <Card role="alert" data-testid="error-state">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">This page could not be loaded.</p>
        {onRetry ? (
          <Button type="button" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function NotFoundState({ entity = "page" }: { entity?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <h1 className="text-2xl font-semibold">{entity} not found</h1>
        <p className="text-sm text-muted-foreground">
          The requested record is not available in the current atlas.
        </p>
        <Link
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          href="/"
        >
          Return home
        </Link>
      </CardContent>
    </Card>
  );
}
