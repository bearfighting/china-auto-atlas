import { NotFoundState } from "@/components/content/states";

export default function VehicleNotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <NotFoundState entity="Vehicle" />
    </main>
  );
}
