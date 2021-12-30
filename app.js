var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
let mongoose = require("mongoose");
const flash = require("connect-flash");
// const session = require("express-session"); // Heroku didn't like this, changed to cookie-session
const session = require("cookie-session");
//connect-mongo 3.2.0
// const MongoStore = require("connect-mongo")(session);
//latest connect mongo
// const MongoStore = require("connect-mongo");
const passport = require("passport");
const methodOverride = require("method-override");

require("./config/passport")(passport);

const db = process.env.MONGO_URI;

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err));

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// Require static assets from public folder
app.use(express.static(path.join(__dirname, "public")));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    //connect-mongo 3.2.0
    // store: new MongoStore({
    //   mongooseConnection: mongoose.connection,
    //   mongoUrl: db,
    // }),
    //latest connect mongo version
    store: new MongoStore({
      mongoUrl: db,
      // mongooseConnection: mongoose.connection,
      ttl: 14 * 24 * 60 * 60, // save session for 14 days
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 14, // expires in 14 days
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
  next();
});

module.exports = app;
