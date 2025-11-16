const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.post('/api/generate_all', (req, res) => {
  const { topic, style, animation_instructions, clips } = req.body;

  // Mock data representing the AI-generated content
  const mockResponse = {
    lyrics: `Letra sobre ${topic} en estilo ${style}.`,
    song: 'mock_song.mp3',
    images: ['img1.png', 'img2.png'],
    animated_images: ['anim1.gif', 'anim2.gif'],
    thumbnail: 'thumbnail.png'
  };

  res.json(mockResponse);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
