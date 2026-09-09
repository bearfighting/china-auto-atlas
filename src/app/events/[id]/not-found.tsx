import { PageContainer } from "@/components/page-container";
import { NotFoundState } from "@/components/states";

export default function EventNotFound() {
  return (
    <PageContainer>
      <NotFoundState entity="Event" />
    </PageContainer>
  );
}
