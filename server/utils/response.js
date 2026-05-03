function sendSuccess(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

function sendError(res, status, field, message) {
  return res.status(status).json({
    success: false,
    data: null,
    error: { field, message }
  });
}

module.exports = { sendSuccess, sendError };
