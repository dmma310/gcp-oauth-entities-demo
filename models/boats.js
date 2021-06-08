const { datastore, fromDatastore, getFilteredEntities, getEntity } = require('../lib/datastore');
const { BOAT, LOAD } = require('../lib/constants');
const load = require('../models/loads');

module.exports.saveBoat = async ({ name, type, length, owner, loads = null, id = null }) => {
    // Create key with either empty id (does not exist yet) or with existing id
    const key = id == null ? datastore.key(BOAT) : datastore.key([BOAT, parseInt(id, 10)]);
    // datastore.save determines the correct Datastore method to execute
    // (upsert, insert, or update) by using the key(s) provided.
    // Need to pass all fields, else missing fields are set to null
    await datastore.save({
        "key": key, "data": this.boatDAO(name, type, length, owner, loads)
    });
    return key;
}

module.exports.getFilteredBoats = async (req, field, value) => {
    return await getFilteredEntities(req, BOAT, field, value);
}

// module.exports.getBoat = function getBoat(id) {
module.exports.getBoat = id => {
    return getEntity(BOAT, id);
}

module.exports.getBoatLoads = async id => {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    const boat = await datastore.get(key);
    const boatObj = boat[0];
    if (boatObj.loads != null) {
        // Get all load keys from load ids. If none exists, caught by catch block in caller
        const loadKeys = boatObj.loads.map(loadId => {
            return datastore.key([LOAD, parseInt(loadId.id, 10)]);
        });
        const loads = await datastore.get(loadKeys);
        if (loads[0] != null) {
            return loads[0].map(fromDatastore);
        }
    }
    return [];
}

// Update load with new carrier, and update boat with this new load.
module.exports.putLoadOnBoat = async req => {
    const boatKey = datastore.key([BOAT, parseInt(req.params.boat_id, 10)]);
    const boat = await datastore.get(boatKey);
    // Get boat and create/add to loads array
    if (boat[0].loads == null) {
        // Catches undefined and null values
        boat[0].loads = [];
    }
    // Add only if load doesn't exist in boat.loads
    if (boat[0].loads.find(obj => obj.id == req.params.load_id) == null) {
        boat[0].loads.push({
            id: req.params.load_id,
            self: req.protocol + '://' + req.get('host') + '/boats/' + req.params.load_id
        });
        return datastore.save({ "key": boatKey, "data": boat[0] });
    };
}

// Delete load in carrier if deleted load exists in boat
module.exports.deleteLoadOnBoat = async (boatId, loadId) => {
    try {
        const boat = await this.getBoat(boatId);
        if (boat[0].loads != null) {
            const key = datastore.key([BOAT, parseInt(boatId, 10)]);
            let boatObj = boat[0];
            boatObj.loads = boatObj.loads.filter(obj => obj.id !== loadId);
            boatObj.loads = boatObj.loads.length > 0 ? boatObj.loads : null;
            // Update boat with new load if other loads exist, else save without load property
            return await datastore.save({
                "key": key,
                "data": boatObj
            });
        }
    }
    catch (e) {
        throw e;
    }
};

module.exports.deleteBoat = id => {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    return datastore.delete(key);
};

module.exports.unloadBoatInLoad = loadObjs => {
    // Delete each load in the array of load objects
    return loadObjs.forEach(element => {
        return load.deleteCarrierInLoad(element.id);
    });
};


module.exports.boatDAO = (name, type, length, owner, loads) => {
    // Catches undefined and null values
    if (loads == null) {
        return { "name": name, "type": type, "length": length, "owner": owner };
    }
    return { "name": name, "type": type, "length": length, "loads": loads, "owner": owner };
};