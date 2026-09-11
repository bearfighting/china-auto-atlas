import { PageContainer } from "@/components/layout/page-container";
import { NotFoundState } from "@/components/content/states";

export default function BrandNotFound() {
  return (
    <PageContainer>
      <NotFoundState entity="Brand" />
    </PageContainer>
  );
}
