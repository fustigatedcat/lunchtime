var express = require('express');
var router = express.Router();
var gameDAO = require('../../lib/GameDAO.js');

/* GET home page. */
router.post('/', function(req, res, next) {
    console.log(req.body);
    gameDAO.createGame(req.body.restaurants, req.body.time, req.body.creator, function(err, game) {
        if(err) {
            console.log(err);
            res.status(500).send();
        } else {
            res.send(game);
        }
    });
});

module.exports = router;
