import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  Zap,
  Play,
  Heart,
  MessageCircle,
  Share2,
  Upload,
  Compass,
  Shield,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

async function getAuthState() {
  try {
    const { userId } = await auth();
    return { userId };
  } catch {
    return { userId: null };
  }
}

export default async function LandingPage() {
  const { userId } = await getAuthState();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-7 h-7 text-pink-500 fill-pink-500" />
          <span className="text-xl font-black tracking-tight">PopReel</span>
        </Link>
        <div className="flex items-center gap-3">
          {userId ? (
            <Link
              href="/feed"
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors"
            >
              Go to Feed <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors"
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-[140px] animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 px-6 max-w-7xl mx-auto">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-zinc-300 mb-8">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Short-form video for everyone
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
              Create.{" "}
              <span className="bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                Share.
              </span>
              <br />
              Go{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Viral.
              </span>
            </h1>

            <p className="text-zinc-400 text-lg leading-relaxed mb-10">
              PopReel is where the next generation of creators build their audience.
              Upload your moments, discover trending content, and connect with
              millions of people worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href={userId ? "/feed" : "/sign-up"}
                className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-4 rounded-full text-base transition-all hover:scale-105 shadow-lg shadow-pink-500/30"
              >
                <Play className="w-5 h-5 fill-white" />
                Start Watching
              </Link>
              <Link
                href="/explore"
                className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-full text-base transition-all hover:bg-white/5"
              >
                <Compass className="w-5 h-5" />
                Explore Videos
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
              <div>
                <p className="text-2xl font-black text-white">11+</p>
                <p className="text-zinc-500 text-xs">Videos</p>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div>
                <p className="text-2xl font-black text-white">5</p>
                <p className="text-zinc-500 text-xs">Creators</p>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div>
                <p className="text-2xl font-black text-white">∞</p>
                <p className="text-zinc-500 text-xs">Good Vibes</p>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex-shrink-0 relative">
            <PhoneMockup />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-600 animate-bounce">
          <span className="text-xs">Scroll</span>
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-pink-500 font-semibold text-sm uppercase tracking-widest mb-3">
            Why PopReel
          </p>
          <h2 className="text-4xl sm:text-5xl font-black">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
              go viral
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 font-semibold text-sm uppercase tracking-widest mb-3">
              Simple as 1-2-3
            </p>
            <h2 className="text-4xl sm:text-5xl font-black">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl font-black mb-5 shadow-lg shadow-pink-500/30">
                  {i + 1}
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Video showcase strip ─── */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">
            Trending right now
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {showcaseVideos.map((v) => (
              <Link
                key={v.title}
                href="/feed"
                className="snap-start flex-shrink-0 w-40 sm:w-48 group"
              >
                <div className="aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden relative">
                  <video
                    src={v.url}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">
                      {v.title}
                    </p>
                    <p className="text-zinc-400 text-[10px] mt-0.5">@{v.author}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA banner ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-orange-500 p-12 text-center">
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <Zap className="w-12 h-12 text-white fill-white mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Ready to pop off?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
                Join PopReel today and start sharing your world with the people who
                matter most.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={userId ? "/feed" : "/sign-up"}
                  className="bg-white text-pink-600 hover:bg-zinc-100 font-bold px-8 py-4 rounded-full text-base transition-all hover:scale-105 shadow-xl"
                >
                  {userId ? "Go to My Feed" : "Create Free Account"}
                </Link>
                <Link
                  href="/explore"
                  className="border-2 border-white/60 hover:border-white text-white font-semibold px-8 py-4 rounded-full text-base transition-all hover:bg-white/10"
                >
                  Browse Without Signing Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-zinc-900 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-pink-500 fill-pink-500" />
            <span className="font-black tracking-tight">PopReel</span>
          </Link>
          <p className="text-zinc-600 text-sm">© 2026 PopReel. All rights reserved.</p>
          <div className="flex items-center gap-6 text-zinc-500 text-sm">
            <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
            <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
            <Link href="/upload" className="hover:text-white transition-colors">Upload</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

function PhoneMockup() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-500/30 to-cyan-500/20 rounded-[48px] blur-2xl scale-110" />

      {/* Phone shell */}
      <div className="relative w-[260px] h-[540px] bg-zinc-900 rounded-[44px] border-2 border-zinc-700 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />

        {/* Video background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900">
          <video
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
        </div>

        {/* UI overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pt-10">
          {/* Top bar */}
          <div className="flex justify-center gap-6 text-xs text-white/70 font-medium">
            <span>Following</span>
            <span className="text-white border-b-2 border-white pb-0.5 font-bold">For You</span>
          </div>

          {/* Right actions */}
          <div className="absolute right-3 bottom-28 flex flex-col gap-4 items-center">
            <ActionPill icon={<Heart className="w-5 h-5 fill-pink-500 text-pink-500" />} label="67.8K" />
            <ActionPill icon={<MessageCircle className="w-5 h-5 text-white" />} label="1.2K" />
            <ActionPill icon={<Share2 className="w-5 h-5 text-white" />} label="Share" />
          </div>

          {/* Bottom info */}
          <div className="pb-4">
            <p className="text-white font-bold text-xs mb-1">@fitnessguru</p>
            <p className="text-white/80 text-[11px] font-medium leading-snug mb-1">
              For Bigger Fun! 🎉
            </p>
            <div className="flex gap-1">
              <span className="text-cyan-400 text-[10px]">#funny</span>
              <span className="text-cyan-400 text-[10px]">#comedy</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/80 flex items-center justify-around px-4">
          {[
            <svg key="h" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
            <Compass key="c" className="w-5 h-5 text-white/50" />,
            <div key="p" className="w-7 h-7 bg-pink-500 rounded-lg flex items-center justify-center"><Upload className="w-4 h-4 text-white" /></div>,
            <svg key="b" className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>,
          ]}
        </div>
      </div>

      {/* Floating like animation */}
      <div className="absolute -right-8 top-1/3 flex flex-col gap-3">
        <FloatingCard color="from-pink-500 to-rose-600" icon="❤️" text="12.4K Likes" delay="0s" />
        <FloatingCard color="from-cyan-500 to-blue-500" icon="💬" text="842 Comments" delay="0.3s" />
        <FloatingCard color="from-purple-500 to-pink-500" icon="🔖" text="Saved!" delay="0.6s" />
      </div>
    </div>
  );
}

function ActionPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
        {icon}
      </div>
      <span className="text-white text-[9px] font-semibold">{label}</span>
    </div>
  );
}

function FloatingCard({
  color,
  icon,
  text,
  delay,
}: {
  color: string;
  icon: string;
  text: string;
  delay: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 bg-gradient-to-r ${color} px-3 py-1.5 rounded-full shadow-lg text-white text-xs font-semibold whitespace-nowrap opacity-90`}
      style={{
        animation: `floatY 3s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-all hover:-translate-y-1">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}
      >
        {icon}
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Data ─── */

const features = [
  {
    icon: <Play className="w-6 h-6 text-white fill-white" />,
    title: "Endless Feed",
    desc: "Swipe through an infinite vertical feed of short videos. Our algorithm learns what you love and keeps delivering.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-white" />,
    title: "Smart Recommendations",
    desc: "Adaptive AI tailors your feed based on your watch history, likes, and who you follow — updated in real time.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: <Upload className="w-6 h-6 text-white" />,
    title: "Instant Upload",
    desc: "Drag-and-drop your video, add a title and tags, and publish in seconds. No editing software needed.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: <Heart className="w-6 h-6 text-white fill-white" />,
    title: "Like, Save & Share",
    desc: "Express yourself on every video. Save your favorites to watch later. Share with a single tap using the Web Share API.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: <MessageCircle className="w-6 h-6 text-white" />,
    title: "Live Comments",
    desc: "A real-time comment drawer slides up on any video. Join the conversation and connect with other fans.",
    gradient: "from-green-500 to-teal-500",
  },
  {
    icon: <Shield className="w-6 h-6 text-white" />,
    title: "Content Moderation",
    desc: "Google Vision AI scans every upload before it goes live. Keep PopReel safe for everyone automatically.",
    gradient: "from-orange-500 to-yellow-500",
  },
];

const steps = [
  {
    title: "Create an account",
    desc: "Sign up in seconds with your email. No credit card required. Your profile is ready instantly.",
  },
  {
    title: "Upload your video",
    desc: "Pick any video up to 200 MB. Add a title, description, and hashtags to help people discover it.",
  },
  {
    title: "Grow your audience",
    desc: "Your video appears in feeds immediately. Gain followers, earn likes, and build your community.",
  },
];

const showcaseVideos = [
  {
    title: "Big Buck Bunny",
    author: "dancequeen",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    title: "For Bigger Fun!",
    author: "fitnessguru",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    title: "Tears of Steel",
    author: "foodielife",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  },
  {
    title: "Elephant Dream",
    author: "techgeek99",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    title: "For Bigger Escapes",
    author: "naturelens",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
];
