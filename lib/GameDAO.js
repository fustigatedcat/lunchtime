var Database = require('./Database.js');
var randomstring = require("randomstring");

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
    createGame: function(restaurants, time, createdBy, cb) {
        var name = randomstring.generate(7);
        Database.query('SELECT id FROM User WHERE uuid = ?', createdBy, function(err, user) {
            if(err) { return cb(err); }
            Database.query(
                'INSERT INTO Game (name, created_by, lunch_hour, lunch_minute) VALUES (?, ?, ?, ?)',
                [name, user[0].id, time.hour, time.minute],
                function(err, res) {
                    if(err) { return cb(err); }
                    var gameId = res.insertId;
                    Database.query(
                        'INSERT INTO GameUserMap (game_id, user_id, is_turn) VALUES (?,?, false)',
                        [gameId, user[0].id],
                        function(err, _) {
                            if(err) { return cb(err); }
                            var rests = restaurants.map(function(rest) { return [gameId, rest.name] });
                            Database.query(
                                'INSERT INTO GameRestaurant (game_id, name) VALUES ?',
                                [rests],
                                function(err, res) {
                                    if(err) { return cb(err); }
                                    cb(null, {'name': name});
                                }
                            );        
                        }
                    );
                }
            );
        });

    },
    getGame: function(name, cb) {
        Database.query(
            'SELECT id, name, created_by, lunch_hour, lunch_minute, started, completed FROM Game WHERE name = ?',
            [name],
            function(err, row) {
                if(err) { return cb(err); }
                if(row.length == 0) { return cb('Not found'); }
                cb(null, row[0]);
            }
        )
    },
    addUserToGame: function(game, user, cb) {
        Database.query(
            'INSERT INTO GameUserMap (game_id, user_id, is_turn) VALUES (?,?, false) ON DUPLICATE KEY UPDATE id = id',
            [game.id, user.id],
            cb
        )
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
    }
};