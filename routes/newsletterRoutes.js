const express = require("express");
const router = express.Router();
const ctrl = require("../controlles/newslettercontrolles");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const optionalAuth = require("../middlewares/optionalAuth");

router.get("/", Auth, isAdmin, ctrl.listNewsletterEmails);
router.get("/export", Auth, isAdmin, ctrl.exportNewsletterEmails);
router.post("/", optionalAuth, ctrl.createNewsletterEmail);
router.patch("/:id", Auth, isAdmin, ctrl.updateNewsletterEmail);
router.delete("/:id", Auth, isAdmin, ctrl.deleteNewsletterEmail);

module.exports = router;
