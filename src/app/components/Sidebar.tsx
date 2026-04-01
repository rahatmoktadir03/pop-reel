"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Home, Compass, PlusSquare, Bookmark, User, Zap, TrendingUp } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/feed",    label: "For You",  icon: Home,       desc: "Your feed" },
  { href: "/explore", label: "Explore",  icon: Compass,    desc: "Discover" },
  { href: "/upload",  label: "Upload",   icon: PlusSquare, desc: "Share a video", accent: true },
  { href: "/saved",   label: "Saved",    icon: Bookmark,   desc: "Saved videos" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 bg-zinc-950 border-r border-zinc-800/60 z-40 py-5 px-3">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 px-3 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-pink-glow flex-shrink-0 group-hover:scale-105 transition-transform">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-xl font-black text-white tracking-tight">PopReel</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href || (href === "/feed" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "nav-pill flex items-center gap-3 px-3 py-3 rounded-xl group relative overflow-hidden",
                active
                  ? "bg-zinc-800/80 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-r-full" />
              )}
              {accent ? (
                <span className={clsx(
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                  active
                    ? "bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-glow"
                    : "bg-gradient-to-br from-pink-500/80 to-rose-600/80 group-hover:shadow-pink-glow"
                )}>
                  <Icon className="w-4.5 h-4.5 text-white" />
                </span>
              ) : (
                <Icon className={clsx(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  active ? "text-pink-400" : "text-zinc-500 group-hover:text-pink-400"
                )} />
              )}
              <span className={clsx("text-sm font-medium", accent && "font-bold")}>{label}</span>
            </Link>
          );
        })}

        {isSignedIn && user && (
          <Link
            href={`/profile/${user.id}`}
            className={clsx(
              "nav-pill flex items-center gap-3 px-3 py-3 rounded-xl group relative overflow-hidden",
              pathname.startsWith("/profile")
                ? "bg-zinc-800/80 text-white"
                : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
            )}
          >
            {pathname.startsWith("/profile") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-r-full" />
            )}
            <User className={clsx(
              "w-5 h-5 flex-shrink-0 transition-colors",
              pathname.startsWith("/profile") ? "text-pink-400" : "text-zinc-500 group-hover:text-pink-400"
            )} />
            <span className="text-sm font-medium">Profile</span>
          </Link>
        )}

        {/* Trending section */}
        <div className="mt-4 px-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Trending</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["#funny", "#travel", "#art", "#cars", "#food"].map((tag) => (
              <Link
                key={tag}
                href={`/explore?tag=${tag.slice(1)}`}
                className="text-[11px] text-zinc-400 hover:text-pink-400 hover:bg-pink-500/10 px-2 py-0.5 rounded-full bg-zinc-800/60 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-zinc-800/60 pt-4 px-2 mt-2">
        {isSignedIn && user ? (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/40 transition-colors group cursor-pointer">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate leading-tight">
                {user.fullName || user.username}
              </p>
              <p className="text-zinc-500 text-xs truncate">@{user.username}</p>
            </div>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all hover:shadow-pink-glow"
          >
            Sign In to PopReel
          </Link>
        )}
      </div>
    </aside>
  );
}
