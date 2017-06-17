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
                    var rests = restaurants.map(function(rest) { return [gameId, rest.name] });
                    Database.query(
                        'INSERT INTO GameRestaurant (game_id, name) VALUES ?',
                        [rests],
                        function(err, res) {
                            if(err) { return cb(err); }
                            cb(null, {'game-id': name});
                        }
                    )
                }
            )
        });

    }
};