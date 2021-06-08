const express = require('express');
const { LOAD, BOAT } = require('./lib/constants');
const { deleteAllEntities } = require('./lib/datastore');
const { authenticated } = require('./lib/googleOAuth');
const { isAdmin } = require('./lib/validators');
const router = express.Router();
const boat = require('./models/boats');
const load = require('./models/loads');

router.get('/', (req, res) => {
    return res.redirect('/login');
});

// Go to user info page if user is authenticated
router.get('/userInfo', authenticated, (req, res) => {
    res.status(200).render('userInfo', req.user);
});

router.get('/logout', (req, res) => {
    res.clearCookie('session-token');
    res.redirect('/');
});

router.use('/boats', require('./controllers/boats')); // Handle all requests to boats
router.use('/loads', require('./controllers/loads')); // Handle all requests to loads
router.use('/login', require('./controllers/login')); // Handle all requests to login
router.use('/users', require('./controllers/users')); // Handle all requests to users

router.delete('/entities', isAdmin, (req, res) => {
    Promise.all([
        deleteAllEntities(BOAT, boat.deleteBoat),
        deleteAllEntities(LOAD, load.deleteLoad)
    ])
        .then(_ => {
            return res.sendStatus(204);
        })
        .catch(e => {
            console.log(e);
            return res.sendStatus(404);
        });
});


module.exports = router;