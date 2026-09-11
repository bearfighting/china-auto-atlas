import { PageContainer } from "@/components/layout/page-container";
import { NotFoundState } from "@/components/content/states";

export default function ManufacturerNotFound() {
  return (
    <PageContainer>
      <NotFoundState entity="Manufacturer" />
    </PageContainer>
  );
}
