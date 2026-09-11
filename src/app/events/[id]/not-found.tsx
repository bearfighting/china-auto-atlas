import { PageContainer } from "@/components/layout/page-container";
import { NotFoundState } from "@/components/content/states";

export default function EventNotFound() {
  return (
    <PageContainer>
      <NotFoundState entity="Event" />
    </PageContainer>
  );
}
