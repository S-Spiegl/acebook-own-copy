const Like = require("../models/like");
const Post = require("../models/post");
const Format = require("../Format");
const receiveImage = require("../uploadiddleware");
const {uploadImage} = require("../utilities/cloudinaryUtil");

const PostsController = {
  Index: (req, res) => {
    Post.find()
      .populate("user_id")
      .populate("likes")
      .populate("comments")
      //populate is being used here to get associated data from
      //other tables. the id, the likes and the comments are stored in other
      //tables and linked with an id... need to get them over too
      .exec((err, posts) => {
        if (err) {
          throw err;
        }

        let reversedPosts = posts.reverse();
        res.render("posts/index", {
          session: req.session.user,
          posts: reversedPosts,
        });
      });
  },

  New: (req, res) => {
    res.render("posts/new", {});
  },

  Create: (req, res) => {
    const like = new Like();

    like.save((err) => {
      if (err) {
        throw err;
      }
    });
    
    const post = new Post({
      likes: like._id, 
      user_id: req.session.user._id
    });
        
    receiveImage(req, res, async (err) => {
      if (req.file) {
        // handling errors from multer
        if (err) {
          return res.status(401).json({ error: err.message });
        }
  
        try {
          // format the image with sharp (i.e. Format class)
          const file = new Format();
          const fileToUpload = await file.format(req.file.buffer);
  
          if(!fileToUpload) {
            return res.status(401).json({ error: 'Image could not be formatted'});
          }
          // upload to cloudinary
          const imageStream = fileToUpload.formattedFile;
          const imageName = fileToUpload.fileName;
  
          const uploadResult = await uploadImage(imageStream, imageName); 
          const uploadUrl = uploadResult.url;
          post.post_picture = uploadUrl
        } catch (error) {
          return res.json({error: 'Failed to upload'})
        }
      }
      post.message = req.body.message;
      
      post.save((err) => {
        if (err) {
          throw err;
        }
  
        res.status(201).redirect("/posts");
      });
    });
  },
};

module.exports = PostsController;
