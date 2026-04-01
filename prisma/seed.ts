import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    id: "demo_user_1",
    username: "dancequeen",
    displayName: "Dance Queen",
    bio: "Teaching the world to groove, one video at a time 🎵 Choreo tips every day",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dancequeen&backgroundColor=b6e3f4",
  },
  {
    id: "demo_user_2",
    username: "techgeek99",
    displayName: "Tech Geek",
    bio: "Breaking down the latest in tech. CS grad, coffee addict ☕ | Building cool stuff",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=techgeek99&backgroundColor=c0aede",
  },
  {
    id: "demo_user_3",
    username: "foodielife",
    displayName: "Foodie Life",
    bio: "Eating my way around the world 🍕🍜🍣 | DMs open for food collabs!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=foodielife&backgroundColor=ffdfbf",
  },
  {
    id: "demo_user_4",
    username: "naturelens",
    displayName: "Nature Lens",
    bio: "Capturing the beauty of our planet 📸 | Wildlife + landscapes",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=naturelens&backgroundColor=d1f4d1",
  },
  {
    id: "demo_user_5",
    username: "fitnessguru",
    displayName: "Fitness Guru",
    bio: "Daily workouts, nutrition tips. Let's get moving 💪 | NASM certified",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fitnessguru&backgroundColor=ffd5dc",
  },
  {
    id: "demo_user_6",
    username: "artvibes",
    displayName: "Art Vibes",
    bio: "Digital art & illustration ✨ | Commissions open | New post every Monday",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=artvibes&backgroundColor=c0aede",
  },
  {
    id: "demo_user_7",
    username: "streetstyle",
    displayName: "Street Style",
    bio: "Fashion from the streets 👟 | NYC based | collab: @streetstyle",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=streetstyle&backgroundColor=b6e3f4",
  },
  {
    id: "demo_user_8",
    username: "codewithme",
    displayName: "Code With Me",
    bio: "Making coding fun 💻 | React, TypeScript, Next.js tutorials",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=codewithme&backgroundColor=d1f4d1",
  },
];

