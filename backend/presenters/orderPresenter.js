const orderModel = require("../models/orderModel");
const orderView = require("../views/orderView");

function parseOrderPayload(body) {
  const { book_id, quantity } = body;
  const date_time =
    body.date_time ?? body.dateTime ?? body.date ?? body["date_&_time"];

  if (book_id === undefined || book_id === null || book_id === "") {
    return { error: "book_id is required" };
  }

  const parsedBookId = Number(book_id);
  const parsedQuantity = Number(quantity);

  if (Number.isNaN(parsedBookId) || !Number.isInteger(parsedBookId) || parsedBookId <= 0) {
    return { error: "book_id must be a valid positive integer" };
  }

  if (Number.isNaN(parsedQuantity) || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    return { error: "quantity must be a valid positive integer" };
  }

  if (date_time === undefined || date_time === null || date_time === "") {
    return { error: "date_time is required (e.g. 2026-03-15 or 2026-03-15T14:30:00)" };
  }

  const date = new Date(date_time);

  if (Number.isNaN(date.getTime())) {
    return { error: "date_time must be a valid date (e.g. 2026-03-15 or 2026-03-15T14:30:00)" };
  }

  return {
    data: {
      bookId: parsedBookId,
      quantity: parsedQuantity,
      dateTime: date.toISOString(),
    },
  };
}

function parseOptionalNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return { error: `${fieldName} must be a valid number` };
  }

  return { value: parsed };
}

function parseOrderUpdatePayload(body) {
  const { book, author, quantity, unit_price, revenue, profit } = body;
  const date_time =
    body.date_time ?? body.dateTime ?? body.date ?? body["date_&_time"];

  if (!book || String(book).trim() === "") {
    return { error: "book is required" };
  }

  if (!author || String(author).trim() === "") {
    return { error: "author is required" };
  }

  if (date_time === undefined || date_time === null || date_time === "") {
    return { error: "date_time is required (e.g. 2026-03-15 or 2026-03-15T14:30:00)" };
  }

  const date = new Date(date_time);

  if (Number.isNaN(date.getTime())) {
    return { error: "date_time must be a valid date (e.g. 2026-03-15 or 2026-03-15T14:30:00)" };
  }

  const parsedQuantity = Number(quantity);

  if (Number.isNaN(parsedQuantity) || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    return { error: "quantity must be a valid positive integer" };
  }

  const parsedUnitPrice = Number(unit_price);

  if (Number.isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
    return { error: "unit_price must be a valid non-negative number" };
  }

  const parsedRevenue = parseOptionalNumber(revenue, "revenue");
  if (parsedRevenue.error) {
    return { error: parsedRevenue.error };
  }

  const parsedProfit = parseOptionalNumber(profit, "profit");
  if (parsedProfit.error) {
    return { error: parsedProfit.error };
  }

  return {
    data: {
      dateTime: date.toISOString(),
      book: String(book).trim(),
      author: String(author).trim(),
      quantity: parsedQuantity,
      unit_price: parsedUnitPrice,
      revenue: parsedRevenue.value ?? parsedUnitPrice * parsedQuantity,
      profit: parsedProfit.value,
    },
  };
}

const orderPresenter = {
  async getAllOrders(req, res) {
    try {
      const orders = await orderModel.findAll();
      orderView.sendList(res, orders);
    } catch (err) {
      orderView.sendError(res, err.message);
    }
  },

  async getOrderById(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return orderView.sendBadRequest(res, "id must be a number");
      }

      const order = await orderModel.findById(id);

      if (!order) {
        return orderView.sendNotFound(res);
      }

      orderView.sendSuccess(res, order);
    } catch (err) {
      orderView.sendError(res, err.message);
    }
  },

  async createOrder(req, res) {
    try {
      const parsed = parseOrderPayload(req.body);

      if (parsed.error) {
        return orderView.sendBadRequest(res, parsed.error);
      }

      const result = await orderModel.createSale(parsed.data);

      if (result.error) {
        return orderView.sendError(res, result.error, result.status);
      }

      orderView.sendSuccess(res, result.data, 201);
    } catch (err) {
      orderView.sendError(res, err.message);
    }
  },

  async updateOrder(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return orderView.sendBadRequest(res, "id must be a number");
      }

      const parsed = parseOrderUpdatePayload(req.body);

      if (parsed.error) {
        return orderView.sendBadRequest(res, parsed.error);
      }

      const result = await orderModel.update(id, parsed.data);

      if (result.error) {
        return orderView.sendError(res, result.error, result.status);
      }

      orderView.sendSuccess(res, result.data);
    } catch (err) {
      orderView.sendError(res, err.message);
    }
  },

  async deleteOrder(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return orderView.sendBadRequest(res, "id must be a number");
      }

      const deleted = await orderModel.remove(id);

      if (!deleted) {
        return orderView.sendNotFound(res);
      }

      orderView.sendSuccess(res, { id: deleted.id, message: "Order deleted successfully" });
    } catch (err) {
      orderView.sendError(res, err.message);
    }
  },
};

module.exports = orderPresenter;
