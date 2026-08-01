const express = require("express");
const router = express.Router();
const ctrl = require("../controlles/articlecontrolles");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

router.get("/", ctrl.listArticles);
router.get("/:id", ctrl.getArticle);
router.post("/", Auth, isAdmin, ctrl.createArticle);
router.patch("/:id", Auth, isAdmin, ctrl.updateArticle);
router.put("/:id", Auth, isAdmin, ctrl.updateArticle);
router.delete("/:id", Auth, isAdmin, ctrl.deleteArticle);

module.exports = router;
