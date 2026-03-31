import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import AppShell from "./components/AppShell";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PopReel — Short Videos",
  description: "Discover and share short-form videos",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="bg-black text-white">
          <AppShell>{children}</AppShell>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#18181b",
                color: "#fff",
                border: "1px solid #27272a",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#ec4899", secondary: "#fff" } },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
