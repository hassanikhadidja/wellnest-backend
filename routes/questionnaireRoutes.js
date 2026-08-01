const express = require("express");
const router = express.Router();
const ctrl = require("../controlles/questionnairecontrolles");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const optionalAuth = require("../middlewares/optionalAuth");

router.post("/", optionalAuth, ctrl.submitQuestionnaire);
router.get("/", Auth, isAdmin, ctrl.listQuestionnaires);

module.exports = router;
