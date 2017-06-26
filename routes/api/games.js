var express = require('express');
var router = express.Router();
var gameDAO = require('../../lib/GameDAO.js');

router.post('/', function(req, res) {
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

function createCardArray(cards, multiplier) {
    var newCards = [];
    for(var card in cards) {
        if(cards.hasOwnProperty(card)) {
            for(var i = 0; i < multiplier; i++) {
                newCards.push(cards[card]);
            }
        }
    }
    return newCards;
}

function shuffleCards(cards) {
    var j, x, i;
    for (i = cards.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = cards[i - 1];
        cards[i - 1] = cards[j];
        cards[j] = x;
    }
}

function dealCards(cards, players) {
    var cardDealings = [];
    var total = players.length * 3; // total number of cards to be dealt
    for(var i = 0; i < total; i++) {
        players[i%(players.length)].cards.push(cards[i]);
    }
    return cardDealings;
}

router.post('/:name/start', function(req, res) {
    if(req.user != null) {
        gameDAO.getGame(req.params.name, function(err, game) {
            if(err) {
                console.log(err);
                return res.status(500).send();
            }
            if(game.creator.equals(req.user._id)) {
                game.started = true;
                var cards = createCardArray(game.restaurants, Math.ceil(game.players.length * 3/game.restaurants.length));
                for(var i = 0; i < 3; i++) { // shuffle 3 times for good measure
                    shuffleCards(cards);
                }
                dealCards(cards, game.players);
                var index = Math.floor(Math.random()*(game.players.length));
                game.players[index].is_turn = true;
                gameDAO.updateGame(game, function(err) {
                    if(err) {
                        console.log(err);
                        return res.status(500).send();
                    }
                    res.status(200).send();
                });
            } else {
                return res.status(403).send();
            }
        });
    }
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
        var myPlayer = game.players.filter(function(p) { return p._id.equals(req.user._id); });
        var cardName = '';
        var rtn = {
            isGameStarted: game.started == 0 ? false : game.started,
            players: game.players,
            myCards: myPlayer[0].cards, // Need to populate this.
            myTurn: myPlayer[0].is_turn,
            currentCardName: cardName
        };
        if(req.query.state == 'initial') {
            gameDAO.addUserToGame(game, req.user, function(err, _) {
                if(err) {
                    console.log(err);
                    return res.status(500).send();
                }
                rtn.isOwner = game.creator.equals(req.user._id);
                game.players.forEach(function(p) {
                    delete p.cards;
                    delete p._id;
                });
                res.send(rtn);
            });
        } else {
            game.players.forEach(function(p) {
                delete p.cards;
                delete p._id;
            });
            res.send(rtn);
        }

    })
});

// Convert this!
router.post('/:name/play', function(req, res) {
});

module.exports = router;