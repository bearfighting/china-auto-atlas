import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { UnknownState } from "@/components/states";
import { publicMediaPath } from "@/lib/media";
import type { Media } from "@/lib/data/types";

export function MediaGallery({ media }: { media: Media[] }) {
  if (!media.length) {
    return (
      <Card data-testid="media-placeholder">
        <CardContent className="flex min-h-48 items-center justify-center p-6 text-center">
          <UnknownState label="Media not available" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {media.map((item) => (
        <Card key={item.id} data-testid="approved-media">
          <CardContent className="p-2">
            {item.asset_path && publicMediaPath(item.asset_path) ? (
              <Image
                src={publicMediaPath(item.asset_path)!}
                alt={item.alt?.en ?? item.alt?.["zh-CN"] ?? "Vehicle media"}
                width={1200}
                height={675}
                className="aspect-video rounded-md object-cover"
              />
            ) : (
              <div className="flex min-h-40 items-center justify-center">
                <UnknownState label="Media file not available" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
