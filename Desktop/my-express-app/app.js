require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const moment = require('moment'); // Required for time calculations
const s3 = new AWS.S3();
const { Post, User } = require('./database');

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' }).array('photos', 5);

// Configure AWS with environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
  // region: 'us-west-2'
});


const app = express();
app.use(express.json());


s3.listObjects({ Bucket: 'testbucket11062023' }, function(err, data) {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('Success', data);
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send('Name, email, and password are required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Creating new user by Sequelize 
    const newUser = await User.create({ name, email, password: hashedPassword });

    res.status(201).send(`User ${newUser.name} registered successfully`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering new user');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    
    const user = await User.findOne({ where: { email } });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        'yourSecretKey',
        { expiresIn: '1h' }
      );

      res.json({ token });
    } else {
      res.status(401).send('Email or password is wrong');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});



const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
};

const calculateTimeAgo = (date) => {
  return moment(date).fromNow();
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

const uploadSingle = multer({ storage: storage }).single('photo');
const uploadArray = multer({ storage: storage }).array('photos', 5);

app.post('/posts', authenticateToken, uploadArray, async (req, res) => {
  try {
    const { description } = req.body;
    const files = req.files;

    // Check for maximum of 5 photos
    if (files.length > 5) {
      return res.status(400).send('You can upload a maximum of 5 photos');
    }

    let photoUrl = [];
    for (const file of files) {
      const s3Result = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.filename,
        Body: fs.createReadStream(file.path)
      }).promise();

      photoUrl.push(s3Result.Location);
      fs.unlinkSync(file.path); // Delete file after upload
    }

    const post = await Post.create({
      description,
      photoUrl, // Array of URLs
      createdAt: new Date() // Capture creation time
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating post');
  }
});

app.post('/upload', uploadSingle, async (req, res) => {
  const file = req.file;
  const s3FileURL = process.env.AWS_UPLOADED_FILE_URL_LINK;

  try {
    // Upload to S3
    const s3Result = await s3.upload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}_${file.originalname}`, // Use timestamp to create a unique file name
      Body: fs.createReadStream(file.path)
    }).promise();

    // After upload, delete file from server
    fs.unlinkSync(file.path);

    // Respond with success
    res.status(201).json({
      message: 'File uploaded successfully',
      url: s3Result.Location
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file');
  }
});

// send friends' request
app.post('/add-friend/:friendId', authenticateToken, async (req, res) => {
  try {

    const friend = await Friend.create({
      requesterId: req.user.id,
      addresseeId: req.params.friendId,
    });

    res.status(201).json(friend);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding friend');
  }
});


// Edit a post's description
app.put('/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;
    const postId = req.params.postId;

    // Update the post
    const updatedPost = await Post.update({ description }, {
      where: { id: postId }
    });

    if (updatedPost[0] === 0) {
      return res.status(404).send('Post not found');
    }

    res.send('Post updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating post');
  }
});

// Get a post and calculate time ago
app.get('/posts/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    post.dataValues.timeAgo = calculateTimeAgo(post.createdAt);

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving post');
  }
});

// Retrieve the list of posts and provide pagination.
app.get('/posts', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10; 
  const page = parseInt(req.query.page, 10) || 1; 
  const offset = (page - 1) * limit;

  try {
    const result = await Post.findAndCountAll({ limit: limit, offset: offset });
    const posts = result.rows.map(post => ({
      ...post.dataValues,
      timeAgo: calculateTimeAgo(post.createdAt),
    }));

    res.json({
      totalPages: Math.ceil(result.count / limit),
      currentPage: page,
      posts: posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving posts');
  }
});

app.get('/friends', authenticateToken, async (req, res) => {
  try {

    const friends = await Friend.findAll({
      where: { requesterId: req.user.id },
      include: [{ model: User, as: 'FriendInfo' }], 
    });

    res.json({
      friends: friends,
      // mutualFriendsCount: mutualFriendsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving friends list');
  }

});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
