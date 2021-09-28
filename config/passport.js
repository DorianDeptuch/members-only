const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        username: "username",
      },
      (username, password, done) => {
        User.findOne({ username: username })
          .then((user) => {
            if (!user) {
              return done(null, false, {
                message: "That User is not registered",
              });
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else done(null, false, { message: "Password is incorrect" });
            });
          })
          .catch((err) => console.log(err));
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
