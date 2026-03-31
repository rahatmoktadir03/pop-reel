import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    id: "demo_user_1",
    username: "dancequeen",
    displayName: "Dance Queen 💃",
    bio: "Teaching the world to groove, one video at a time 🎵",
    avatar: null,
  },
  {
    id: "demo_user_2",
    username: "techgeek99",
    displayName: "Tech Geek 🤓",
    bio: "Breaking down the latest in tech. CS grad, coffee addict.",
    avatar: null,
  },
  {
    id: "demo_user_3",
    username: "foodielife",
    displayName: "Foodie Life 🍕",
    bio: "Eating my way around the world. DMs open for food collabs!",
    avatar: null,
  },
  {
    id: "demo_user_4",
    username: "naturelens",
    displayName: "Nature Lens 🌿",
    bio: "Capturing the beauty of our planet. 📸",
    avatar: null,
  },
  {
    id: "demo_user_5",
    username: "fitnessguru",
    displayName: "Fitness Guru 💪",
    bio: "Daily workouts, nutrition tips. Let's get moving!",
    avatar: null,
  },
];

const DEMO_VIDEOS = [
  {
    title: "Big Buck Bunny — Epic Open Source Animation!",
    description:
      "The classic open-source animation that started it all. Incredible detail and storytelling.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    tags: JSON.stringify(["animation", "funny", "cute", "art"]),
    views: 45200,
    userId: "demo_user_1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Elephant Dream — Surreal Short Film",
    description: "A visually stunning surrealist journey. Made entirely with Blender.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    tags: JSON.stringify(["animation", "art", "surreal", "blender"]),
    views: 31800,
    userId: "demo_user_2",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: "For Bigger Blazes 🔥",
    description: "Feel the heat. An intense cinematic experience.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    tags: JSON.stringify(["action", "cinematic", "fire", "intense"]),
    views: 18500,
    userId: "demo_user_3",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: "For Bigger Escapes 🌊",
    description: "Sometimes you need to escape. This is that video.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    tags: JSON.stringify(["travel", "nature", "relaxing", "escape"]),
    views: 22100,
    userId: "demo_user_4",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: "For Bigger Fun! 🎉",
    description: "Pure joy in video form. You're welcome.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    tags: JSON.stringify(["funny", "comedy", "entertainment", "fun"]),
    views: 67800,
    userId: "demo_user_5",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    title: "For Bigger Joyrides 🚗",
    description: "Hit the open road. Nothing better than this.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    tags: JSON.stringify(["travel", "cars", "adventure", "road"]),
    views: 14300,
    userId: "demo_user_1",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Subaru Outback — Off-Road Test Drive",
    description: "Taking the Subaru Outback where it was born to go. Raw footage.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    tags: JSON.stringify(["cars", "offroad", "adventure", "auto"]),
    views: 29600,
    userId: "demo_user_2",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Tears of Steel — Sci-Fi Short",
    description:
      "Robots vs humans in this stunning Blender Foundation sci-fi short film.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    tags: JSON.stringify(["scifi", "robots", "animation", "blender"]),
    views: 55400,
    userId: "demo_user_3",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Volkswagen GTI — Full Review",
    description: "Is the GTI still the king of hot hatches? We find out.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    tags: JSON.stringify(["cars", "review", "auto", "hot-hatch"]),
    views: 38200,
    userId: "demo_user_4",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: "We Are Going On Bullrun 🏎️",
    description: "The craziest road trip you'll ever see. Buckle up.",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    tags: JSON.stringify(["cars", "travel", "adventure", "race"]),
    views: 41700,
    userId: "demo_user_5",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: "What Care Can You Get For A Grand 💰",
    description: "Budget car buying guide. What's actually worth it?",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    tags: JSON.stringify(["cars", "budget", "tips", "guide"]),
    views: 25900,
    userId: "demo_user_1",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
];

const DEMO_LIKES = [
  // video 1 gets 1200 likes from first users
  ...Array.from({ length: 12 }, (_, i) => ({
    userId: "demo_user_" + ((i % 5) + 1),
    videoIndex: 0,
  })),
];

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert demo users
  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: user,
      update: { bio: user.bio, displayName: user.displayName },
    });
  }
  console.log(`✅ Created ${DEMO_USERS.length} demo users`);

  // Upsert demo videos (check if URL already exists to avoid dupes)
  const videoRecords = [];
  for (const video of DEMO_VIDEOS) {
    const existing = await prisma.video.findFirst({
      where: { url: video.url },
    });
    if (!existing) {
      const record = await prisma.video.create({ data: video });
      videoRecords.push(record);
    } else {
      videoRecords.push(existing);
    }
  }
  console.log(`✅ Created/found ${videoRecords.length} demo videos`);

  // Add some follows
  const followPairs = [
    ["demo_user_1", "demo_user_2"],
    ["demo_user_1", "demo_user_3"],
    ["demo_user_2", "demo_user_1"],
    ["demo_user_3", "demo_user_4"],
    ["demo_user_4", "demo_user_5"],
    ["demo_user_5", "demo_user_1"],
  ];
  for (const [followerId, followingId] of followPairs) {
    await prisma.follow
      .upsert({
        where: { followerId_followingId: { followerId, followingId } },
        create: { followerId, followingId },
        update: {},
      })
      .catch(() => {});
  }
  console.log(`✅ Created follow relationships`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
