import { PageContainer } from "@/components/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    </PageContainer>
  );
}
