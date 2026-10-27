const usersService = require("../services/users.service");
const { parsePagination } = require("../utils/pagination");

function parsePositiveInt(val) {
  if (val === undefined) return null;
  if (!/^\d+$/.test(val)) return NaN;
  const num = parseInt(val, 10);
  return num > 0 ? num : NaN;
}

const ALLOWED_SORT_BY = ["createdAt", "username", "fullname"];
const ALLOWED_ORDER = ["asc", "desc"];

async function create(req, res) {
  const { username, email, fullname, bio } = req.body;

  if (!username || !email || !fullname) {
    return res
      .status(400)
      .json({ error: "username, email and fullname are required" });
  }

  try {
    const user = await usersService.createUser({ username, email, fullname, bio });
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "username or email already taken" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function list(req, res) {
  let page = 1;
  let limit = 10;
  let sortBy = "createdAt";
  let order = "desc";
  let isPrivate;
  let search;
  let hasPosts;

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
      return res.status(400).json({ error: "sortBy must be one of: createdAt, username, fullname" });
    }
    sortBy = req.query.sortBy;
  }

  if (req.query.order !== undefined) {
    if (!ALLOWED_ORDER.includes(req.query.order)) {
      return res.status(400).json({ error: "order must be asc or desc" });
    }
    order = req.query.order;
  }

  if (req.query.isPrivate !== undefined) {
    if (req.query.isPrivate === "true") {
      isPrivate = true;
    } else if (req.query.isPrivate === "false") {
      isPrivate = false;
    } else {
      return res.status(400).json({ error: "isPrivate must be true or false" });
    }
  }

  if (req.query.hasPosts !== undefined) {
    if (req.query.hasPosts === "true") {
      hasPosts = true;
    } else if (req.query.hasPosts === "false") {
      hasPosts = false;
    } else {
      return res.status(400).json({ error: "hasPosts must be true or false" });
    }
  }

  if (req.query.search !== undefined && req.query.search !== "") {
    search = req.query.search;
  }

  try {
    const result = await usersService.listUsers({ page, limit, sortBy, order, isPrivate, search, hasPosts });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getOne(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    const user = await usersService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  const id = parseInt(req.params.id, 10);
  const { fullname, bio, isPrivate } = req.body;

  try {
    const updatedUser = await usersService.updateUser(id, {
      fullname,
      bio,
      isPrivate,
    });
    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    await usersService.deleteUser(id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function listUserPosts(req, res) {
  const userId = parseInt(req.params.id, 10);
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await usersService.getUserPosts(userId, pagination);
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function listUserLikedPosts(req, res) {
  const userId = parseInt(req.params.id, 10);
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await usersService.getUserLikedPosts(userId, pagination);
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(result);
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
  listUserPosts,
  listUserLikedPosts,
};
