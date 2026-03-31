"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Home, Compass, PlusSquare, Bookmark, User } from "lucide-react";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  const items = [
    { href: "/feed", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/upload", label: "Upload", icon: PlusSquare, accent: true },
    { href: "/saved", label: "Saved", icon: Bookmark },
    {
      href: isSignedIn && user ? `/profile/${user.id}` : "/sign-in",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 z-40 flex items-center justify-around px-2 py-2 safe-area-bottom">
      {items.map(({ href, label, icon: Icon, accent }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-0",
              active ? "text-white" : "text-zinc-500"
            )}
          >
            {accent ? (
              <span className="bg-pink-500 rounded-xl p-1.5">
                <Icon className="w-5 h-5 text-white" />
              </span>
            ) : (
              <Icon
                className={clsx(
                  "w-6 h-6",
                  active ? "text-pink-500" : "text-zinc-500"
                )}
              />
            )}
            <span className="text-[10px] font-medium truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
