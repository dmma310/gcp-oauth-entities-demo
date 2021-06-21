const { Datastore } = require('@google-cloud/datastore');
const { PAGINATION_LIMIT } = require('../lib/constants');

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable.
// These environment variables are set automatically on Google App Engine
module.exports.datastore = new Datastore({ projectId: process.env.GCLOUD_PROJECT });
module.exports.fromDatastore = item => {
    item.id = item[Datastore.KEY].id;
    return item;
}

// module.exports.entityCount = async kind => {
//     const q = await this.datastore.runQuery(this.datastore.createQuery(kind).select('__key__'));
//     console.log(q) // Get keys only to limit result size
//     return (
//         await this.datastore.runQuery(
//             this.datastore.createQuery(kind).select('__key__') // Get keys only to limit result size
//         )
//     )[0].length;
// }

module.exports.deleteAllEntities = async (kind, deleteFunction) => {
    try {
        const q = this.datastore.createQuery(kind);
        let entities = await this.datastore.runQuery(q);
        entities = entities[0].map(this.fromDatastore);
        return await Promise.all(entities.map(async entity => {
            await deleteFunction(entity.id);
        }))
            // .then(_ => true)
            // .catch(e => { throw (e) });
    }
    catch (e) {
        return false;
    }
}

module.exports.getEntity = (kind, id = null) => {
    const key = id == null ? this.datastore.key(kind) : this.datastore.key([kind, parseInt(id, 10)]);
    return this.datastore.get(key);
}

module.exports.getFilteredEntities = async (req, kind, field = null, value = null) => {
    let q;
    if (field == null || value == null) {
        q = this.datastore.createQuery(kind).limit(PAGINATION_LIMIT);
    }
    else {
        q = this.datastore.createQuery(kind).filter(field, value).limit(PAGINATION_LIMIT);
    }

    if (Object.keys(req.query).includes("cursor")) {
        q = q.start(req.query.cursor);
    }
    try {
        // Get all entities, add id property to each, save in results
        const entities = await this.datastore.runQuery(q);
        const results = {};
        results.items = entities[0].map(this.fromDatastore);
        if (entities[1].moreResults !== this.datastore.NO_MORE_RESULTS) {
            results.next = req.protocol + "://" + req.get("host") + req.baseUrl
                + "?cursor=" + entities[1].endCursor;
        }
        results.count = results.items.length;
        return results;
    }
    catch (e) {
        throw (e);
    }
}

// TODO: Use this in saveUser, saveBoat, saveLoad
module.exports.saveEntity = async (kind, entity, id = null) => {
    // Create key with either empty id (does not exist yet) or with existing id
    const key = id == null ? datastore.key(kind) : datastore.key([kind, parseInt(id, 10)]);
    // datastore.save determines the correct Datastore method to execute
    // (upsert, insert, or update) by using the key(s) provided.
    // Need to pass all fields, else missing fields are set to null
    await datastore.save({
        "key": key, "data": entity
    });
    return key;
}