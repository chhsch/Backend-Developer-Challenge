## Req2 Implementation Steps

### Timestamp for Post Creation

When defining the Post model with Sequelize, include a createdAt attribute that records the timestamp when a new post is created. 

### Time Difference Calculation

To display the time difference in a human-readable format like "2s ago" or "1yr ago", I will use the moment library.

### Multiple Photos for a Post

To allow a post to have multiple photos (up to 5), I will store the URLs of the photos in an array. Modify the Post model to have a photoUrls attribute that is an array of strings. 

### Editing a Post's Description

To allow users to edit a post's description, add a PUT route that updates the post.


### Results

Each post will have an attribute and post returning api will calculate the time

![](https://github.com/chhsch/Backend-Developer-Challenge/assets/110040645/c5a2ac2d-8569-4280-81bf-477a0564bd7e)

getting post by id works successfully

![](https://github.com/chhsch/Backend-Developer-Challenge/assets/110040645/d9f2903f-1b3a-4d4b-bc9e-ed2e1839e877)

