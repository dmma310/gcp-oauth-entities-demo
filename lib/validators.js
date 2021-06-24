
const { getFilteredEntities } = require('../lib/datastore');
const { NUM_BOAT_ATTRIBUTES, BOAT, MIN_BOAT_LENGTH, MIN_STRING_LENGTH,
    MAX_BOAT_NAME_LENGTH, MAX_BOAT_LENGTH, MAX_BOAT_TYPE_LENGTH, NUM_LOAD_ATTRIBUTES } = require('../lib/constants');

// Validate boat name length if exists
module.exports.isValidBoatName = async function isValidBoatName(req, res, next) {
    const prop = req.body.name?.trim();
    // Check for uniqueness and length
    if (prop) {
        const results = await getFilteredEntities(req, BOAT, 'name', prop);
        // For edit case, don't check for unique if user editing own boat. Only check for adding new boat and if existing boat is owned by the owner or not.
        if (!(req.params.id === results.items[0].id)) {
            if (results.items.length || prop.length < MIN_STRING_LENGTH || prop.length > MAX_BOAT_NAME_LENGTH) {
                return res.status(403).send('Name is not unique');  // User is authenticated, but not authorized/incorrect info
            }
       }
    }
    next();
}

// Validate boat type length if exists
module.exports.isValidBoatType = (req, res, next) => {
    if (req.body.type) {
        const prop = req.body.type.trim();
        
        // Check for existence and length
        if (!prop || prop.length < MIN_STRING_LENGTH || prop.length > MAX_BOAT_TYPE_LENGTH) {
            console.log('boat type');
            return res.status(400).send('Invalid type');
        }
    }
    next();
}

// Validate boat length and is integer if exists
module.exports.isValidBoatLength = (req, res, next) => {
    if (req.body.length) {
        const prop = req.body.length;
        // Check for integer and length
        if (isNaN(prop) || prop < MIN_BOAT_LENGTH || prop > MAX_BOAT_LENGTH) {
            return res.status(400).send('Invalid length');
        }
    }
    next();
}

// Ensure proper number of attributes are defined
module.exports.isValidBoatPostBody = (req, res, next) => {
    if (!req.body.name || !req.body.length || !req.body.type || Object.keys(req.body).length != NUM_BOAT_ATTRIBUTES) {
        return res.status(400).send('The request object body is invalid');
    }
    next();
}

// Ensure no extranneous attributes and something to change
module.exports.isValidBoatPatchBody = (req, res, next) => {
    if (!req.body.name && !req.body.length && !req.body.type) {
        return res.sendStatus(204); // Nothing to update
    }
    if (Object.keys(req.body).length > NUM_BOAT_ATTRIBUTES) {
        return res.status(400).send('The request object body is invalid'); // Too many attributes
    }
    next();
}

// Ensure proper number of attributes are defined
module.exports.isValidLoadPostBody = (req, res, next) => {
    if (!req.body.volume || !req.body.content || Object.keys(req.body).length != NUM_LOAD_ATTRIBUTES) {
        return res.status(400).send('The request object body is invalid');
    }
    next();
}

// Ensure no extranneous attributes and something to change
module.exports.isValidLoadPatchBody = (req, res, next) => {
    if (!req.body.volume && !req.body.content ) {
        return res.sendStatus(204); // Nothing to update
    }
    if (Object.keys(req.body).length > NUM_LOAD_ATTRIBUTES) {
        return res.status(400).send('The request object body is invalid'); // Too many attributes
    }
    next();
}



module.exports.isValidJsonSyntax = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
        // Handle JSON syntax errors in request body.
        return res.status(400).send("Invalid syntax in JSON body");
    }
    next();
}

// Enforce client can except only JSON or html
module.exports.isValidGetAcceptHeader = (req, res, next) => {
    if (!req.accepts(['application/json', 'text/html'])) {
        return res.status(406).send('Invalid Content-Type requested');
    }
    next();
}

// Ensure client sends Content-Type as JSON
module.exports.isValidContentTypeHeader = (req, res, next) => {
    if (req.get('Content-Type') !== 'application/json') {
        return res.status(415).send("Server only accepts application/json data.");
    }
    next();
}

// Enforce client can except only JSON
module.exports.isJsonAcceptHeader = (req, res, next) => {
    if (!req.accepts(['application/json'])) {
        return res.status(406).send('Invalid Content-Type requested');
    }
    next();
}


// Used for deleting all entities.
// * Dont use this in production
module.exports.isAdmin = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const token = bearerHeader.split(' ')[1]; // Get 2nd element of ["Bearer", "<token>"]
            if (token === process.env.ADMIN_TOKEN) {
                next();
            }
            return res.sendStatus(404);
    } else {
        return res.sendStatus(404);
    }
}