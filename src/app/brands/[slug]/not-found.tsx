import { PageContainer } from "@/components/page-container";
import { NotFoundState } from "@/components/states";

export default function BrandNotFound() {
  return (
    <PageContainer>
      <NotFoundState entity="Brand" />
    </PageContainer>
  );
}
