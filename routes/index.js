var express = require("express");
var router = express.Router();
const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

const db = process.env.MONGO_URI;

// const { ensureAuthenticated, ensureVerified } = require("../config/auth");
const ensureAuthenticated = require("../config/auth").ensureAuthenticated;

/* GET home page. */
router.get("/", function (req, res, next) {
  Post.find().exec(function (err, list_posts) {
    if (err) {
      return next(err);
    }
    res.render("index", {
      title: "Home",
      user: req.user,
      error: err,
      post_list: list_posts,
    });
    console.log(req.user);
  });
});

router.get("/sign-up", (req, res, next) => {
  res.render("sign-up", {
    title: "Sign-Up",
    user: req.user,
  });
});

router.post("/sign-up", (req, res, next) => {
  const { username, password, confirmPassword } = req.body;
  let errors = [];

  if (!username || !password || !confirmPassword) {
    errors.push({ msg: "Please fill in all fields" });
  }

  if (password !== confirmPassword) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (username.length < 6) {
    errors.push({ msg: "Username must contain at least 6 characters" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must contain at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("sign-up", {
      errors,
      username,
      password,
      title: "Sign Up",
    });
  } else {
    User.findOne({ username: username }).then((user) => {
      if (user) {
        errors.push({ msg: "User already exists" });
        res.render("sign-up", {
          errors,
          username,
          password,
          title: "Sign Up",
        });
      } else {
        const newUser = new User({
          username,
          password,
        });

        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now Registered and can Log In"
                );
                res.redirect("/log-in");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

router.get("/log-in", (req, res, next) => {
  res.render("log-in", {
    title: "Log In",
    user: req.user,
  });
});

router.post("/log-in", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureFlash: true,
  })(req, res, next);
});

router.get("/new-post", (req, res, next) => {
  if (!req.user) {
    req.flash("error_msg", "Please log in to view this resource");
    res.redirect("/log-in");
  } else {
    res.render("new-post", {
      title: "Create New Post",
      user: req.user,
    });
  }
});

router.post("/new-post", (req, res, next) => {
  const { username } = req.user;
  const { postTitle, postMessage } = req.body;
  let errors = [];

  if (!postTitle || !postMessage) {
    errors.push({ msg: "Please fill out all fields" });
    res.render("new-post", {
      title: "Create new Post",
      user: req.user,
      postTitle,
      postMessage,
      errors,
    });
  } else {
    const newPost = new Post({
      title: postTitle,
      author: username,
      message: postMessage,
      date: Date.now(),
    });

    newPost
      .save()
      .then((post) => {
        Post.find().exec(function (err, list_posts) {
          if (err) {
            return next(err);
          }
          res.render("index", {
            title: "Home",
            user: req.user,
            error: err,
            post_list: list_posts,
          });
        });
      })
      .catch((err) => console.log(err));
  }
});

router.get("/logout", (req, res, next) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/log-in");
});

router.get("/verified", (req, res, next) => {
  if (!req.user) {
    req.flash("error_msg", "Please log in to view this resource");
    res.redirect("/log-in");
  } else {
    res.render("verified_form", {
      title: "Become Verified",
      user: req.user,
    });
  }
});

router.post("/verified", (req, res, next) => {
  const { verified } = req.body;
  const { username, password, id } = req.user;
  let errors = [];

  if (!verified) {
    errors.push("Please submit an answer");
  }

  if (verified != process.env.VERIFIED_ANSWER) {
    errors.push({ msg: "Incorrect" });

    res.render("verified_form", {
      title: "Become Verified",
      user: req.user,
      errors,
    });
  } else {
    let user = new User({
      username,
      password,
      isVerified: true,
      _id: id,
    });
    User.findByIdAndUpdate(id, user, {}, function (err, newuser) {
      if (err) {
        return next(err);
      }
      res.render("verified_form", {
        title: "Become Verified",
        user: req.user,
        success_msg: "You are now Verified!",
      });
    });
  }
});

router.get("/admin", (req, res, next) => {
  if (!req.user) {
    req.flash("error_msg", "Please log in to view this resource");
    res.redirect("/log-in");
  } else if (!req.user.isVerified) {
    req.flash("error_msg", "Become Verified to view this resource");
    res.redirect("/verified");
  } else {
    res.render("admin_form", {
      title: "Become an Admin",
      user: req.user,
    });
  }
});

router.post("/admin", (req, res, next) => {
  const { admin } = req.body;
  const { username, password, id } = req.user;
  let errors = [];

  if (!admin) {
    errors.push("Please submit an answer");
  }

  if (admin != process.env.ADMIN_ANSWER) {
    errors.push("Incorrect");

    res.render("admin_form", {
      title: "Become an Admin",
      user: req.user,
      errors,
    });
  } else {
    let user = new User({
      username,
      password,
      isVerified: true,
      isAdmin: true,
      _id: id,
    });

    User.findByIdAndUpdate(id, user, {}, function (err, newuser) {
      if (err) {
        return next(err);
      }

      res.render("admin_form", {
        title: "Become an Admin",
        user: req.user,
        success_msg: "You are now an Admin!",
      });
    });
  }
});

router.post("/delete", (req, res, next) => {
  const { id } = req.post.id;
  console.log(id);
  // Post.findOne({id: }).exec(function (err, list_post){
  //   if (err){return next(err);}

  // })

  Post.findByIdAndRemove(id, function deletePost(err) {
    if (err) {
      return next(err);
    }

    res.redirect("/");
  });
});

module.exports = router;
