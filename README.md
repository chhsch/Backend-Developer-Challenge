# Application Overview
##This application allows users to register, login, and create posts with photos. The posts are stored in a PostgreSQL database, and the photos are uploaded to an AWS S3 bucket. JWT tokens are used for authentication.

## Req1 Implementation Steps

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

###Results

register successfully
![gg](https://github.com/chhsch/Backend-Developer-Challenge/assets/110040645/1291c6c7-9b4d-4ba8-8db2-fe685cd1661b)

login successfully anf get token

![](https://github.com/chhsch/Backend-Developer-Challenge/assets/110040645/e7806c05-8d03-4b0b-96be-58a99320abdd)

If register with the same Name, there will be an error
![](https://github.com/chhsch/Backend-Developer-Challenge/assets/110040645/7a9e0ec5-6e51-4b1f-bd34-cc7508d352fa)

## Req2 Implementation Steps

###Timestamp for Post Creation

When defining the Post model with Sequelize, include a createdAt attribute that records the timestamp when a new post is created. 

###Time Difference Calculation

To display the time difference in a human-readable format like "2s ago" or "1yr ago", I will use the moment library.

###Multiple Photos for a Post

To allow a post to have multiple photos (up to 5), I will store the URLs of the photos in an array. Modify the Post model to have a photoUrls attribute that is an array of strings. 

###Editing a Post's Description

To allow users to edit a post's description, add a PUT route that updates the post.


###Results

Each post will have an attribute and post returning api will calculate the time

![](https://github.com/chhsch/Backend-Developer-Challenge/assets/110040645/c5a2ac2d-8569-4280-81bf-477a0564bd7e)

getting post by id works successfully

![](https://github.com/chhsch/Backend-Developer-Challenge/assets/110040645/d9f2903f-1b3a-4d4b-bc9e-ed2e1839e877)

## Req3 Implementation Steps

###Adding Pagination to Posts
To implement pagination, modify the endpoint that retrieves posts to accept two query parameters: page and limit.

###User Can Add Friends
For users to add friends, create a new Friend model and a route to handle friend requests.

###Friends List Endpoint Returns Friends' Info and Number of Mutual Friends
This feature requires a more complex query to calculate mutual friends.

