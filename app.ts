import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
  Handler,
} from "express";
const wiki = require("./routes/wiki");

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog");
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require('express-rate-limit');
const app = express();
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});

mongoose.set("strictQuery", false);
const mongDB = process.env.DB_URL;

async function main() {
  await mongoose.connect(mongDB);
}

main().catch((err: Error) => console.log(err));
app.use(limiter);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'","code.jquery.com", "cdn.jsdelivr.net"]
    },
  })
);

app.use(compression());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Time:", new Date());
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/wiki", wiki);

// Add catalog routes to middleware chain.
app.use("/catalog", catalogRouter);

// For handling Errors
app.use(function (req, res, next) {
  next(createError(404));
} as Handler);

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
} as ErrorRequestHandler);

module.exports = app;
