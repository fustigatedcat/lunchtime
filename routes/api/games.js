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

router.post('/:name/start', function(req, res, next) {
    userDAO.getUser(req.body.uuid, function(err, user) {
        if(err) {
            console.log(err);
            return res.status(500).send();
        }
        gameDAO.getGame(req.params.name, function(err, game) {
            if(err) {
                console.log(err);
                return res.status(500).send();
            }
            if(game['created_by'] == user.id) {
                gameDAO.startGame(game, function(err, _) {
                    if(err) {
                        console.log(err);
                        return res.status(500).send();
                    }
                    gameDAO.getPlayersForGame(game, function(err, players) {
                        if(err) {
                            console.log(err);
                            return res.status(500).send();
                        }
                        gameDAO.createCardsForGame(game, players, function(err, _) {
                            if(err) {
                                console.log(err);
                                return res.status(500).send();
                            }
                            var index = Math.floor(Math.random()*(players.length));
                            gameDAO.setPlayersTurn(game, players[index], function(err, _) {
                                if(err) {
                                    console.log(err);
                                    return res.status(500).send();
                                }
                                res.status(200).send();
                            });
                        });
                    });
                });
            } else {
                return res.status(403).send();
            }
        });
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
                gameDAO.getAvailableCardsForUserAndGame(user, game, function(err, cards) {
                    if(err) {
                        console.log(err);
                        return res.status(500).send();
                    }
                    var myTurn = false;
                    playerList.forEach(function(p) { if(p.id == user.id) { myTurn = p.is_turn; }})
                    playerList.forEach(function(p) { delete p.id; });
                    if(req.param('state') == null || req.param('state') == 'initial') {
                        gameDAO.addUserToGame(game, user, function (err, _) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send();
                            }
                            res.send({
                                isOwner: game['created_by'] == user.id,
                                isGameStarted: game.started == 0 ? false : game.started,
                                players: playerList,
                                myCards: cards,
                                myTurn: myTurn
                            });
                        });
                    } else {
                        res.send({
                            isGameStarted: game.started == 0 ? false : game.started,
                            players: playerList,
                            myCards: cards,
                            myTurn: myTurn
                        });
                    }
                });
            });
        });
    });
});

module.exports = router;