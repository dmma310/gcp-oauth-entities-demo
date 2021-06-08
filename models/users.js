const { datastore, getFilteredEntities, getEntity } = require('../lib/datastore');
const { USER } = require('../lib/constants');

module.exports.getUsers = async req => {
    return getFilteredEntities(req, USER, null, null);
}

module.exports.getUser = id => {
    return getEntity(USER, id);
}

module.exports.saveUser = async (user, id = null) => {
    // Create key with either empty id (does not exist yet) or with existing id
    const key = id == null ? datastore.key(USER) : datastore.key([USER, parseInt(id, 10)]);
    // datastore.save determines the correct Datastore method to execute
    // (upsert, insert, or update) by using the key(s) provided.
    // Need to pass all fields, else missing fields are set to null
    await datastore.save({
        "key": key, "data": user
    });
    return key;
}

module.exports.getUserByGoogleCreds = (req, googleId) => {
    return getFilteredEntities(req, USER, 'googleId', googleId);
}

module.exports.userModel = ({ sub, email, given_name, family_name, picture, googleIdJWT = null }) => {
    return {
        "givenName": given_name,
        "familyName": family_name,
        "email": email,
        // "googleIdJWT": googleIdJWT,
        "googleId": sub,
        "picture": picture
    }
}

