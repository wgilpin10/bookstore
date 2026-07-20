const express = require("express");
const customerPresenter = require("../presenters/customerPresenter");

const router = express.Router();

router.get("/", customerPresenter.getAllCustomers);
router.get("/:id", customerPresenter.getCustomerById);
router.post("/", customerPresenter.createCustomer);
router.put("/:id", customerPresenter.updateCustomer);
router.delete("/:id", customerPresenter.deleteCustomer);

module.exports = router;
