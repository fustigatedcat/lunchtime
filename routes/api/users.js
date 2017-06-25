var express = require('express');
var router = express.Router();
var UserDAO = require('../../lib/UserDAO.js');

/** Create new user */
router.post('/', function(req, res, next) {
    UserDAO.createUser(function(err, user) {
        if(err) {
            console.log(err);
            res.status(500).send();
        } else {
            res.status(200).send({
                uuid: user.uuid,
                name: user.name
            });
        }
    })

});

module.exports = router;
