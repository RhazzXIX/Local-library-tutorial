import { Handler } from "express";

const express = require('express')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect("/catalog")
} as Handler);

module.exports = router;
