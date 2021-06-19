Full stack app using Node.js, Express.js, GCP (Datastore & OAuth), EJS and Bootstrap 4
Users, Boats, Loads Entities
Relationships between: Boats <> Users; Boats <> Loads

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


# Purpose
Note: this final project is the "Portfolio Assignment" for the course. This means that you are allowed to post the entirety of the assignment publicly (e.g. Github, personal website, etc.). You can use this as an opportunity to showcase your work to potential employers.

In this assignment you will pull together all of the pieces you have worked on up to this point. You will need to implement a REST API that uses proper resource based URLs, pagination and status codes. In addition you will need to implement some sort of system for creating users and for authorization. You will deploy your application on Google Cloud Platform.

The default is that you must use
Datastore to store your data, and
Either Node.js or Python 3, and
Google App Engine to deploy your project
However, contact the instructor if you want to use
A different database supported on GCP, or
A different programming language, or
A different GCP service to deploy your project
The instructional staff may not be able to provide much help if you follow this path, but requests to use something different are very likely to be accepted.
# Instructions
Your application needs to have

An entity to model the user.
At least two other non-user entities.
The two non-user entities need to be related to each other.
The user needs to be related to at least one of the non-user entities.
Resources corresponding to the non-user entity related to the user must be protected.
# Example
Looking back at the assignments you have done, let's consider Assignment 4

Assignment 4 didn't model users. If you were adapting Assignment 4 for this project, you would need to create an additional User entity.
There were two entities Boat and Load. This would meet the requirement for two non-user entities.
These entities had a relationship between them - a boat can have zero, one or more loads on it. This meets the requirement that the two non-user entities must have a relationship with each other.
For the final project, you need a relationship between the User entity and a non-user entity. If you were to enhance Assignment 4 so that a boat is owned by a user, then there would be a relationship between the User and Boat entities . This meets the requirement of User entity being related to at least one of the non-user entities.
You can also choose to have a relationship between User and Load, i.e., it is acceptable to have both entities be related to users. But this is not required and is your design choice.
Note: It is up to you to decide what entities your application has and what is the relationship between them. You are free to adapt a previous assignment for this project or have an entirely different data model as long as the requirements are met.

# Requirements for non-user entities
For each entity a collection URL must be provided that is represented  by the collection name.
E.g.,  GET /boats represents the boats collection
If an entity is related to a user, then the collection URL must show only those entities in the collection which are related to the user corresponding to the valid JWT provided in the request
E.g., if each boat is owned by a user, then GET /boats should only show those entities that are owned by the user who is authenticated by the JWT supplied in the request
For an entity that is not related to users, the collection URL should show all the entities in the collection.
The collection URL for an entity must implement pagination showing 5 entities at a time
At a minimum it must have a 'next' link on every page except the last
The collection must include a property that indicates how many total items are in the collection
Every representation of an entity must have a 'self' link pointing to the canonical representation of that entity
This must be a full URL, not relative path
Each entity must have at least 3 properties of its own.
id and self are not consider a property in this count.
Properties to model related entities are also not considered a property in this count.
E.g., a boat is not a property of a load in this count, and neither is the owner of a boat.
Properties that correspond to creation date and last modified date will be considered towards this count.
Every entity must support all 4 CRUD operations, i.e., create/add, read/get, update/edit and delete.
You must handle any "side effects" of these operations on an entity to other entities related to the entity.
E.g., Recall how you needed to update loads when deleting a boat.
Update for an entity should support both PUT and PATCH.
Every CRUD operation for an entity related to a user must be protected and require a valid JWT corresponding to the relevant user.
You must provide an endpoint to create a relationship and another to remove a relationship between the two non-user entities. It is your design choice to make these endpoints protected or unprotected.
E.g., In Assignment 4, you had provided an endpoint to put a load on a boat, and another endpoint to remove a load from a boat.
If an entity has a relationship with other entities, then this info must be displayed in the representation of the entity
E.g., if a load is on a boat, then
The representation of the boat must show the relationship with this load
The representation of this load must show the relationship with this boat
There is no requirement to provide dedicated endpoints to view just the relationship
E.g., Assignment 4 required an endpoint /boats/:boat_id/loads. Such an endpoint is not required in this project.
For endpoints that require a request body, you only need to support JSON representations in the request body.
Requests to some endpoints, e.g., GET don't have a body. This point doesn't apply to such endpoints.
 Any response bodies should be in JSON, including responses that contain an error message.
