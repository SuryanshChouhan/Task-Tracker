function notFoundHandler(req, res, next) {
  return res.status(404).json({
    success: false,
    data: null,
    error: { field: "route", message: "Not found" }
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const field = err.field || "server";
  const message = err.message || "Server error";

  return res.status(statusCode).json({
    success: false,
    data: null,
    error: { field, message }
  });
}

module.exports = { notFoundHandler, errorHandler };
