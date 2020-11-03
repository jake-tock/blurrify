const bodyParser = require('body-parser');
const fixPath = require('fix-path');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const express = require('express');
const multer = require('multer');
const Blurrify = require('./Blurrify');
const assetsPath = '/tmp';
const blurrify = new Blurrify(assetsPath);

const PORT = process.env.PORT || 8463;

fixPath();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});

app.get('/', (req, res) => res.send('Hello world!'));

const upload = multer({ dest: assetsPath });

app.get('/result.jpg', (req, res) => res.sendFile(path.join(assetsPath, 'result.jpg')));
app.get('/result.png', (req, res) => res.sendFile(path.join(assetsPath, 'result.png')));
app.get('/result-blur.jpg', (req, res) => res.sendFile(path.join(assetsPath, 'result-blur.jpg')));
app.get('/result-blur.png', (req, res) => res.sendFile(path.join(assetsPath, 'result-blur.png')));
app.get('/result-crop.jpg', (req, res) => res.sendFile(path.join(assetsPath, 'result-crop.jpg')));
app.get('/result-crop.png', (req, res) => res.sendFile(path.join(assetsPath, 'result-crop.png')));

app.post('/upload', upload.single('file'), (req, res) => {
  blurrify.initialize(req.file);

  if (blurrify.isImage()) {
    fs.copyFileSync(req.file.path, blurrify.blurPath);
    fs.copyFileSync(req.file.path, blurrify.cropPath);
    fs.renameSync(req.file.path, blurrify.sourcePath);
    res.status(200).json(blurrify.response());
  } else {
    fs.unlinkSync(tempPath);
    res.status(403).contentType('text/plain').end('Only .png and .jpg files are allowed!');
  }
});

app.post('/blur', (req, res) => {
  const command = blurrify.blur(req);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      res.status(403).json({ error: error.message });
      return;
    }
    if (stderr) {
      res.status(403).json({ error: stderr });
      return;
    }
    res.status(200).json(blurrify.response());
  });
});
