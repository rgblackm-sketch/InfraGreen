import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  description: "Internal admin dashboard for reviewing project submissions and professional applications.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
