const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors')
const axios = require('axios')

const app = express();
app.use(bodyParser.json());
app.use(cors())

const commentsByPostId = [];

app.get('/posts/comments', (req, res) => {
  res.send(commentsByPostId);
})
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId.filter(post => post.idPost === req.params.id));
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  commentsByPostId.push({commentId, idPost:req.params.id, comments: content, status: 'pending'})

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'COMMENT_CREATED',
    data: {commentId, idPost:req.params.id, comments: content, status: 'pending'}
    })

  res.status(201).send(commentsByPostId.filter(post => post.id === req.params.id));
});

app.post('/events', async (req, res) => {
  console.log('Received event from comment:', req.body);

  const {type, data} = req.body


  if( type === 'COMMENT_CREATED') {

    await axios.post('http://event-bus-srv:4005/events', {
      type: 'COMMENT_UPDATED',
      data
      })
  }

  res.send('Event received');
});

app.listen(4001, () => {
  console.log('Listening on 4001');
});
