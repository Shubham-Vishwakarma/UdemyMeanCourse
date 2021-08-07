const Post = require('../models/post')

exports.createPost = (req, res, next) => {

  const url = req.protocol + "://" + req.get("host");

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });

  console.log(post)
  post.save().then(result => {
    console.log(result);
    res.status(201).json({
      message: "Post Added Successfully",
      post: {
        id: result._id,
        title: result.title,
        content: result.content,
        imagePath: result.imagePath
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: "Creating a post failed!"
    })
  });
}

exports.updatePost = (req, res, next) => {

  let imagePath = req.body.imagePath;

  if(req.file){
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  }

  console.log("Updated image path = " + imagePath)

  var updatedPost = {};
  updatedPost = Object.assign(updatedPost, req.body, { imagePath: imagePath, creator: req.userData.userId })
  delete updatedPost._id

  Post.updateOne(
    { _id: req.params.id, creator: req.userData.userId },
    updatedPost,
  ).then((result) => {
    if(result.n > 0)
      res.status(200).json({ message: 'Post Updated' })
    else {
      res.status(401).json({ message: 'Not Authorized' })
    }
  })
  .catch(error  => {
    res.status(500).json({ message: "Couldn't update post!" })
  });

}

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  console.log("pageSize = " + pageSize)
  console.log("currentPage = " + currentPage)
  const postQuery = Post.find()
  let fetchedPosts;

  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
  }

  postQuery
    .then(posts => {
      fetchedPosts = posts
      return Post.countDocuments();
    })
    .then(count => {
      console.log(fetchedPosts);
      res.status(200).json({
        message: "Post\'s feteched successfully!!!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error  => {
      res.status(500).json({ message: "Fetching post failed" })
    });
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if(post) {
      res.status(200).json(post)
    }
    else {
      res.status(404).json('Post not found')
    }
  })
  .catch(error  => {
    res.status(500).json({ message: "Fetching post failed" })
  });;
}

exports.deletePost = (req, res, next) => {
  console.log('Delete: ' + req.params.id);

  Post.deleteOne({
    _id: req.params.id,
    creator: req.userData.userId
  }).then(result => {
    console.log(result);
    if(result.deletedCount > 0)
      res.status(200).json({ message: "Post deleted" })
    else {
      res.status(401).json({ message: 'Not Authorized' })
    }
  })
  .catch(error  => {
    res.status(500).json({ message: "Deleting post failed" })
  });
}
