var randomstring = require("randomstring");
var MongoClient = require('mongodb').MongoClient;

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
                players: [{_id: creator._id, name: creator.name, cards: [], is_turn: false}],
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
                game.players.push({_id: user._id, name: user.name, cards: [], is_turn: false});
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
    updateGame: function(game, cb) {
        MongoClient.connect('mongodb://127.0.0.1:27017/lunchtime', function(err, db) {
            if(err) { return cb(err); }
            var gameCollection = db.collection('game');
            gameCollection.updateOne({_id: game._id}, game, function(err) {
                if(err) {
                    db.close();
                    return cb(err);
                }
                db.close();
                cb(null);
            });
        })
    }
};