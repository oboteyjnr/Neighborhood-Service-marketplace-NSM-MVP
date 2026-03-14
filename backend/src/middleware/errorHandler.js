function notFoundHandler(req, res) {
  return res.status(404).json({ message: "Not Found" });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  const payload = {
    message: err.message || "Internal Server Error"
  };

  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.stack = err.stack;
  }

  return res.status(status).json(payload);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
