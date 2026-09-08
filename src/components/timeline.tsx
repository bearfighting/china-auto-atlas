import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UnknownState } from "@/components/states";
import type { Event } from "@/lib/data/types";

export function Timeline({ events }: { events: Event[] }) {
  if (!events.length) return <UnknownState label="No lifecycle events collected" />;
  return (
    <ol className="space-y-3">
      {events
        .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
        .map((event) => (
          <li key={event.id}>
            <Card>
              <CardContent className="flex gap-3 p-4">
                <CalendarDays
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium">
                    {event.summary ?? event.event_type ?? "Event"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.date ?? "Date unknown"} · {event.event_type ?? "event"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
    </ol>
  );
}
