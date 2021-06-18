async function handleSaveForm(ev, successCode, id = null) {
    ev.preventDefault(); //stop the page reloading
    let myForm = ev.target;
    let fd = new FormData(myForm);

    // Form id must be named route_method_somethingElse (i.e. boats_post_form)
    let [route, method, ...rest] = myForm.id.split("_");
    let json = await convertFDToJSON(fd);

    if (id !== null) {
        route += `/${id}`;
    }
    let xhr = new XMLHttpRequest();

    xhr.open(method, `/${route}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    // Process response from server
    xhr.onload = _ => {
        // If response from server is 'success', sign out (on the client side) so that all persistence is handled by the server
        if (xhr.status === successCode) {
            // location.assign(`${route.split('/')[0]}`);
            location.reload();
        }
        else {
            console.log(`Error ${xhr.status}: ${xhr.statusText}: ${xhr.responseText}`); // TODO: Not safe
        }
    };
    xhr.send(json);
}

// Handle adding load carrier 
function handleAddLoadCarrierForm(ev, successCode, loadId, method) {
    ev.preventDefault();
    
    let myForm = ev.target;
    const fd = new FormData(myForm);
    // Edit with route /loads/load_id/boats/boat_id
    const boatId = fd.get('boat_id');
    const route = `${myForm.id.split("_")[0]}/${loadId}/boats/${boatId}`;

    let xhr = new XMLHttpRequest();
    xhr.open(method, `/${route}`);
    // Process response from server
    xhr.onload = _ => {
        // If response from server is 'success', sign out (on the client side) so that all persistence is handled by the server
        if (xhr.status === successCode) {
            location.reload();
        }
        else {
            console.log(`Error ${xhr.status}: ${xhr.statusText}: ${xhr.responseText}`); // TODO: Not safe
        }
    };
    xhr.send();
}

// Handle removing load carrier /boats/boat_id/loads/load_id
function handleDeleteLoadCarrierForm(ev, successCode, method, route) {
    ev.preventDefault();

    let xhr = new XMLHttpRequest();
    xhr.open(method, `/${route}`);
    // Process response from server
    xhr.onload = _ => {
        // If response from server is 'success', sign out (on the client side) so that all persistence is handled by the server
        if (xhr.status === successCode) {
            location.reload();
        }
        else {
            console.log(`Error ${xhr.status}: ${xhr.statusText}: ${xhr.responseText}`); // TODO: Not safe
        }
    };
    xhr.send();
}

function handleDeleteForm(ev, id = null) {
    ev.preventDefault();
    // Form id must be named route_method_somethingElse (i.e. boats_post_form)
    let [route, ...rest] = ev.target.id.split("_");

    if (id !== null) {
        route += `/${id}`;
    }

    let xhr = new XMLHttpRequest();

    xhr.open('delete', `/${route}`);
    // Process response from server
    xhr.onload = _ => {
        // If response from server is 'success', sign out (on the client side) so that all persistence is handled by the server
        if (xhr.status === 204) {
            // location.assign(`${route.split('/')[0]}`);
            location.reload();
        }
        else {
            console.log(`Error ${xhr.status}: ${xhr.statusText}: ${xhr.responseText}`); // TODO: Not safe
        }
    };
    xhr.send();
}


function convertFDToJSON(formData) {
    let obj = {};
    for (let key of formData.keys()) {
        obj[key] = formData.get(key);
    }
    return JSON.stringify(obj);
}