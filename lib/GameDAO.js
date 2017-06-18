var Database = require('./Database.js');
var randomstring = require("randomstring");

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
            'SELECT u.name,gup.is_turn FROM Game g LEFT JOIN GameUserMap gup ON(g.id = gup.game_id) LEFT JOIN User u ON(gup.user_id = u.id) WHERE g.id = ? ORDER BY gup.id ASC',
            game.id,
            cb
        )
    }
};