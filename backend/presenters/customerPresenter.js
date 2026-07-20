const customerModel = require("../models/customerModel");
const customerView = require("../views/customerView");

function parseOptionalInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    return { error: `${fieldName} must be a valid non-negative integer` };
  }

  return { value: parsed };
}

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

function parseOptionalDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { error: `${fieldName} must be a valid date (e.g. 2026-03-15 or 2026-03-15T14:30:00)` };
  }

  return { value: date.toISOString() };
}

function parseCustomerPayload(body) {
  const { rank, name, phone, sales, total_spent, profit, last_order } = body;

  if (!name || String(name).trim() === "") {
    return { error: "name is required" };
  }

  if (!phone || String(phone).trim() === "") {
    return { error: "phone is required" };
  }

  const parsedRank = parseOptionalInteger(rank, "rank");
  if (parsedRank.error) {
    return { error: parsedRank.error };
  }

  const parsedSales = parseOptionalInteger(sales, "sales");
  if (parsedSales.error) {
    return { error: parsedSales.error };
  }

  const parsedTotalSpent = parseOptionalNumber(total_spent, "total_spent");
  if (parsedTotalSpent.error) {
    return { error: parsedTotalSpent.error };
  }

  const parsedProfit = parseOptionalNumber(profit, "profit");
  if (parsedProfit.error) {
    return { error: parsedProfit.error };
  }

  const parsedLastOrder = parseOptionalDate(last_order, "last_order");
  if (parsedLastOrder.error) {
    return { error: parsedLastOrder.error };
  }

  return {
    data: {
      rank: parsedRank.value,
      name: String(name).trim(),
      phone: String(phone).trim(),
      sales: parsedSales.value,
      total_spent: parsedTotalSpent.value,
      profit: parsedProfit.value,
      last_order: parsedLastOrder.value,
    },
  };
}

const customerPresenter = {
  async getAllCustomers(req, res) {
    try {
      const customers = await customerModel.findAll();
      customerView.sendList(res, customers);
    } catch (err) {
      customerView.sendError(res, err.message);
    }
  },

  async getCustomerById(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return customerView.sendBadRequest(res, "id must be a number");
      }

      const customer = await customerModel.findById(id);

      if (!customer) {
        return customerView.sendNotFound(res);
      }

      customerView.sendSuccess(res, customer);
    } catch (err) {
      customerView.sendError(res, err.message);
    }
  },

  async createCustomer(req, res) {
    try {
      const parsed = parseCustomerPayload(req.body);

      if (parsed.error) {
        return customerView.sendBadRequest(res, parsed.error);
      }

      const customer = await customerModel.create(parsed.data);
      customerView.sendSuccess(res, customer, 201);
    } catch (err) {
      customerView.sendError(res, err.message);
    }
  },

  async updateCustomer(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return customerView.sendBadRequest(res, "id must be a number");
      }

      const parsed = parseCustomerPayload(req.body);

      if (parsed.error) {
        return customerView.sendBadRequest(res, parsed.error);
      }

      const customer = await customerModel.update(id, parsed.data);

      if (!customer) {
        return customerView.sendNotFound(res);
      }

      customerView.sendSuccess(res, customer);
    } catch (err) {
      customerView.sendError(res, err.message);
    }
  },

  async deleteCustomer(req, res) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return customerView.sendBadRequest(res, "id must be a number");
      }

      const deleted = await customerModel.remove(id);

      if (!deleted) {
        return customerView.sendNotFound(res);
      }

      customerView.sendSuccess(res, { id: deleted.id, message: "Customer deleted successfully" });
    } catch (err) {
      customerView.sendError(res, err.message);
    }
  },
};

module.exports = customerPresenter;
