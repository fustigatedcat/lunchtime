var express = require('express');
var router = express.Router();
var gameDAO = require('../../lib/GameDAO.js');
var userDAO = require('../../lib/UserDAO.js');

/* GET home page. */
router.post('/', function(req, res, next) {
    if(req.user != null) {
        gameDAO.createGame(req.body.restaurants, req.body.time, req.user, function(err, game) {
            if(err) {
                console.log(err);
                res.status(500).send();
            } else {
                res.send({name: game.name});
            }
        });    
    } else {
        res.status(403).send();
    }
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

router.get('/:name', function(req, res) {
    if(req.user == null) { return res.status(403).send(); }
    gameDAO.getGame(req.params.name, function(err, game) {
        if(err) {
            console.log(err);
            return res.status(500).send();
        } else if(!game) {
            return res.status(404).send();
        }
        var myTurn = false;
        game.players.forEach(function(p) { if(p._id.equals(req.user._id)) { myTurn = p.is_turn; }})
        var cardName = '';
        var rtn = {
            isGameStarted: game.started == 0 ? false : game.started,
            players: game.players,
            myCards: [],
            myTurn: myTurn,
            currentCardName: cardName
        };
        if(req.query.state == 'initial') {
            gameDAO.addUserToGame(game, req.user, function(err, _) {
                if(err) {
                    console.log(err);
                    return res.status(500).send();
                }
                rtn.isOwner = game.creator.equals(req.user._id);
                game.players.forEach(function(p) { delete p._id; });
                res.send(rtn);
            });
        } else {
            game.players.forEach(function(p) { delete p._id; });
            res.send(rtn);
        }

    })
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
                    gameDAO.getCurrentCard(game, function(err, card) {
                        if(err) {
                            console.log(err);
                            return res.status(500).send();
                        }
                        var myTurn = false;
                        playerList.forEach(function(p) { if(p.id == user.id) { myTurn = p.is_turn; }})
                        playerList.forEach(function(p) { delete p.id; });
                        var cardName = '';
                        if(card.length == 1) {
                            cardName = card[0].name;
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
                                    players: playerList,
                                    myCards: cards,
                                    myTurn: myTurn,
                                    currentCardName: cardName
                                });
                            });
                        } else {
                            res.send({
                                isGameStarted: game.started == 0 ? false : game.started,
                                players: playerList,
                                myCards: cards,
                                myTurn: myTurn,
                                currentCardName: cardName
                            });
                        }
                    });
                });
            });
        });
    });
});

router.post('/:name/play', function(req, res) {
    userDAO.getUser(req.param('uuid'), function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        gameDAO.getGame(req.params.name, function (err, game) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
        });
    });
});

module.exports = router;