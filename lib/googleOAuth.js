// Google Auth
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GCLOUD_CLIENT_ID);
const { userModel } = require('../models/users');

// Needed because auth does not use cookies per spec. Instead, we use JWT ID token as a bearer token.
module.exports.verify = async token => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GCLOUD_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    return payload; // payload.sub is user id

}

// Used by browser to redirect for userInfo page
module.exports.authenticated = async (req, res, next) => {
    const token = req.cookies['session-token'];
    try {
        const payload = await this.verify(token);
        req.user = userModel(payload);
        req.user.googleIdJWT = token;
        req.user.client_id = process.env.GCLOUD_CLIENT_ID;
        next();
    }
    catch (e) {
        return res.redirect('login'); // Could not verify, status 302
    }
}

// TODO: Move this somewhere else
module.exports.authenticatedBearerJWT = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const token = bearerHeader.split(' ')[1]; // Get 2nd element of ["Bearer", "<token>"]
        try {
            const payload = await this.verify(token);
            req.token = token;
            req.googleId = payload.sub;
            next();
        } catch (e) {
            // TODO: Does not work using browser. Use res.redirect(401, 'login')
            return res.status(401).location(req.protocol + '://' + req.get('host') + '/login').end(); // Could not verify, overwrite original 302
        };
    } else {
        // TODO: Does not work using browser. Use res.redirect(401, 'login')
        return res.status(401).location(req.protocol + '://' + req.get('host') + '/login').end(); // Could not verify, overwrite original 302
    }
}