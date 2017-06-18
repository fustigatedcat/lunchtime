var express = require('express');
var router = express.Router();
var gameDAO = require('../../lib/GameDAO.js');
var userDAO = require('../../lib/UserDAO.js');

/* GET home page. */
router.post('/', function(req, res, next) {
    gameDAO.createGame(req.body.restaurants, req.body.time, req.body.creator, function(err, game) {
        if(err) {
            console.log(err);
            res.status(500).send();
        } else {
            res.send(game);
        }
    });
});

router.get('/:name', function(req, res, next) {
    userDAO.getUser(req.param('uuid'), function(err, user) {
        if(err) {
            console.log(err);
            return res.status(500).send();
        }
        gameDAO.getGame(req.params.name, function(err, game) {
            if(err) {
                console.log(err);
                return res.status(500).send();
            }
            gameDAO.getPlayersForGame(game, function(err, playerList) {
                if(err) {
                    console.log(err);
                    return res.status(500).send();
                }
                if(req.param('state') == null || req.param('state') == 'initial') {
                    gameDAO.addUserToGame(game, user, function (err, _) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send();
                        }
                        res.send({
                            isOwner: game['created_by'] == user.id,
                            isGameStarted: game.started == 0 ? false : game.started,
                            players: playerList
                        });
                    });
                } else {
                    res.send({
                        isGameStarted: game.started == 0 ? false : game.started,
                        players: playerList
                    });
                }
            });
        });
    });
});

module.exports = router;