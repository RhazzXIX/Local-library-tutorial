import * as express from "express";

const router = express.Router();

router.get('/', function(req, res) {
  res.send('Wiki home page')
}as express.Handler);

router.get('/about', function(req, res) {
  res.send("About this wiki");
} as express.Handler);

const fnArray = [
  function(req,res, next) {
    console.log('array1')
    next()
  } as express.Handler,
  function(req,res, next) {
    console.log('array2')
    next()
  } as express.Handler,
  function(req,res) {
    console.log('array3')
    res.end('finished logging')
  } as express.Handler,
]

router.get('/test', fnArray)

module.exports = router