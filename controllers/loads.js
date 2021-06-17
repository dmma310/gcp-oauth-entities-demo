const express = require('express');
const { fromDatastore } = require('../lib/datastore');
const router = express.Router();

const LOAD = require('../models/loads');
const BOAT = require('../models/boats');
const { isValidGetAcceptHeader, isValidJsonSyntax, isValidContentTypeHeader,
    isJsonAcceptHeader, isValidLoadPostBody, isValidLoadPatchBody, } =
    require('../lib/validators');

// View all loads
router.get('/', isJsonAcceptHeader, async (req, res) => {
    try {
        const loads = await LOAD.getLoads(req);
        return res.render('loads', loads);
        // return res.status(200).json(loads);
    }
    catch (e) {
        console.log(e);
        return res.sendStatus(404);
    }
});

// View a load
router.get('/:id', isValidGetAcceptHeader, async (req, res) => {
    try {
        const accepts = req.accepts(['application/json', 'text/html']);
        let load = await LOAD.getLoad(req.params.id);
        load = fromDatastore(load[0]);
        load.self = req.protocol + '://' + req.get('host') + req.originalUrl; // req.originalUrl = /boats/:id
        res.location(load.self);
        if (accepts === 'application/json') {
            res.set(('Content-Type', 'application/json'));
            return res.status(200).json(load);
        } else if (accepts === 'text/html') {
            res.set(('Content-Type', 'text/html'));
            return res.status(200).render('boat', load);
        } else { return res.status(500).send('Content-Type got messed up!'); }
    }
    catch (e) {
        console.log(e);
        return res.status(404).send('No load with this load_id exists');
    }
});

// Create a load that is unassigned to any boat.
// Implement pagination similar to view all boats, i.e., 5 loads per page and a 'next' link
router.post('/', isValidJsonSyntax, isValidContentTypeHeader,
    isJsonAcceptHeader, isValidLoadPostBody, async (req, res) => {
        try {
            const now = (new Date()).toLocaleDateString();
            req.body.creationDate = now;
            const key = await LOAD.saveLoad(req.body);
            return res.status(201).json({
                id: key.id,
                volume: req.body.volume,
                content: req.body.content,
                carrier: {},
                creationDate: now,
                self: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + key.id,
            });
        }
        catch (e) {
            console.log(e);
            return res.status(400).send('Could not add item to database');
        }
    });

// Add carrier to load, update boat with new load
// TODO: Should be PATCH, but PATCH doesn't work with XmlHttpRequest with Chrome
router.put('/:load_id/boats/:boat_id', async (req, res) => {
    try {
        // Get existing load
        let load = await LOAD.getLoad(req.params.load_id);
        // Update load with new carrier
        if (!Object.keys(load[0].carrier).length) {
            load = fromDatastore(load[0]);
            let boat = await BOAT.getBoat(req.params.boat_id);
            boat = fromDatastore(boat[0]);
            load.carrier = {
                'id': boat.id,
                'name': boat.name,
                'self': req.protocol + '://' + req.get('host') + '/boats/' + req.params.boat_id
            };
            Promise.all([
                LOAD.saveLoad(load),
                BOAT.putLoadOnBoat(req)
            ]).then(_ => res.sendStatus(204));
        }
        else {
            res.status(403).send('The load has a carrier assigned'); // User is authenticated, but not authorized
        }
    }
    catch (e) {
        console.log(e);
        return res.status(404).send('Load or boat does not exist');
    }
});

// Delete a load, update the boat that was carrying it.
router.delete('/:id', async (req, res) => {
    try {
        const load = await LOAD.getLoad(req.params.id);
        const carrierId = load[0]['carrier']['id'];
        if (carrierId == undefined) {
            const boatKey = await LOAD.deleteLoad(req.params.id);
            // Catches undefined and null values
            if (boatKey == null) {
                throw 'No load with this load_id exists.';
            }
            return res.sendStatus(204);
        } else {
            Promise.all([
                BOAT.deleteLoadOnBoat(carrierId, req.params.id),
                LOAD.deleteLoad(req.params.id)
            ]).then(vals => {
                const boatKey = vals[0];
                // Catches undefined and null values
                if (boatKey == null) {
                    throw 'No load with this load_id exists.';
                }
                return res.sendStatus(204);
            }).catch(e => { throw e });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(404).send('No load with this load_id exists.');
    }
});


// Put
router.put('/:id', isValidJsonSyntax, isValidContentTypeHeader,
    isValidLoadPostBody, (req, res) => {
        LOAD.getLoad(req.params.id).then(load => {
            req.body.volume = req.body.volume;
            req.body.content = req.body.content;
            req.body.carrier = load[0].carrier;
            req.body.creationDate = load[0].creationDate;
            req.body.id = req.params.id;
            LOAD.saveLoad(req.body).then(key => {
                res.location(req.protocol + '://' + req.get('host')
                    + req.baseUrl + '/' + key.id); // Set url to resource in location attribute of header
                return res.sendStatus(204);
            }).catch(e => { throw (e) });
        }).catch(e => {
            console.log(e);
            return res.status(404).send('No load with this id exists');
        });
    });

// Patch
router.patch('/:id', isValidJsonSyntax, isValidLoadPatchBody, (req, res) => {
    LOAD.getLoad(req.params.id).then(load => {
        req.body.volume = req.body.volume || load[0].volume;
        req.body.content = req.body.content || load[0].content;
        req.body.carrier = load[0].carrier;
        req.body.creationDate = load[0].creationDate;
        req.body.id = req.params.id;
        LOAD.saveLoad(req.body).then(key => {
            res.location(req.protocol + '://' + req.get('host')
                + req.baseUrl + '/' + key.id); // Set url to resource in location attribute of header
            return res.sendStatus(204);
        }).catch(e => { throw (e) });
    }).catch(e => {
        console.log(e);
        return res.status(404).send('No load with this id exists');
    });
});

/***********Explicitly allow only GET and POST to root url (/loads), set Accept header***********/
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

module.exports = router;