const DEMO_VIDEOS = [
  {
    title: "Big Buck Bunny — Epic Open Source Animation!",
    description: "The classic open-source animation that started it all. Incredible detail and storytelling from the Blender Foundation.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    tags: JSON.stringify(["animation", "funny", "cute", "art"]),
    views: 124500,
    userId: "demo_user_1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Elephant Dream — Surreal Short Film",
    description: "A visually stunning surrealist journey. Made entirely with Blender. The first open movie ever made.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    tags: JSON.stringify(["animation", "art", "surreal", "blender"]),
    views: 87300,
    userId: "demo_user_2",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: "For Bigger Blazes 🔥",
    description: "Feel the heat. An intense cinematic experience you won't forget.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    tags: JSON.stringify(["action", "cinematic", "fire", "intense"]),
    views: 56200,
    userId: "demo_user_3",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: "For Bigger Escapes 🌊",
    description: "Sometimes you need to escape. Pack your bags and let's go.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    tags: JSON.stringify(["travel", "nature", "relaxing", "escape"]),
    views: 71400,
    userId: "demo_user_4",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: "For Bigger Fun! 🎉",
    description: "Pure joy in video form. Sharing this with everyone I know!",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    tags: JSON.stringify(["funny", "comedy", "entertainment", "fun"]),
    views: 198700,
    userId: "demo_user_5",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    title: "For Bigger Joyrides 🚗",
    description: "Hit the open road with nothing but vibes and good music.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    tags: JSON.stringify(["travel", "cars", "adventure", "road"]),
    views: 43100,
    userId: "demo_user_1",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Subaru Outback — Off-Road Test Drive",
    description: "Taking the Subaru Outback where it was born to go. Raw unfiltered footage.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    tags: JSON.stringify(["cars", "offroad", "adventure", "auto"]),
    views: 62900,
    userId: "demo_user_2",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Tears of Steel — Sci-Fi Short",
    description: "Robots vs humans in this stunning Blender Foundation sci-fi short. The visuals are insane.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    tags: JSON.stringify(["scifi", "robots", "animation", "blender"]),
    views: 155400,
    userId: "demo_user_3",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Volkswagen GTI — Full Review",
    description: "Is the GTI still the king of hot hatches? After 3 weeks of driving — here's the verdict.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    tags: JSON.stringify(["cars", "review", "auto", "hot-hatch"]),
    views: 91200,
    userId: "demo_user_4",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: "We Are Going On Bullrun 🏎️",
    description: "The craziest road trip you'll ever see. Buckle up, it gets wild fast.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    tags: JSON.stringify(["cars", "travel", "adventure", "race"]),
    views: 113700,
    userId: "demo_user_5",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: "What Car Can You Get For A Grand 💰",
    description: "Budget car buying guide — what's actually worth buying with $1000?",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    tags: JSON.stringify(["cars", "budget", "tips", "guide"]),
    views: 78500,
    userId: "demo_user_6",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Big Buck Bunny — Director's Cut",
    description: "Extended version with behind the scenes commentary from the Blender team.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    tags: JSON.stringify(["animation", "bts", "blender", "art"]),
    views: 34200,
    userId: "demo_user_7",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Coding at 3AM — Vlog",
    description: "What actually happens when you code late into the night. Spoiler: bugs everywhere.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    tags: JSON.stringify(["coding", "tech", "vlog", "dev"]),
    views: 29800,
    userId: "demo_user_8",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Night Drive Aesthetic 🌙",
    description: "City lights, lo-fi beats, no destination. Just drive.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    tags: JSON.stringify(["aesthetic", "night", "chill", "vibes"]),
    views: 88100,
    userId: "demo_user_7",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    title: "Street Food Tour — Tokyo 🍜",
    description: "5 hours, 12 dishes, one incredible city. This is how you eat in Tokyo.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    tags: JSON.stringify(["food", "travel", "tokyo", "streetfood"]),
    views: 167300,
    userId: "demo_user_3",
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
  },
];

