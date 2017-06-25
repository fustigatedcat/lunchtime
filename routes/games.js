var express = require('express');
var router = express.Router();
var gameDAO = require('../lib/GameDAO.js');

router.get('/:name', function(req, res, next) {
    gameDAO.getGame(req.params.name, function(err, game) {
        if(err) {
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(404);
            res.render('error');
        } else if(!game) {
            res.status(404).send();
        } else {
            res.render('game', {game: game});
        }
    });
});

module.exports = router;