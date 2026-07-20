const express = require("express");
const orderPresenter = require("../presenters/orderPresenter");

const router = express.Router();

router.get("/", orderPresenter.getAllOrders);
router.get("/:id", orderPresenter.getOrderById);
router.post("/", orderPresenter.createOrder);
router.put("/:id", orderPresenter.updateOrder);
router.delete("/:id", orderPresenter.deleteOrder);

module.exports = router;
