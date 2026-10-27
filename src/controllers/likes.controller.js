const likesService = require("../services/likes.service");

async function likePost(req, res) {
  const postId = parseInt(req.params.id, 10);
  const { userId } = req.body;

  if (userId === undefined || userId === null) {
    return res.status(400).json({ error: "userId is required" });
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const result = await likesService.addLike(postId, parsedUserId);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(201).json(result.data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function unlikePost(req, res) {
  const postId = parseInt(req.params.id, 10);
  const userId = parseInt(req.params.userId, 10);

  try {
    const result = await likesService.removeLike(postId, userId);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  likePost,
  unlikePost,
};
