const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
};

module.exports = notFoundHandler;
