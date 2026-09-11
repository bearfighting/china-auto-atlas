import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AtlasEntityCard({
  href,
  title,
  titleZh,
  eyebrow,
  status,
  description,
  meta,
}: {
  href: string;
  title: string;
  titleZh?: string;
  eyebrow: string;
  status?: string;
  description?: string;
  meta?: React.ReactNode;
}) {
  return (
    <Card
      className="h-full transition-colors hover:border-foreground/30"
      data-testid="atlas-entity-card"
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{eyebrow}</Badge>
          {status ? <Badge variant="muted">{status}</Badge> : null}
        </div>
        <CardTitle className="leading-tight">
          <Link
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={href}
          >
            {title}
          </Link>
        </CardTitle>
        {titleZh ? <p className="text-sm text-muted-foreground">{titleZh}</p> : null}
      </CardHeader>
      <CardContent className="space-y-2">
        {description ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
        <Link
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          href={href}
        >
          View {eyebrow.toLowerCase()} profile
        </Link>
      </CardContent>
    </Card>
  );
}
