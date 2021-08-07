const path = require('path')
const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const postRoutes = require('./routes/posts')
const userRoutes = require('./routes/user')

mongoose.connect("mongodb+srv://meancourse:" + process.env.MONGO_ATLAS_PW + "@meancourse.ajgsb.mongodb.net/meancourse?retryWrites=true&w=majority")
  .then(() => {
    console.log('Connected to database');
  })
  .catch(() => {
    console.log('Connection failed');
  });

// qCnOhDc8CQx58JAX

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use("/images", express.static(path.join("backend/images")))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PATCH, DELETE, OPTIONS, PUT");
  next();
});

app.use('/api/posts', postRoutes)
app.use('/api/user', userRoutes)

module.exports = app;
