var Database = require('./Database.js');
var randomstring = require("randomstring");
var MongoClient = require('mongodb').MongoClient;

function createCardArray(cards, multiplier) {
    var newCards = [];
    for(var card in cards) {
        if(cards.hasOwnProperty(card)) {
            for(var i = 0; i < multiplier; i++) {
                newCards.push(cards[card].id);
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
    var total = players.length * 3; // total number of cards to be dealt=
    for(var i = 0; i < total; i++) {
        cardDealings.push([cards[i], players[i%(players.length)].id]);
    }
    return cardDealings;
}

module.exports = {
    createGame: function(restaurants, time, creator, cb) {
        MongoClient.connect('mongodb://127.0.0.1:27017/lunchtime', function(err, db) {
            if (err) {
                db.close();
                return cb(err);
            }
            var gameCollection = db.collection('game');
            var game = {
                name: randomstring.generate(7),
                time: {
                    hour: time.hour,
                    minute: time.minute
                },
                creator: creator._id,
                players: [{_id: creator._id, name: creator.name}],
                restaurants: restaurants.map(function(r) { return r.name; }),
                started: false
            };
            gameCollection.insertOne(game, function(err, result) {
                if(err) {
                    db.close();
                    return cb(err);
                }
                db.close();
                cb(null, result.ops[0]);
            })
        });

    },
    getGame: function(name, cb) {
        MongoClient.connect('mongodb://127.0.0.1:27017/lunchtime', function(err, db) {
            if (err) {
                db.close();
                return cb(err);
            }
            var gameCollection = db.collection('game');
            gameCollection.findOne({name: name}, function(err, game) {
                db.close();
                cb(err, game);
            });
        });
    },
    addUserToGame: function(game, user, cb) {
        MongoClient.connect('mongodb://127.0.0.1:27017/lunchtime', function(err, db) {
            if(err) { return cb(err); }
            var gameCollection = db.collection('game');
            if(game.players.filter(function(p) { return p._id.equals(user._id); }).length == 0) {
                game.players.push({_id: user._id, name: user.name});
            }
            gameCollection.updateOne({_id: game._id}, game, function(err) {
                if(err) {
                    db.close();
                    return cb(err);
                }
                db.close();
                cb(null);
            });
        });
    },
    getPlayersForGame: function(game, cb) {
        Database.query(
            'SELECT u.id, u.name,gup.is_turn FROM Game g LEFT JOIN GameUserMap gup ON(g.id = gup.game_id) LEFT JOIN User u ON(gup.user_id = u.id) WHERE g.id = ? ORDER BY gup.id ASC',
            [game.id],
            cb
        )
    },
    startGame: function(game, cb) {
        Database.query(
            'UPDATE Game SET started = true WHERE id = ?',
            [game.id],
            cb
        )
    },
    createCardsForGame: function(game, players, cb) {
        Database.query(
            'SELECT id FROM GameRestaurant WHERE game_id = ?',
            [game.id],
            function(err, rows) {
                if(err) { return cb(err); }
                var cards = createCardArray(rows, Math.ceil(players.length * 3/rows.length));
                for(var i = 0; i < 3; i++) { // shuffle 3 times for good measure
                    shuffleCards(cards);
                }
                var dealings = dealCards(cards, players);
                console.log(JSON.stringify(dealings));
                Database.query(
                    'INSERT INTO GameCard (restaurant_id, user_id) VALUES ?',
                    [dealings],
                    cb
                );
            }
        )
    },
    getAvailableCardsForUserAndGame: function(user, game, cb) {
        Database.query(
            'SELECT gc.id, gr.name FROM GameCard gc JOIN GameRestaurant gr ON(gc.restaurant_id = gr.id) WHERE gr.game_id = ? AND gc.user_id = ?',
            [game.id, user.id],
            cb
        );
    },
    setPlayersTurn: function(game, player, cb) {
        Database.query(
            'UPDATE GameUserMap SET is_turn = false WHERE game_id = ?',
            [game.id],
            function(err, _) {
                if(err) { return cb(err); }
                Database.query(
                    'UPDATE GameUserMap SET is_turn = true WHERE game_id = ? AND user_id = ?',
                    [game.id, player.id],
                    cb
                );
            }
        );
    },
    getCurrentCard: function(game, cb) {
        Database.query(
            'SELECT gr.name FROM Game g JOIN GameCard gc ON(g.current_card_id = gc.id) JOIN GameRestaurant gr ON(gc.restaurant_id = gr.id) WHERE g.id = ?',
            [game.id],
            cb
        )
    }
};