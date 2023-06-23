import { Handler } from "express";
require("dotenv").config();
const createError = require("http-errors");
const asyncHandler = require("express-async-handler");
const Genre = require("../models/genre");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
const debug = require('debug')('genre');

// Display list of all Genre.
exports.genre_list = asyncHandler(async function (req, res, next) {
  const allGenre = await Genre.find().sort({ name: 1 }).exec();

  res.render("genre_list", {
    title: "Genre List",
    genre_list: allGenre,
  });
} as Handler);

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async function (req, res, next) {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (genre === null) {
    return next(createError(404, "Genre not found"));
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
} as Handler);

// Display Genre create form on GET.
exports.genre_create_get = function (req, res, next) {
  res.render("genre_form", { title: "Create Genre" });
} as Handler;

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  // Process request after validation and sanitation.
  asyncHandler(async function (req, res, next) {
    // Extract the validation errors from a request
    const errors = validationResult(req);
    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });

      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(genre.url);
      }
    }
  } as Handler),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async function (req, res, next) {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (genre === null) {
    res.redirect("/catalog/genre");
  }

  res.render("genre_delete", {
    title: "Delete Genre",
    genre,
    genre_books: booksInGenre,
  });
} as Handler);

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async function (req, res, next) {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec(),
  ]);

  if (booksInGenre.length > 0) {
    res.render("genre_delete", {
      title: "Delete Genre",
      genre,
      genre_books: booksInGenre,
    });
    return;
  } else {
    await Genre.findByIdAndRemove(req.body.genreid);
    res.redirect("/catalog/genres");
  }
} as Handler);

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async function (req, res, next) {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    return next(createError(404, "Genre not found"));
  }

  res.render("genre_form", {
    title: "Update Genre",
    genre,
  });
} as Handler);

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Genre name should be at least 3 characteres")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async function (req, res, next) {
    const errors = validationResult(req);
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Genre",
        genre,
        errors: errors.array(),
      });
    } else {
      const updatedGenre = await Genre.findByIdAndUpdate(
        req.params.id,
        genre,
        {}
      );
      res.redirect(updatedGenre.url);
    }
  } as Handler),
];
