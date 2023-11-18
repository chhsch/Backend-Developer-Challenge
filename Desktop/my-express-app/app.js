require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs'); // Required for file stream
const s3 = new AWS.S3();
const { Post, User } = require('./database'); // Assuming you have these models

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' });

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
    
    // 使用 Sequelize 創建新用戶
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
    
    // 使用 Sequelize 查找用戶
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



app.post('/posts', upload.single('photo'), async (req, res) => {
  try {
    const { description } = req.body;
    const file = req.file;

    // 上傳到 S3
    const s3Result = await s3.upload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.filename,
      Body: fs.createReadStream(file.path)
    }).promise();

    // 創建帖子並保存到數據庫
    const post = await Post.create({
      description,
      photoUrl: s3Result.Location
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating post');
  }
});

app.post('/upload', upload.single('photo'), async (req, res) => {
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


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
