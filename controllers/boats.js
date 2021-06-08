const express = require('express');
const { USER } = require('../lib/constants');
const { fromDatastore, getFilteredEntities } = require('../lib/datastore');
const { authenticatedBearerJWT } = require('../lib/googleOAuth');
const { isValidJsonSyntax, isValidBoatName, isValidBoatLength, isValidBoatType,
    isValidBoatPostBody, isValidGetAcceptHeader, isJsonAcceptHeader, isValidContentTypeHeader,
    isValidBoatPatchBody} = require('../lib/validators');
const router = express.Router();

const BOAT = require('../models/boats');
const LOAD = require('../models/loads');
const { getUserByGoogleCreds } = require('../models/users');

// router.get('/', isJsonAcceptHeader, authenticated, async (req, res) => {
router.get('/', isJsonAcceptHeader, authenticatedBearerJWT, async (req, res) => {
    try {
        // TODO: Instead of setting session-token in browser, set Authorization Bearer so we can use one authenticated function
        // Get user ID from authenticated JWT
        let boat = await getUserByGoogleCreds(req, req.googleId);
        boat = fromDatastore(boat.items[0]);
        const boats = await BOAT.getFilteredBoats(req, 'owner', boat.id);
        return res.status(200).json(boats);
    }
    catch (e) {
        console.log(e);
        return res.status(404).send('User does not exist');
    }
});

// View a boat
router.get('/:id', isValidGetAcceptHeader, authenticatedBearerJWT, (req, res) => {
    // Get user ID from validated JWT and boat, compare id to owner
    Promise.all(
        [
            getFilteredEntities(req, USER, 'googleId', req.googleId),
            BOAT.getBoat(req.params.id)
        ]
    ).then(vals => {
        const userId = vals[0].items[0].id;
        let boatObj = fromDatastore(vals[1][0]);
        if (boatObj.owner == userId) {
            const accepts = req.accepts(['application/json', 'text/html']); // Get accept header
            boatObj.self = req.protocol + '://' + req.get('host') + req.originalUrl; // req.originalUrl = /boats/:id
            res.location(boatObj.self); // Set url to resource in location attribute of header
            if (accepts === 'application/json') {
                res.set(('Content-Type', 'application/json'));
                return res.status(200).json(boatObj);
            } else if (accepts === 'text/html') {
                res.set(('Content-Type', 'text/html'));
                console.log(boatObj);
                return res.status(200).render('boat', boatObj);
            } else { return res.status(500).send('Content-Type got messed up!'); }
        }
        else {
            return res.sendStatus(403); // User is authenticated, but not authorized
        }
    })
        .catch(e => {
            console.log(e);
            return res.status(404).send('No boat with this boat_id exists');
        });
});

// View all loads for a given boat.
// This doesn't require pagination.
router.get('/:id/loads', isJsonAcceptHeader, authenticatedBearerJWT, async (req, res) => {
    try {
        const loads = await BOAT.getBoatLoads(req.params.id);
        return res.status(200).json(loads == null ? [] : loads);
    }
    catch (e) {
        console.log(e);
        return res.status(404).send('Could not get loads from boat');
    }
});

// Create a boat and implement pagination (5 boats per page).
// The 'next' link is for the next page of results, unless there are no more pages of result
// (i.e., the last page of results shouldn't have the 'next' link).
// Authenticate JWT, find user with that JWT, return userId
router.post('/', isValidJsonSyntax, isValidContentTypeHeader, isValidBoatName,
    isJsonAcceptHeader, isValidBoatPostBody, isValidBoatLength, isValidBoatType, authenticatedBearerJWT,
    async (req, res) => {
        console.log('test');
        try {
            const val = await getFilteredEntities(req, USER, 'googleId', req.googleId);
            req.body.owner = val.items[0].id;
            // req.body.owner = fromDatastore(val[0]).id;
            // Get user ID associated with valid JWT, set owner field
            const key = await BOAT.saveBoat(req.body);
            res.location(req.protocol + '://' + req.get('host') + req.baseUrl + '/' + key.id); // Set url to resource in location attribute of header
            return res.status(201).json(
                {
                    id: key.id,
                    owner: req.body.owner,
                    name: req.body.name,
                    type: req.body.type,
                    length: req.body.length,
                    self: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + key.id
                }
            );
        }
        catch (e) {
            console.log(e);
            return res.status(400).send('Could not add item to database');
        }
    });


