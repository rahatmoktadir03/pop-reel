"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

// Pages that have their own full-page layout (no app shell chrome)
const SHELL_FREE = ["/", "/sign-in", "/sign-up"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShellFree =
    SHELL_FREE.includes(pathname) ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  if (isShellFree) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <main className="md:pl-60 min-h-screen">{children}</main>
      <BottomNav />
    </>
  );
}
