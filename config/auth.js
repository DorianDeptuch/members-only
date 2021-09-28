module.exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("error_msg", "Please log in to view this resource");
    res.redirect("/log-in");
  }
};

module.exports = {
  ensureVerified: function (req, res, next) {
    if (req.isAuthenticated() && user.isVerified) {
      return next();
    }
    req.flash("error_msg", "Please log in to view this resource");
    res.redirect("/log-in");
  },
};
