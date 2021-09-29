var express = require("express");
var router = express.Router();
const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

const user_controller = require("../controllers/userController");

const db = process.env.MONGO_URI;

// const { ensureAuthenticated, ensureVerified } = require("../config/auth");
const ensureAuthenticated = require("../config/auth").ensureAuthenticated;

/* GET home page. */
router.get("/", user_controller.index_get);

router.get("/sign-up", user_controller.signup_get);

router.post("/sign-up", user_controller.signup_post);

router.get("/log-in", user_controller.login_get);

router.post("/log-in", user_controller.login_post);

router.get("/new-post", user_controller.newpost_get);

router.post("/new-post", user_controller.newpost_post);

router.get("/logout", user_controller.logout_get);

router.get("/verified", user_controller.verified_get);

router.post("/verified", user_controller.verified_post);

router.get("/admin", user_controller.admin_get);

router.post("/admin", user_controller.admin_post);

router.delete("/:id", user_controller.delete_post);

module.exports = router;
