import { Handler } from "express";
require("dotenv").config();
const createError = require("http-errors");
const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const debug = require('debug')('bookinstance');
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async function (req, res, next) {

  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });

} as Handler);

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async function (req, res, next) {

  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    return next(createError(404, "Book copy not found"));
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
  });
} as Handler);

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async function (req, res, next) {
  const allBooks = await Book.find({}, "title").exec();
  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
} as Handler);

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  // process request after validation and sanitization.
  asyncHandler(async function (req, res, next) {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });
    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").exec();
      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  } as Handler),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async function (req, res, next) {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();
  if (bookInstance === null) {
    return next(createError(404, "Book copy not found"));
  }

  res.render("bookinstance_delete", {
    title: "Delete Book Instance",
    bookinstance: bookInstance,
  });
} as Handler);

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async function (
  req,
  res,
  next
) {
  await BookInstance.findByIdAndRemove(req.body.bookInstanceId).exec();
  res.redirect("/catalog/bookinstances");
} as Handler);

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async function (req, res, next) {
  const [bookinstance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id).exec(),
    Book.find({}, "title").exec(),
  ]);

  if (bookinstance === null) {
    return next(createError(404, "Genre not found"));
  }

  res.render("bookinstance_form", {
    title: "Update Book Instance",
    bookinstance,
    book_list: allBooks,
    selected_book: bookinstance.book,
  });
} as Handler);

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  asyncHandler(async function (req, res, next) {
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").exec();
      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookinstance.book._id,
        errors: errors.array(),
        bookinstance,
      });
      return;
    } else {
      const updatedInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {}
      );
      res.redirect(updatedInstance.url);
    }
  } as Handler),
];
