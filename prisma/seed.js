const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function main() {
  try {
    // 1. Delete all rows from all three tables (children first)
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create all users in one query, returning created rows
    const createdUsers = await prisma.user.createManyAndReturn({
      data: users,
    });

    // 3. Lookup: username -> id
    const userMap = new Map();
    for (const u of createdUsers) {
      userMap.set(u.username, u.id);
    }

    // 4. Map posts replacing author username with real authorId
    const postData = posts.map((p) => {
      const authorId = userMap.get(p.author);
      return {
        imageUrl: p.imageUrl,
        caption: p.caption,
        location: p.location,
        createdAt: p.createdAt,
        authorId,
      };
    });

    const createdPosts = await prisma.post.createManyAndReturn({
      data: postData,
    });

    // 5. Lookup: insta## -> post id
    // "https://picsum.photos/seed/insta01/600/600".split("/") -> index 4 is "insta01"
    const postMap = new Map();
    for (const p of createdPosts) {
      const parts = p.imageUrl.split("/");
      const key = parts[4];
      postMap.set(key, p.id);
    }

    // 6. Map likes using real userId and postId
    const likeData = likes.map((l) => ({
      userId: userMap.get(l.user),
      postId: postMap.get(l.post),
    }));

    const createdLikes = await prisma.like.createManyAndReturn({
      data: likeData,
    });

    // 7. Print seeded numbers from returned results
    console.log(
      `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    // 8. Disconnect client
    await prisma.$disconnect();
  }
}

main();
