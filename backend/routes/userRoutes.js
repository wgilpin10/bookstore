const express = require("express");
const userPresenter = require("../presenters/userPresenter");

const router = express.Router();

router.post("/invite", userPresenter.inviteUser);
router.get("/invite/:token", userPresenter.getInvite);
router.post("/accept-invite", userPresenter.acceptInvite);

router.get("/", userPresenter.getAllUsers);
router.get("/:id", userPresenter.getUserById);
router.post("/", userPresenter.createUser);
router.put("/:id", userPresenter.updateUser);
router.delete("/:id", userPresenter.deleteUser);

module.exports = router;
