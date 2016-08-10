var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('homeChatRoom.ejs', { title: 'Ben Kandov Chat Server' });
});

module.exports = router;
