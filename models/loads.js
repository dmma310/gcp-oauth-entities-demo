const { datastore, getFilteredEntities, fromDatastore, getEntity } = require('../lib/datastore');
const { LOAD } = require('../lib/constants');

module.exports.getLoads = async req => {
    return await getFilteredEntities(req, LOAD);
}


module.exports.getLoad = async id => {
    return getEntity(LOAD, id);
}


// module.exports.putLoad = (id, volume, content, carrier, creationDate) => {
module.exports.saveLoad = async ({ volume, content, carrier = null, creationDate = null, id = null }) => {
    // Create key with either empty id (does not exist yet) or with existing id
    const key = id == null ? datastore.key(LOAD) : datastore.key([LOAD, parseInt(id, 10)]);
    // datastore.save determines the correct Datastore method to execute
    // (upsert, insert, or update) by using the key(s) provided.
    // Need to pass all fields, else missing fields are set to null
    await datastore.save({
        "key": key, "data": loadDAO(volume, content, carrier, creationDate)
    });
    return key;
}

module.exports.deleteLoad = id => {
    const key = datastore.key([LOAD, parseInt(id, 10)]);
    return datastore.delete(key);
}

module.exports.deleteCarrierInLoad = async id => {
    const key = datastore.key([LOAD, parseInt(id, 10)]);
    const load = await this.getLoad(id);
    await datastore.save({
        "key": key,
        "data": loadDAO(
            load[0].volume,
            load[0].content,
            {},
            load[0].creationDate)
    });
    return key;
}

function loadDAO(volume, content, carrier, creationDate) {
    if (carrier == null) {
        carrier = {};
    }
    if (creationDate == null) {
        creationDate = (new Date()).toLocaleDateString();
    }
    return { "volume": volume, "carrier": carrier, "content": content, "creationDate": creationDate };
}