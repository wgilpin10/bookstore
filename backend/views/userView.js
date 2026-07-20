const userView = {
  sendSuccess(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  },

  sendList(res, users) {
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  },

  sendError(res, message, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  },

  sendNotFound(res, message = "User not found") {
    return this.sendError(res, message, 404);
  },

  sendBadRequest(res, message) {
    return this.sendError(res, message, 400);
  },
};

module.exports = userView;
