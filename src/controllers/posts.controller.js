const postsService = require("../services/posts.service");

function parsePositiveInt(val) {
  if (val === undefined) return null;
  if (!/^\d+$/.test(val)) return NaN;
  const num = parseInt(val, 10);
  return num > 0 ? num : NaN;
}

const ALLOWED_SORT_BY = ["createdAt", "updatedAt", "likes"];
const ALLOWED_ORDER = ["asc", "desc"];

async function create(req, res) {
  const { imageUrl, caption, location, authorId } = req.body;

  if (!imageUrl || !authorId) {
    return res.status(400).json({ error: "imageUrl and authorId are required" });
  }

  try {
    const post = await postsService.createPost({ imageUrl, caption, location, authorId });
    return res.status(201).json(post);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function list(req, res) {
  let page = 1;
  let limit = 10;
  let sortBy = "createdAt";
  let order = "desc";
  let location;
  let search;
  let from;
  let to;

  if (req.query.page !== undefined) {
    const parsedPage = parsePositiveInt(req.query.page);
    if (!parsedPage || isNaN(parsedPage)) {
      return res.status(400).json({ error: "page and limit must be positive integers" });
    }
    page = parsedPage;
  }

  if (req.query.limit !== undefined) {
    const parsedLimit = parsePositiveInt(req.query.limit);
    if (!parsedLimit || isNaN(parsedLimit)) {
      return res.status(400).json({ error: "page and limit must be positive integers" });
    }
    limit = Math.min(parsedLimit, 50);
  }

  if (req.query.sortBy !== undefined) {
    if (!ALLOWED_SORT_BY.includes(req.query.sortBy)) {
      return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt, likes" });
    }
    sortBy = req.query.sortBy;
  }

  if (req.query.order !== undefined) {
    if (!ALLOWED_ORDER.includes(req.query.order)) {
      return res.status(400).json({ error: "order must be asc or desc" });
    }
    order = req.query.order;
  }

  if (req.query.location !== undefined && req.query.location !== "") {
    location = req.query.location;
  }

  if (req.query.search !== undefined && req.query.search !== "") {
    search = req.query.search;
  }

  if (req.query.from !== undefined) {
    const fromDate = new Date(req.query.from);
    if (isNaN(fromDate.getTime())) {
      return res.status(400).json({ error: "from and to must be valid dates" });
    }
    from = fromDate;
  }

  if (req.query.to !== undefined) {
    const toDate = new Date(req.query.to);
    if (isNaN(toDate.getTime())) {
      return res.status(400).json({ error: "from and to must be valid dates" });
    }
    to = toDate;
  }

  try {
    const result = await postsService.listPosts({
      page,
      limit,
      sortBy,
      order,
      location,
      search,
      from,
      to,
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getOne(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    const post = await postsService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  const id = parseInt(req.params.id, 10);
  const { caption, location } = req.body;

  try {
    const updatedPost = await postsService.updatePost(id, {
      caption,
      location,
    });
    return res.status(200).json(updatedPost);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    await postsService.deletePost(id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getLikes(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    const likes = await postsService.getPostLikes(id);
    if (!likes) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(likes);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  getLikes,
};
