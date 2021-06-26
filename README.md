# Video for app demo
https://www.dropbox.com/s/l85h51crkv53lem/gcp-oauth-demo.mp4?dl=0

# Application URL (as of 2021)
https://gcp-demo-dex.wl.r.appspot.com

Full stack app using Node.js, Express.js, GCP (Datastore & OAuth), EJS and Bootstrap 4
See /specs/api_spec.doc for details on entities, relationships, and how to use the API
# Specification

## Overview
Implement a REST API that uses resource based URLs, pagination and status codes.
Implement system for creating users and for authorization (using Google OAuth).
Application on Google Cloud Platform.
  - Datastore to store data
  - Express.js and Node.js
  - EJS and Bootstrap 4
  - Google App Engine to deploy project

## Application entities

- An entity to model the user.
- Two other non-user entities (boats and loads).
- The two non-user entities are related to each other.
  - A boat can have zero, one or more loads on it.
  - A load can have zero or one boat/carrier assigned to it.
- The user is related to one of the non-user entities (boats).
- Resources corresponding to the non-user entity related to the user is protected.

## Backend

### Non-user entities

1. For each entity a collection URL is provided that is represented by the collection name.
  - E.g., GET /boats represents the boats collection
2. If an entity is related to a user, then the collection URL shows only those entities in the collection which are related to the user corresponding to the valid JWT provided in the request
  - E.g., if each boat is owned by a user, then GET /boats only shows those entities that are owned by the user who is authenticated by the JWT supplied in the request
  - JWT is stored in as a token in the browser cookies
3. For an entity that is not related to users, the collection URL shows all the entities in the collection.
4. The collection URL for an entity implements pagination showing 5 entities at a time
  - The server includes a &#39;next&#39; link on every page except the last
  - The collection includes a property that indicates how many total items are in the collection
5. Every representation of an entity haw a &#39;self&#39; link pointing to the canonical representation of that entity
6. Each entity has at least 3 properties of its own.
  - id and self are not considered a property in this count.
  - Properties to model related entities are also not considered a property in this count.
    - E.g., a boat is not a property of a load, and neither is the owner of a boat.
7. Every entity must supports all 4 CRUD operations, i.e., create/add, read/get, update/edit and delete.
  - All &quot;side effects&quot; are handled
    - E.g., If a load is removed from a boat, the load also removes its boat/carrier to become empty
  - Update for an entity supports both PUT and PATCH.
8. Every CRUD operation for an entity related to a user is protected and requires a valid JWT corresponding to the relevant user.
9. Endpoint is available to create/remove a relationship between the two non-user entities.
  - E.g., put a load on a boat, or remove a load from a boat.
10. If an entity has a relationship with other entities, then this info is displayed in the representation of the entity
  - E.g., if a load is on a boat, then
    - The representation of the boat shows the relationship with this load
    - The representation of this load shows the relationship with this boat
13.  Any request and response bodies are in JSON
  - Responses from some endpoints, e.g., DELETE, don&#39;t have a body.
14. Any request to an endpoint that will send back a response with a body includes &#39;application/json&#39; in the Accept header. If a request doesn&#39;t have such a header, it is rejected.

### User Details

1. You must have a User entity in your database.
2. You must support the ability for users of the application to create user accounts. There is no requirement to edit or delete users.
3. You may choose from the following methods of handling user accounts
  - You can handle all account creation and authentication yourself.
  - You can use a 3rd party authentication service (e.g., Auth0 or Google).
4. You must provide a URL where a user can provide a username and password to login or create a user account.
5. Requests for the protected resources must use a JWT for authentication. So you must show the JWT to the user after the login. You must also show the user&#39;s unique ID after login.
6. The choice of what to use as the user&#39;s unique ID is up to you.
  - You can use the value of &quot;sub&quot; from the JWT as a user&#39;s unique ID. But this is not required.
7. You must provide an unprotected endpoint  **GET /users**  that returns all the users currently registered in the app, even if they don&#39;t currently have any relationship with a non-user entity. The response does not need to be paginated.
  - Minimally this endpoint should display the unique ID for a user. Beyond that it is your choice what else is displayed.
8. There is no requirement for an integration at the UI level between the login page and the REST API endpoints.


### Status Codes

Application supports the following status codes.

1. 200
2. 201
3. 204
4. 401
5. 403
6. 405
7. 406


Postman Test Collection

1. Create, read, update and delete operations for all non-user entities.
2. Read operations for all collections of non-user entities.
3. Creating and deleting relationships between non-user entities.
4. Verify status code showing things working as intended.
  - Entities created by one user can be read, updated and deleted by that user.
  - Entities created by one user cannot be read, updated and deleted by another user.
  - Requests to protected resources are rejected if the JWT is invalid.
  - Requests to protected resources are rejected if the JWT is missing.
6. The tests verify at least the response code.
7. In your spec you need to specify valid values for the properties in the request body. However, your application and your tests don&#39;t need to cover input validation. You can assume that the input will be valid per your specification.
8. One user can&#39;t read, edit or delete an entity created by another user:
9. Verify the endpoints that create and remove relationships:
  - Show the resources before the relationship is created (or removed)
  - Create (or remove) the relationship
  - Show the resources after the relationship has been created (or removed)

## Frontend
- EJS and Bootstrap 4
- Redirect to login page if not logged in
- Boats Page
  - Displays paginated Boats that user owns
    - Id, name, type, length
  - Edit Boat
  - View loads on each boat that user owns
    - Id, volume, content, created date
    - Edit Load
    - View/Edit associated carrier (boat), including removing Load from Boat
    - Delete Load
    - Add Load
      - Creates new Load and assigns it to Boat
  - Delete Boat
  - Add Boat
    - Creates new Boat
- Loads Page
  - Displays paginated Loads that user owns
    - Id, volume, content, created date
  - Edit Load
  - View/Edit associated carrier (boat), including removing Load from Boat
  - Delete Load
  - Add Load
    - Creates new Load
  - Delete Boat
- User Info Page
  - Google Photo
  - Family Name
  - Given Name
  - Email Address
