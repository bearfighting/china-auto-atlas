export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>;
}
