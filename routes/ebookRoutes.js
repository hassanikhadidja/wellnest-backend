const express = require("express");
const router = express.Router();
const ctrl = require("../controlles/ebookcontrolles");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

router.get("/", ctrl.listEbooks);
router.get("/:id", ctrl.getEbook);
router.post("/", Auth, isAdmin, ctrl.createEbook);
router.patch("/:id", Auth, isAdmin, ctrl.updateEbook);
router.put("/:id", Auth, isAdmin, ctrl.updateEbook);
router.delete("/:id", Auth, isAdmin, ctrl.deleteEbook);

module.exports = router;
