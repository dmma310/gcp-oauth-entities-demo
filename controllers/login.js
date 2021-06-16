const express = require('express');
const router = express.Router();
const { verify } = require('../lib/googleOAuth');
const { userModel, getUserByGoogleCreds, saveUser } = require('../models/users');

router.get('/', (req, res) => {
  return res.render('login');
})

// Not using cookies because expecting user to send ID token each time (in boats)
router.post('/', async (req, res) => {

  try {
    const payload = await verify(req.body.token);
    res.cookie('session-token', req.body.token, {
      maxAge: 18000000, // 30 minutes in ms
      httpOnly: true, // http only, prevents JavaScript cookie access
      secure: true // cookie must be sent over https / ssl
    }); // Set token sent from client (see onSignIn)
    // Find or create user in DB
    const val = await getUserByGoogleCreds(req, payload.sub); // Assume googleId is unique
    // Create new user if does not exist
    if (!val.items.length) {
      await saveUser(userModel(payload));
    }
    // Send this value to client (browser) to sign out (on the client side) so that all persistence is handled by the server
    return res.status(200).send('success');
  }
  catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

router.use((req, res) => {
  return res.sendStatus(404);
});

module.exports = router;