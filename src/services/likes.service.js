const prisma = require("../db");

async function addLike(postId, userId) {
  // Check in this order: post exists -> user exists -> insert like
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  if (!post) {
    return { error: "Post not found", status: 404 };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return { error: "User not found", status: 404 };
  }

  try {
    const like = await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });
    return { data: like, status: 201 };
  } catch (error) {
    if (error.code === "P2002") {
      return { error: "Already liked", status: 409 };
    }
    throw error;
  }
}

async function removeLike(postId, userId) {
  try {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return { status: 204 };
  } catch (error) {
    if (error.code === "P2025") {
      return { error: "Like not found", status: 404 };
    }
    throw error;
  }
}

module.exports = {
  addLike,
  removeLike,
};
