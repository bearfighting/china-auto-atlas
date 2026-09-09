import { PageContainer } from "@/components/page-container";
import { NotFoundState } from "@/components/states";

export default function TechnologyNotFound() {
  return (
    <PageContainer>
      <NotFoundState entity="Technology" />
    </PageContainer>
  );
}
