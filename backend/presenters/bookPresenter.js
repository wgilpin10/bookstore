const bookModel = require("../models/bookModel");
const bookView = require("../views/bookView");

function parseOptionalNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < 0) {
    return { error: `${fieldName} must be a valid non-negative number` };
  }

  return { value: parsed };
}

function parseBookPayload(body) {
  const { title, author, price, quantity, cost_price } = body;

  if (!title || !author) {
    return { error: "title and author are required" };
  }

  const parsedPrice = Number(price);
  const parsedQuantity = Number(quantity);

  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return { error: "price must be a valid non-negative number" };
  }

  if (Number.isNaN(parsedQuantity) || !Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
    return { error: "quantity must be a valid non-negative integer" };
  }

  const parsedCostPrice = parseOptionalNumber(cost_price, "cost_price");
  if (parsedCostPrice.error) {
    return { error: parsedCostPrice.error };
  }

  return {
    data: {
      title: String(title).trim(),
      author: String(author).trim(),
      price: parsedPrice,
      quantity: parsedQuantity,
      cost_price: parsedCostPrice.value,
    },
  };
}

const bookPresenter = {
  async getAllBooks(req, res) {
    try {
      const books = await bookModel.findAll();
      bookView.sendList(res, books);
    } catch (err) {
      bookView.sendError(res, err.message);
    }
  },

  async getBookById(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return bookView.sendBadRequest(res, "id must be a number");
      }

      const book = await bookModel.findById(id);

      if (!book) {
        return bookView.sendNotFound(res);
      }

      bookView.sendSuccess(res, book);
    } catch (err) {
      bookView.sendError(res, err.message);
    }
  },

  async createBook(req, res) {
    try {
      const parsed = parseBookPayload(req.body);

      if (parsed.error) {
        return bookView.sendBadRequest(res, parsed.error);
      }

      const book = await bookModel.create(parsed.data);
      bookView.sendSuccess(res, book, 201);
    } catch (err) {
      bookView.sendError(res, err.message);
    }
  },

  async updateBook(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return bookView.sendBadRequest(res, "id must be a number");
      }

      const parsed = parseBookPayload(req.body);

      if (parsed.error) {
        return bookView.sendBadRequest(res, parsed.error);
      }

      const book = await bookModel.update(id, parsed.data);

      if (!book) {
        return bookView.sendNotFound(res);
      }

      bookView.sendSuccess(res, book);
    } catch (err) {
      bookView.sendError(res, err.message);
    }
  },

  async deleteBook(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return bookView.sendBadRequest(res, "id must be a number");
      }

      const deleted = await bookModel.remove(id);

      if (!deleted) {
        return bookView.sendNotFound(res);
      }

      bookView.sendSuccess(res, { id: deleted.id, message: "Book deleted successfully" });
    } catch (err) {
      bookView.sendError(res, err.message);
    }
  },
};

module.exports = bookPresenter;