// Assign a load to a boat, update load
router.patch('/:boat_id/loads/:load_id', authenticatedBearerJWT, async (req, res) => {
    try {
        let newLoad = await LOAD.getLoad(req.params.load_id);
        // Update load with new carrier
        if (!Object.keys(newLoad[0].carrier).length) {
            newLoad = fromDatastore(newLoad[0]);
            let existingBoat = await BOAT.getBoat(req.params.boat_id);
            existingBoat = fromDatastore(existingBoat[0]);
            newLoad.carrier = {
                'id': existingBoat.id,
                'name': existingBoat.name,
                'self': req.protocol + '://' + req.get('host') + '/boats/' + req.params.boat_id
            };
            // Wait for both load to be updated with new carrier, and boat to be updated with new load added
            Promise.all([
                // LOAD.saveLoad(newLoad.id, newLoad.volume, newLoad.content,
                //     newLoad.carrier, newLoad.creationDate),
                LOAD.saveLoad(newLoad),
                BOAT.putLoadOnBoat(req)
            ]).then(_ => res.sendStatus(204));
        }
        else {
            return res.status(403).send('The load has a carrier assigned'); // User is authenticated, but not authorized
        }
    }
    catch (e) {
        console.log(e);
        return res.status(404).send('Load or boat does not exist');
    }
});

// Remove load from a boat, update carrier property in load.
router.delete('/:boat_id/loads/:load_id', authenticatedBearerJWT, (req, res) => {
    try {
        Promise.all([
            BOAT.deleteLoadOnBoat(req.params.boat_id, req.params.load_id),
            LOAD.deleteCarrierInLoad(req.params.load_id)
        ]).then(vals => {
            if (vals[0] == null || vals[1] == null) {
                return res.status(404).send('Could not delete load from boat.');
            }
            return res.sendStatus(204);
        });
    }
    catch (e) {
        return res.status(404).send('Could not delete load from boat.');
    }
});

// Delete a boat and unload any loads that were loaded on to it.
router.delete('/:id', authenticatedBearerJWT, async (req, res) => {
    try {
        const loads = await BOAT.getBoatLoads(req.params.id);
        await BOAT.deleteBoat(req.params.id);
        // Check if boat has any loads
        if (loads != null) {
            // Unload all loads that were loaded on to it (update carrier in loads)
            await BOAT.unloadBoatInLoad(Object.values(loads)); // pass array of loads
        }
        return res.sendStatus(204);
    }
    catch (e) {
        return res.status(404).send('Could not get boat loads or boat does not exist.');
    }
});

// Put boat. Cannot update owner nor loads directly
// TODO: Allow modifying loads and owner
router.put('/:id', isValidJsonSyntax, isValidContentTypeHeader,
    isValidBoatName, isValidBoatPostBody, isValidBoatLength, isValidBoatType,
    authenticatedBearerJWT, (req, res) => {
        // Get owner and current boat concurrently
        return Promise.all([
            getFilteredEntities(req, USER, 'googleId', req.googleId),
            BOAT.getBoat(req.params.id)
        ]).then(vals => {
            req.body.owner = vals[0].items[0].id;
            req.body.loads = vals[1][0].loads;
            req.body.id = req.params.id;
            BOAT.saveBoat(req.body).then(key => {
                res.location(req.protocol + '://' + req.get('host')
                    + req.baseUrl + '/' + key.id); // Set url to resource in location attribute of header
                return res.sendStatus(204);
            }).catch(e => Throw(e));
        }).catch(e => {
            console.log(e);
            return res.status(404).send('No boat with this id exists');
        });
    });

// Patch boat. Cannot update owner nor loads directly.
// Allows extranneous inputs but does not save those.
// TODO: Allow modifying loads and owner
router.patch('/:id', isValidJsonSyntax, isValidContentTypeHeader, isValidBoatName,
    isValidBoatType, isValidBoatPatchBody, isValidBoatLength,
    authenticatedBearerJWT, (req, res) => {
        // Get owner and current boat concurrently
        Promise.all([
            getFilteredEntities(req, USER, 'googleId', req.googleId),
            BOAT.getBoat(req.params.id)
        ]).then(vals => {
            req.body.id = req.params.id;
            req.body.name = req.body.name || vals[1][0].name;
            req.body.type = req.body.type || vals[1][0].type;
            req.body.length = req.body.length || vals[1][0].length;

            req.body.owner = vals[0].items[0].id; // TODO: Allow changing this, will need to verify user exists
            req.body.loads = vals[1][0].loads; // TODO: Allow changing this, will need to verify the new loads exists, update carrier of those loads

            BOAT.saveBoat(req.body).then(key => {
                res.location(req.protocol + '://' + req.get('host') +
                    req.baseUrl + '/' + key.id); // Set url to resource in location attribute of header
                return res.sendStatus(204);
            }).catch(e => Throw(e));
        }).catch(e => {
            console.log(e);
            return res.sendStatus(400);
        });
    });

/***********Explicitly allow only GET and POST to root url (/boats), set Accept header***********/
router.delete('/', (req, res) => {
    res.set('Accept', 'GET, POST');
    res.sendStatus(405);
});

router.put('/', (req, res) => {
    res.set('Accept', 'GET, POST');
    res.sendStatus(405);
});

router.patch('/', (req, res) => {
    res.set('Accept', 'GET, POST');
    res.sendStatus(405);
});
/***********************************************************************************************/

router.use((req, res) => {
    res.sendStatus(404);
});

module.exports = router;