// Comments per video (realistic social media style)
const DEMO_COMMENTS: { videoIndex: number; userId: string; text: string }[] = [
  // Video 0 - Big Buck Bunny
  { videoIndex: 0, userId: "demo_user_2", text: "This never gets old 😭❤️" },
  { videoIndex: 0, userId: "demo_user_3", text: "The Blender Foundation honestly goated for releasing this for free" },
  { videoIndex: 0, userId: "demo_user_5", text: "Showed this to my 5 year old and she cried 😭" },
  { videoIndex: 0, userId: "demo_user_6", text: "The animation quality for its time was INSANE" },
  { videoIndex: 0, userId: "demo_user_7", text: "The butterfly scene 💙" },
  { videoIndex: 0, userId: "demo_user_8", text: "This is literally nostalgia in video form" },

  // Video 1 - Elephant Dream
  { videoIndex: 1, userId: "demo_user_1", text: "The surreal vibes in this are unmatched" },
  { videoIndex: 1, userId: "demo_user_4", text: "First open movie ever made, still holds up" },
  { videoIndex: 1, userId: "demo_user_6", text: "The storytelling is so cryptic and I love it" },
  { videoIndex: 1, userId: "demo_user_3", text: "Watched this in film class once, changed my life lmao" },

  // Video 2 - Blazes
  { videoIndex: 2, userId: "demo_user_1", text: "The cinematography 🔥🔥🔥" },
  { videoIndex: 2, userId: "demo_user_5", text: "This is giving me adrenaline just watching" },
  { videoIndex: 2, userId: "demo_user_7", text: "Volume up is mandatory for this one" },

  // Video 3 - Escapes
  { videoIndex: 3, userId: "demo_user_2", text: "I need to be here RIGHT NOW" },
  { videoIndex: 3, userId: "demo_user_6", text: "packing my bags as we speak" },
  { videoIndex: 3, userId: "demo_user_8", text: "Why does this make me want to quit my job" },
  { videoIndex: 3, userId: "demo_user_1", text: "The color grading is gorgeous" },
  { videoIndex: 3, userId: "demo_user_5", text: "Serenity in video form 🌊" },

  // Video 4 - For Bigger Fun
  { videoIndex: 4, userId: "demo_user_3", text: "SENT THIS TO EVERYONE I KNOW" },
  { videoIndex: 4, userId: "demo_user_2", text: "My day went from 0 to 100 after watching this" },
  { videoIndex: 4, userId: "demo_user_7", text: "The energy 😂😂😂" },
  { videoIndex: 4, userId: "demo_user_6", text: "Already on my third watch" },
  { videoIndex: 4, userId: "demo_user_1", text: "This is the content I'm here for" },
  { videoIndex: 4, userId: "demo_user_8", text: "Absolute chaos and I'm here for it" },

  // Video 5 - Joyrides
  { videoIndex: 5, userId: "demo_user_4", text: "Take me with you next time!!" },
  { videoIndex: 5, userId: "demo_user_3", text: "Weekend plans: sorted ✅" },

  // Video 6 - Subaru
  { videoIndex: 6, userId: "demo_user_5", text: "This makes me want to buy a Subaru immediately" },
  { videoIndex: 6, userId: "demo_user_7", text: "That off-road section was wild" },
  { videoIndex: 6, userId: "demo_user_1", text: "The AWD system on these is genuinely impressive" },
  { videoIndex: 6, userId: "demo_user_3", text: "Subaru owners really do live the best life" },

  // Video 7 - Tears of Steel
  { videoIndex: 7, userId: "demo_user_6", text: "The VFX budget was $0 and it still looks better than some Hollywood films" },
  { videoIndex: 7, userId: "demo_user_2", text: "Open source doing it better than the studios again" },
  { videoIndex: 7, userId: "demo_user_8", text: "I wrote my thesis on this short film" },
  { videoIndex: 7, userId: "demo_user_4", text: "The robot design is so creative" },
  { videoIndex: 7, userId: "demo_user_1", text: "This deserved a feature length" },

  // Video 8 - GTI Review
  { videoIndex: 8, userId: "demo_user_5", text: "The GTI is just the perfect daily driver, change my mind" },
  { videoIndex: 8, userId: "demo_user_3", text: "Ordered one after watching this, no regrets" },
  { videoIndex: 8, userId: "demo_user_1", text: "The interior alone justifies the price" },

  // Video 9 - Bullrun
  { videoIndex: 9, userId: "demo_user_6", text: "THIS IS INSANE HOW IS THIS REAL" },
  { videoIndex: 9, userId: "demo_user_2", text: "I want to do this before I die" },
  { videoIndex: 9, userId: "demo_user_4", text: "The coordination involved in this is remarkable" },
  { videoIndex: 9, userId: "demo_user_7", text: "My heart was racing the whole time" },
  { videoIndex: 9, userId: "demo_user_8", text: "The cars in this video cost more than my neighborhood" },

  // Video 10 - Budget Car
  { videoIndex: 10, userId: "demo_user_3", text: "Actually super helpful, sharing this with my brother" },
  { videoIndex: 10, userId: "demo_user_5", text: "The Honda Civic recommendation was spot on" },
  { videoIndex: 10, userId: "demo_user_1", text: "More practical content like this please!!" },

  // Video 11 - BBB Director's Cut
  { videoIndex: 11, userId: "demo_user_2", text: "BTS content always hits different" },
  { videoIndex: 11, userId: "demo_user_5", text: "Watching this at 2am, crying in creative 😭" },

  // Video 12 - Coding 3am
  { videoIndex: 12, userId: "demo_user_2", text: "Me every Sunday night before a Monday deadline" },
  { videoIndex: 12, userId: "demo_user_4", text: "The relatability is off the charts" },
  { videoIndex: 12, userId: "demo_user_7", text: "The bug at 4:47 was genuinely painful to watch lmao" },
  { videoIndex: 12, userId: "demo_user_1", text: "How do you make debugging look aesthetic" },

  // Video 13 - Night Drive
  { videoIndex: 13, userId: "demo_user_4", text: "This is my personality in video form" },
  { videoIndex: 13, userId: "demo_user_6", text: "The lofi + city lights combo is undefeated" },
  { videoIndex: 13, userId: "demo_user_8", text: "Rain on the windshield would've made this perfect" },
  { videoIndex: 13, userId: "demo_user_5", text: "I live for this kind of content" },
  { videoIndex: 13, userId: "demo_user_3", text: "Playing this on my tv as a screensaver" },

  // Video 14 - Tokyo Food
  { videoIndex: 14, userId: "demo_user_1", text: "I would literally move to Tokyo just for the food" },
  { videoIndex: 14, userId: "demo_user_7", text: "The ramen spot at 3:22 — please give address" },
  { videoIndex: 14, userId: "demo_user_2", text: "This made me so hungry at 11pm, thanks" },
  { videoIndex: 14, userId: "demo_user_4", text: "The yakitori scene 😭 I need to go" },
  { videoIndex: 14, userId: "demo_user_8", text: "Came for the food, stayed for the cinematography" },
  { videoIndex: 14, userId: "demo_user_5", text: "This is basically a travel documentary at this point" },
];

