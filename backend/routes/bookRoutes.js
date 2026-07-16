const express = require("express");
const bookPresenter = require("../presenters/bookPresenter");

const router = express.Router();

router.get("/", bookPresenter.getAllBooks);
router.get("/:id", bookPresenter.getBookById);
router.post("/", bookPresenter.createBook);
router.put("/:id", bookPresenter.updateBook);
router.delete("/:id", bookPresenter.deleteBook);

module.exports = router;
