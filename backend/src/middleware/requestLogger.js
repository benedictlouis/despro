const requestLogger = (req, res, next) => {
  const start = Date.now();

  console.log(`${req.method} ${req.originalUrl}`, {
    body: req.body,
    query: req.query,
    params: req.params,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