Responses from some endpoints, e.g., DELETE, don't have a body. This point doesn't apply to such endpoints.
Any request to an endpoint that will send back a response with a body must include 'application/json' in the Accept header. If a request doesn't have such a header, it should be rejected.

# User Details
You must have a User entity in your database.
You must support the ability for users of the application to create user accounts. There is no requirement to edit or delete users.
You may choose from the following methods of handling user accounts
You can handle all account creation and authentication yourself.
You can use a 3rd party authentication service (e.g., Auth0 or Google).
You must provide a URL where a user can provide a username and password to login or create a user account.
Requests for the protected resources must use a JWT for authentication. So you must show the JWT to the user after the login. You must also show the user's unique ID after login.
The choice of what to use as the user's unique ID is up to you.
You can use the value of "sub" from the JWT as a user's unique ID. But this is not required.
You must provide an unprotected endpoint GET /users that returns all the users currently registered in the app, even if they don't currently have any relationship with a non-user entity. The response does not need to be paginated.
Minimally this endpoint should display the unique ID for a user. Beyond that it is your choice what else is displayed.
There is no requirement for an integration at the UI level between the login page and the REST API endpoints.

# Not Able to Create Accounts for New Users?
If you are unable to create accounts for new users in your app, you can pre-create 2 users and provide their email and password in your PDF document for the loss of 5 points corresponding to the rubric item "Users can create new accounts."
In this case, the grader must still be able to use your app (either a web page or a REST API endpoint) to generate JWTs using the email and password info you have provided for these 2 users.
If you support this functionality via your REST API, then your Postman Collection must contain tests for each of these users that call the REST endpoint to generate JWTs and show the unique user ID.

# Status Codes
Your application should support at least the following status codes.

200
201
204
401
403
405
406

# Submission Details
You need to submit 4 files:

A file YourONID_project.pdf that should contain the following things
The URL where your application is deployed on GCP.
The URL for account creation/login (can be the same as above).
A data model section that includes the following information:
For all entities (user and non-user) their properties
For each property,
Its type
Whether or not it is required
Valid values
A description of the relationship between the non-user entities.
A description of how you are modeling the user entity in your application, including
What is the unique identifier for a user in your data model.
If a request needs to supply a user identifier, what needs to be specified by the person making the request.
How your application maps a supplied JWT to the identifier of a user.
What is the relationship between the user entity and non-user entity.
An API specification that details
All endpoints, i.e., the URL and the method.
For every endpoint, whether or not it is protected.
Status codes that an endpoint can return.
Sample requests and responses for these status codes.
You must use the API doc for Assignment 3 as a guide to what you need to specify.
A file YourONID_project.postman_collection.json with a Postman Collection of a test suite. See below for details about what tests this collection should contain.
A file YourONID_project.postman_environment.json with the Postman Environment your Postman test collection uses. This environment must contain at least the following 4 variables
jwt1
user_id1
jwt2
user_id2
The tests for protected endpoints must use the value of one of the jwt variables as the JWT for authentication.
If an endpoint requires a user_id is the URL, then the tests for this endpoint must use the variable user_id1 or user_id2
A file YourONID_project.zip that should include all the source code for your project. Please don't include node_modules or Python env in the zip file.

# Postman Test Collection
It must demonstrate create, read, update and delete operations for all non-user entities.
It must demonstrate read operations for all collections of non-user entities.
It must demonstrate creating and deleting relationships between non-user entities.
There must be at least one test per required status code showing things working as intended.
It must demonstrate user accounts working as intended
Show that entities created by one user can be read, updated and deleted by that user.
Show that entities created by one user cannot be read, updated and deleted by another user.
Show that requests to protected resources are rejected if the JWT is invalid.
Show that requests to protected resources are rejected if the JWT is missing.
The tests must verify at least the response code. It is not required that the tests verify the response body. However, the response body must match your API spec.
In your spec you need to specify valid values for the properties in the request body. However, your application and your tests don't need to cover input validation. You can assume that the input will be valid per your specification.
A possible Postman test to show that one user can't read, edit or delete an entity created by another user is the following;
Call your REST API to create an entity using jwt1 and then have a test that shows that attempts to read, edit and delete that entity using jwt2 are rejected.
A possible Postman test to verify the endpoints that create and remove relationships is as follows
Show the resources before the relationship is created (or removed)
Create (or remove) the relationship
Show the resources after the relationship has been created (or removed)