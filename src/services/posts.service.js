const prisma = require("../db");

async function createPost(data) {
  const { imageUrl, caption, location, authorId } = data;
  return await prisma.post.create({
    data: {
      imageUrl,
      caption: caption ?? null,
      location: location ?? null,
      authorId,
    },
  });
}

async function listPosts({ page, limit, sortBy = "createdAt", order = "desc", location, search, from, to }) {
  const skip = (page - 1) * limit;

  const where = {};

  if (location) {
    where.location = { equals: location, mode: "insensitive" };
  }

  if (search) {
    where.caption = { contains: search, mode: "insensitive" };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = from;
    }
    if (to) {
      where.createdAt.lt = to;
    }
  }

  let prismaOrderBy;
  if (sortBy === "likes") {
    prismaOrderBy = [
      { likes: { _count: order } },
      { createdAt: "desc" },
    ];
  } else {
    prismaOrderBy = { [sortBy]: order };
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: prismaOrderBy,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async function getPostById(id) {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });
}

async function updatePost(id, data) {
  const { caption, location } = data;
  const updateData = {};
  if (caption !== undefined) updateData.caption = caption;
  if (location !== undefined) updateData.location = location;

  return await prisma.post.update({
    where: { id },
    data: updateData,
  });
}

async function deletePost(id) {
  return await prisma.post.delete({
    where: { id },
  });
}

async function getPostLikes(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  if (!post) {
    return null;
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    orderBy: {
      user: {
        username: "asc",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
    },
  });

  return likes.map((l) => l.user);
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostLikes,
};
