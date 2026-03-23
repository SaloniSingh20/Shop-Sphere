function notFound(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(error, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(error);
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";
  res.status(statusCode).json({ message });
}

module.exports = {
  notFound,
  errorHandler,
};
