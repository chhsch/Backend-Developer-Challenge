// database.js
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
  }
);


const User = sequelize.define('User', {
  name: Sequelize.STRING,
  email: { type: Sequelize.STRING, unique: true },
  password: Sequelize.STRING
});
const Post = sequelize.define('Post', {
  description: Sequelize.TEXT,
  photoUrl: Sequelize.STRING // 圖片在 S3 的 URL
});

sequelize.sync();

module.exports = { sequelize, User, Post  };
