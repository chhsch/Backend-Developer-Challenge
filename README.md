# Application Overview
##This application allows users to register, login, and create posts with photos. The posts are stored in a PostgreSQL database, and the photos are uploaded to an AWS S3 bucket. JWT tokens are used for authentication.

### Req1
## Implementation Steps

### Express.js App Initialization

Set up the basic Express.js server with middleware for parsing JSON and handling multipart/form-data.

### Database Models

Define Sequelize models for `User` and `Post`. Ensure the user model has fields for `name`, `email`, and `password`. The post model should have `description` and `photoUrl`.

### User Registration

Create a registration endpoint that takes `name`, `email`, and `password`, hashes the password, and stores the user in the database.

### User Login

Create a login endpoint that checks the `email` and `password`, and upon success, returns a JWT token.

### Post Creation

Create an endpoint for post creation that is protected with JWT middleware. It should accept a `description` and a photo file, upload the photo to S3, and store the post in the database with the S3 URL.


![gg](https://github.com/chhsch/Backend-Developer-Challenge/assets/110040645/542f37ee-3816-451f-82c4-35dc43ee465d)
