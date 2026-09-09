import { PageContainer } from "@/components/page-container";
import { NotFoundState } from "@/components/states";

export default function ManufacturerNotFound() {
  return (
    <PageContainer>
      <NotFoundState entity="Manufacturer" />
    </PageContainer>
  );
}
