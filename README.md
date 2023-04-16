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