// Likes — spread across all videos with realistic distribution
function buildLikes() {
  const pairs: { userId: string; videoIndex: number }[] = [];
  const userIds = DEMO_USERS.map((u) => u.id);

  DEMO_VIDEOS.forEach((_, vi) => {
    // Each video gets liked by a random subset of users
    const shuffled = [...userIds].sort(() => Math.random() - 0.5);
    const count = 2 + Math.floor(Math.random() * (userIds.length - 1));
    shuffled.slice(0, count).forEach((uid) => {
      pairs.push({ userId: uid, videoIndex: vi });
    });
  });

  return pairs;
}

// Saves — a smaller subset
function buildSaves() {
  const pairs: { userId: string; videoIndex: number }[] = [];
  const userIds = DEMO_USERS.map((u) => u.id);

  DEMO_VIDEOS.forEach((_, vi) => {
    const shuffled = [...userIds].sort(() => Math.random() - 0.5);
    const count = Math.floor(Math.random() * 3);
    shuffled.slice(0, count).forEach((uid) => {
      pairs.push({ userId: uid, videoIndex: vi });
    });
  });

  return pairs;
}

// Follow pairs — dense social graph
const FOLLOW_PAIRS = [
  ["demo_user_1", "demo_user_2"],
  ["demo_user_1", "demo_user_3"],
  ["demo_user_1", "demo_user_5"],
  ["demo_user_1", "demo_user_7"],
  ["demo_user_2", "demo_user_1"],
  ["demo_user_2", "demo_user_4"],
  ["demo_user_2", "demo_user_8"],
  ["demo_user_3", "demo_user_1"],
  ["demo_user_3", "demo_user_4"],
  ["demo_user_3", "demo_user_6"],
  ["demo_user_4", "demo_user_5"],
  ["demo_user_4", "demo_user_3"],
  ["demo_user_4", "demo_user_7"],
  ["demo_user_5", "demo_user_1"],
  ["demo_user_5", "demo_user_2"],
  ["demo_user_5", "demo_user_6"],
  ["demo_user_6", "demo_user_3"],
  ["demo_user_6", "demo_user_7"],
  ["demo_user_6", "demo_user_8"],
  ["demo_user_7", "demo_user_1"],
  ["demo_user_7", "demo_user_4"],
  ["demo_user_7", "demo_user_5"],
  ["demo_user_8", "demo_user_2"],
  ["demo_user_8", "demo_user_6"],
  ["demo_user_8", "demo_user_1"],
];

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert users
  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: user,
      update: { bio: user.bio, displayName: user.displayName, avatar: user.avatar },
    });
  }
  console.log(`✅ Upserted ${DEMO_USERS.length} demo users`);

  // Upsert videos
  const videoRecords = [];
  for (const video of DEMO_VIDEOS) {
    const existing = await prisma.video.findFirst({ where: { url: video.url, userId: video.userId } });
    if (!existing) {
      const record = await prisma.video.create({ data: video });
      videoRecords.push(record);
    } else {
      await prisma.video.update({
        where: { id: existing.id },
        data: { views: video.views, tags: video.tags },
      });
      videoRecords.push(existing);
    }
  }
  console.log(`✅ Upserted ${videoRecords.length} demo videos`);

  // Follows
  let followCount = 0;
  for (const [followerId, followingId] of FOLLOW_PAIRS) {
    await prisma.follow
      .upsert({
        where: { followerId_followingId: { followerId, followingId } },
        create: { followerId, followingId },
        update: {},
      })
      .catch(() => {});
    followCount++;
  }
  console.log(`✅ Created ${followCount} follow relationships`);

  // Likes
  const likes = buildLikes();
  let likeCount = 0;
  for (const { userId, videoIndex } of likes) {
    const video = videoRecords[videoIndex];
    if (!video) continue;
    await prisma.like
      .upsert({
        where: { userId_videoId: { userId, videoId: video.id } },
        create: { userId, videoId: video.id },
        update: {},
      })
      .catch(() => {});
    likeCount++;
  }
  console.log(`✅ Created ${likeCount} likes`);

  // Saves
  const saves = buildSaves();
  let saveCount = 0;
  for (const { userId, videoIndex } of saves) {
    const video = videoRecords[videoIndex];
    if (!video) continue;
    await prisma.save
      .upsert({
        where: { userId_videoId: { userId, videoId: video.id } },
        create: { userId, videoId: video.id },
        update: {},
      })
      .catch(() => {});
    saveCount++;
  }
  console.log(`✅ Created ${saveCount} saves`);

  // Comments
  let commentCount = 0;
  for (const { videoIndex, userId, text } of DEMO_COMMENTS) {
    const video = videoRecords[videoIndex];
    if (!video) continue;
    // Check if this exact comment already exists
    const existing = await prisma.comment.findFirst({
      where: { userId, videoId: video.id, text },
    });
    if (!existing) {
      await prisma.comment.create({ data: { userId, videoId: video.id, text } });
      commentCount++;
    }
  }
  console.log(`✅ Created ${commentCount} comments`);

  // Views (for recommendation affinity)
  const viewPairs: { userId: string; videoIndex: number; watchTime: number }[] = [];
  const userIds = DEMO_USERS.map((u) => u.id);
  DEMO_VIDEOS.forEach((_, vi) => {
    const shuffled = [...userIds].sort(() => Math.random() - 0.5);
    const count = 3 + Math.floor(Math.random() * 5);
    shuffled.slice(0, count).forEach((uid) => {
      viewPairs.push({ userId: uid, videoIndex: vi, watchTime: 3 + Math.floor(Math.random() * 30) });
    });
  });
  let viewCount = 0;
  for (const { userId, videoIndex, watchTime } of viewPairs) {
    const video = videoRecords[videoIndex];
    if (!video) continue;
    const existing = await prisma.view.findFirst({ where: { userId, videoId: video.id } });
    if (!existing) {
      await prisma.view.create({ data: { userId, videoId: video.id, watchTime } }).catch(() => {});
      viewCount++;
    }
  }
  console.log(`✅ Created ${viewCount} view records`);

  console.log("🎉 Seed complete! The app is now populated with rich demo data.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
