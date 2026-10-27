function parsePagination(query) {
  let page = 1;
  let limit = 10;

  if (query.page !== undefined) {
    if (!/^\d+$/.test(query.page)) {
      return { error: "page and limit must be positive integers" };
    }
    const parsedPage = parseInt(query.page, 10);
    if (parsedPage <= 0) {
      return { error: "page and limit must be positive integers" };
    }
    page = parsedPage;
  }

  if (query.limit !== undefined) {
    if (!/^\d+$/.test(query.limit)) {
      return { error: "page and limit must be positive integers" };
    }
    const parsedLimit = parseInt(query.limit, 10);
    if (parsedLimit <= 0) {
      return { error: "page and limit must be positive integers" };
    }
    limit = Math.min(parsedLimit, 50);
  }

  return { page, limit };
}

module.exports = {
  parsePagination,
};
