const express = require("express");
const orderPresenter = require("../presenters/orderPresenter");

const router = express.Router();

router.get("/", orderPresenter.getAllOrders);
router.get("/:id", orderPresenter.getOrderById);
router.post("/", orderPresenter.createOrder);

module.exports = router;
