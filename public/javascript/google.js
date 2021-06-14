// Sign out front end and go to /logout on back end to clear cookie
async function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    try {
        await auth2.signOut();
        console.log('User signed out.');
    }
    catch (e) {
        throw e;
    }
}

// After sign in, send id token to server
function onSignIn(googleUser) {
    // var profile = googleUser.getBasicProfile(); // Get user Google ID, name, profile URL, email address
    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('Name: ' + profile.getName());
    // console.log('Image URL: ' + profile.getImageUrl());
    // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    const id_token = googleUser.getAuthResponse().id_token;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/login');
    xhr.setRequestHeader('Content-Type', 'application/json');
    // Process response from server
    xhr.onload = _ => {
        console.log('Signed in as: ' + xhr.responseText);
        // If response from server is 'success', sign out (on the client side) so that all persistence is handled by the server
        if (xhr.responseText == 'success') {
            signOut();
            location.assign('/userInfo');
        }
    };
    xhr.send(JSON.stringify({ token: id_token }));
}

async function userProfile() {
    const auth2 = gapi.auth2.getAuthInstance();
    // auth2 is initialized with gapi.auth2.init() and a user is signed in.
    if (auth2.isSignedIn.get()) {
        const profile = auth2.currentUser.get().getBasicProfile();
        console.log('ID: ' + profile.getId());
        console.log('Full Name: ' + profile.getName());
        console.log('Given Name: ' + profile.getGivenName());
        console.log('Family Name: ' + profile.getFamilyName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());
    }
}