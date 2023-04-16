#API Documentation

This API allows users to create, read, update, and delete stories. Users can also sign up and log in using JWT authentication.

##Base URL
http://localhost:3000

##Endpoints
#####POST /signup
This endpoint creates a new user with a name, email, and password. The email must be unique.

####Request
```
POST /signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword"
}
```

####Response
If the user is successfully created, the response includes a JWT token.
`{
  "token": "<your-jwt-token>"
}`

###POST /login
This endpoint logs in an existing user with an email and password. If the email and password match, the response includes a JWT token.

Request
```
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "mypassword"
}
```
###POST /stories
This endpoint creates a new story with a name, text, and user ID.

#####Request

```
POST /stories
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "My Story",
  "text": "This is my story."
}
```

#####Response
If the story is successfully created, the response includes the story object.
```
{
  "_id": "<story-id>",
  "name": "My Story",
  "text": "This is my story.",
  "user": "<user-id>",
  "__v": 0
}
```

###GET /stories
This endpoint retrieves all stories and their associated user objects.

#####Request

######GET /stories
Response
If there are stories in the database, the response includes an array of story objects.

```
[  {    "_id": "<story-id>",    "name": "My Story",    "text": "This is my story.",    "user": {      "_id": "<user-id>",      "name": "John Doe",      "email": "john@example.com",      "__v": 0    },    "__v": 0  },  ...]
```

###GET /stories/:id
This endpoint retrieves a specific story and its associated user object.

Request

######GET /stories/<story-id>
Response
If the story exists in the database, the response includes the story object.

```
{
  "_id": "<story-id>",
  "name": "My Story",
  "text": "This is my story.",
  "user": {
    "_id": "<user-id>",
    "name": "John Doe",
    "email": "john@example.com",
    "__v": 0
  },
  "__v": 0
}
```

##PUT /stories/:id
This endpoint updates a specific story with a new name and/or text.

####Request
```
PUT /stories/<story-id>
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "My New Story",
  "text": "This is my new story."
}
```
Response
If the story is successfully updated, the response includes the updated story object.

```
  "_id": "<story-id>",
  "name": "My New Story",
  "text": "This is my new story
```

##DELETE /stories/:id
This endpoint deletes a specific story.

####Request

DELETE /stories/<story-id>
Authorization: Bearer <your-jwt-token>
#####Response
If the story is successfully deleted, the response includes a success message.
```
{
  "message": "Story deleted successfully."
}
```

#JWT Authentication
JWT is used for authentication in this API. After a user logs in or signs up, a token is generated and returned to the client. This token must be included in the Authorization header of all subsequent requests that require authentication.

`Authorization: Bearer <your-jwt-token>`
If the token is missing or invalid, the API will return a 401 Unauthorized error.
