var MongoClient = require('mongodb').MongoClient;
var UUID = require('uuid').v4;

module.exports = {
    createUser: function(cb) {
        MongoClient.connect('mongodb://127.0.0.1:27017/lunchtime', function(err, db) {
            if(err) { return cb(err); }
            var userCollection = db.collection('user');
            userCollection.count({}, function(err, cnt) {
                if(err) {
                    db.close();
                    return cb(err);
                }
                userCollection.insertOne({
                    uuid: UUID(),
                    name: 'User ' + (cnt + 1)
                }, function(err, result) {
                    if(err) { return cb(err); }
                    db.close();
                    cb(null, result.ops[0]);
                });
            });
        });
    },
    getUser: function(uuid, cb) {
        MongoClient.connect('mongodb://127.0.0.1:27017/lunchtime', function(err, db) {
            if(err) { return cb(err); }
            var userCollection = db.collection('user');
            userCollection.findOne({uuid: uuid}, function(err, user) {
                db.close();
                cb(err, user);
            });
        })
    }
};