import * as express from 'express'

var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
} as express.Handler);

router.get("/cool", function (req, res, next) {
  res.send("You are so cool because you are up-skilling!");
} as express.Handler);

module.exports = router;
