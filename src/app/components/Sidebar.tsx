"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  Home,
  Compass,
  PlusSquare,
  Bookmark,
  User,
  Zap,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/feed", label: "For You", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/upload", label: "Upload", icon: PlusSquare },
  { href: "/saved", label: "Saved", icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 bg-black border-r border-zinc-800 z-40 py-6 px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10 px-2">
        <Zap className="w-7 h-7 text-pink-500 fill-pink-500" />
        <span className="text-2xl font-black text-white tracking-tight">
          PopReel
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === "/feed" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group",
                active
                  ? "bg-zinc-900 text-white font-semibold"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon
                className={clsx(
                  "w-6 h-6 transition-colors",
                  active ? "text-pink-500" : "group-hover:text-pink-400"
                )}
              />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}

        {isSignedIn && user && (
          <Link
            href={`/profile/${user.id}`}
            className={clsx(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group",
              pathname.startsWith("/profile")
                ? "bg-zinc-900 text-white font-semibold"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            )}
          >
            <User
              className={clsx(
                "w-6 h-6 transition-colors",
                pathname.startsWith("/profile")
                  ? "text-pink-500"
                  : "group-hover:text-pink-400"
              )}
            />
            <span className="text-sm">Profile</span>
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="mt-auto border-t border-zinc-800 pt-4 px-2">
        {isSignedIn && user ? (
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user.fullName || user.username}
              </p>
              <p className="text-zinc-500 text-xs truncate">@{user.username}</p>
            </div>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="block w-full text-center bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
}
