import { PageContainer } from "@/components/layout/page-container";
import { NotFoundState } from "@/components/content/states";

export default function TechnologyNotFound() {
  return (
    <PageContainer>
      <NotFoundState entity="Technology" />
    </PageContainer>
  );
}
