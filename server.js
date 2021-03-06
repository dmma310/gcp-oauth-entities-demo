const express = require('express');
const app = express();
const path = require('path');
const { datastoreStore } = require('./lib/datastore');
const { EXPRESS_SESSION_COOKIE_EXPIRY } = require('./lib/constants');
app.use(express.json());
app.use(express.urlencoded());
const session = require('express-session');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.disable('x-powered-by'); // disable hackers from detecting that express is used.

require('dotenv').config();
app.set('view engine', 'ejs');

app.enable('trust proxy'); // Ensure req.protocol can use https if applicable

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Store sessions in datastore
app.use(session({
  cookie: {
    // secure: true, // https only
    maxAge: EXPRESS_SESSION_COOKIE_EXPIRY,
    httpOnly: true, // Mitigate XSS, prevent JS using document.cookie on front end
  },
  store: datastoreStore,
  resave: false,
  saveUninitialized: true,
  secret: `${process.env.SESSION_SECRET}`
}));

app.use('/', require('./index'));

const PORT = process.env.PORT || 8000;
app.listen(process.env.PORT || 8000, () => {
  console.log(`App listening on port ${PORT}. Press Ctrl+C to quit.`);
});
