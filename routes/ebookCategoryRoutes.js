const express = require("express");
const Auth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const ctrl = require("../controlles/ebookCategorycontrolles");

const router = express.Router();

router.get("/", ctrl.listEbookCategories);
router.post("/", Auth, isAdmin, ctrl.createEbookCategory);
router.patch("/:id", Auth, isAdmin, ctrl.updateEbookCategory);
router.put("/:id", Auth, isAdmin, ctrl.updateEbookCategory);
router.delete("/:id", Auth, isAdmin, ctrl.deleteEbookCategory);

module.exports = router;
