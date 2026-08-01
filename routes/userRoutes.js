const express = require("express");
const router = express.Router();
const usercontrolles = require("../controlles/usercontrolles");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

router.post("/register", usercontrolles.Adduser);
router.post("/login", usercontrolles.Login);

router.get("/getcurrentuser", Auth, usercontrolles.getUser);
router.get("/profile", Auth, usercontrolles.getProfile);
router.patch("/profile", Auth, usercontrolles.patchProfile);

router.get("/", Auth, isAdmin, usercontrolles.getUsers);
router.post("/", Auth, isAdmin, usercontrolles.createUserAdmin);
router.patch("/:id", Auth, usercontrolles.UpdateUSER);
router.delete("/:id", Auth, isAdmin, usercontrolles.deleteUser);

module.exports = router;
