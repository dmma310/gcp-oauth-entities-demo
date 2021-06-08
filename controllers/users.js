const express = require('express');
const { fromDatastore } = require('../lib/datastore');
const router = express.Router();

const User = require('../models/users');
const { isJsonAcceptHeader } = require('../lib/validators');

// View all users, unprotected
router.get('/', isJsonAcceptHeader, async (req, res) => {
    try {
        const users = await User.getUsers(req);
        return res.status(200).json(users);
    }
    catch (e) {
        console.log(e);
        return res.status(404).send('Could not get users.');
    }
});

// View a user
router.get('/:id', isJsonAcceptHeader, async (req, res) => {
    try {
        let existingUser = await User.getUser(req.params.id);
        existingUser = fromDatastore(existingUser[0]);
        existingUser.self = req.protocol + '://' + req.get('host') + req.originalUrl; // req.originalUrl = /boats/:id
        res.location(existingUser.self);
        res.set(('Content-Type', 'application/json'));
        return res.status(200).json(existingUser);
    }
    catch (e) {
        console.log(e);
        return res.status(404).send("No user with this user_id exists");
    }
});

/***********Explicitly allow only GET to root url (/users), set Accept header***********/
router.delete('/', (req, res) => {
    res.set('Accept', 'GET');
    res.sendStatus(405);
});

router.put('/', (req, res) => {
    res.set('Accept', 'GET');
    res.sendStatus(405);
});

router.patch('/', (req, res) => {
    res.set('Accept', 'GET');
    res.sendStatus(405);
});
/***********************************************************************************************/

module.exports = router;