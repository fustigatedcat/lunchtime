var Database = require('./Database.js');

module.exports = {
    createUser: function(cb) {
        Database.query('INSERT INTO User (uuid, name) VALUES (UUID(), "temp")', function(err, res) {
            if(err) { return cb(err); }
            var newId = res.insertId;
            Database.query('UPDATE User SET name = ? WHERE id = ?', ['User ' + newId, newId], function(err, res) {
                if(err) { return cb(err); }
                Database.query('SELECT * FROM User WHERE id = ?', [newId], cb);
            });
        });
    }
};