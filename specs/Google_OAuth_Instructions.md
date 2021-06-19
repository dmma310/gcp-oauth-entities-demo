# Google OAuth

1. Create new API credentials
2. Add Authorized Javascript origins to enable JS on front-end > used for sign in
  - <https://gcp-demo-dex.wn.r.appspot.com>
3. Add authorized redirect URLs for server to handle > After sign in, redirect to server with POST and id_token
  - /login
4. Add OAuth consent screen > make public
5. Create front-end
  - Source: <https://developers.google.com/identity/sign-in/web/sign-in>
6. Handle on backend
  - welcome page with sign-in button
  - sign in using client-side ejs
  - redirect to server with id token (POST /login)
  - in server router.post('/login'...), set cookie with id_token and send 'success' back to client
  - This tells the client to sign out (on the client side) so that all persistence is handled by the server
  - Client redirects to user info page via location.assign