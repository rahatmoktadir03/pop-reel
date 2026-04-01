"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Home, Compass, Plus, Bookmark, User } from "lucide-react";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  const items = [
    { href: "/feed",    label: "Home",    icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/upload",  label: "Upload",  icon: Plus,     accent: true },
    { href: "/saved",   label: "Saved",   icon: Bookmark },
    {
      href: isSignedIn && user ? `/profile/${user.id}` : "/sign-in",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
      {/* Blur background */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl border-t border-zinc-800/60" />

      <div className="relative flex items-center justify-around px-2 py-2">
        {items.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-0",
                active ? "text-white" : "text-zinc-500"
              )}
            >
              {accent ? (
                <span className="w-11 h-11 -mt-5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-pink-glow">
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </span>
              ) : (
                <span className={clsx(
                  "w-7 h-7 flex items-center justify-center rounded-xl transition-all",
                  active ? "bg-pink-500/15" : ""
                )}>
                  <Icon className={clsx(
                    "w-5 h-5 transition-colors",
                    active ? "text-pink-400" : "text-zinc-500"
                  )} />
                </span>
              )}
              <span className={clsx(
                "text-[10px] font-semibold truncate transition-colors",
                accent ? "mt-1" : "",
                active ? "text-white" : "text-zinc-500"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
