import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://china-auto-atlas.vercel.app"),
  title: { default: "China Auto Atlas", template: "%s | China Auto Atlas" },
  description:
    "An evidence-led automotive knowledge platform focused on China's automotive industry.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
