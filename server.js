const fixPath = require('fix-path');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const express = require('express');
const multer = require('multer');
const blurrify = require('./blurrify');
const assetsPath = '/tmp';

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 8463;

fixPath();

httpServer.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});

app.get('/', (req, res) => res.send('Hello world!'));

const handleError = (err, res) => {
  res
    .status(500)
    .contentType('text/plain')
    .end('Oops! Something went wrong!' + err);
};

const upload = multer({ dest: assetsPath });

app.get('/result.jpg', (req, res) => {
  res.sendFile(path.join(assetsPath, 'result.jpg'));
});
app.get('/result.png', (req, res) => {
  res.sendFile(path.join(assetsPath, 'result.png'));
});
app.get('/result-blur.jpg', (req, res) => {
  res.sendFile(path.join(assetsPath, 'result-blur.jpg'));
});
app.get('/result-blur.png', (req, res) => {
  res.sendFile(path.join(assetsPath, 'result-blur.png'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  const result = blurrify.processedRequest(req, assetsPath);

  if (result.extName === '.png' || result.extName === '.jpg') {
    fs.renameSync(req.file.path, result.targetPath);
    exec(result.command, (error, stdout, stderr) => {
      if (error) {
        res.status(403).json({ error: error.message });
        return;
      }
      if (stderr) {
        res.status(403).json({ error: stderr });
        return;
      }
      res.status(200).json(result);
    });
  } else {
    fs.unlink(tempPath, (err) => {
      if (err) return handleError(err, res);

      res.status(403).contentType('text/plain').end('Only .png and .jpg files are allowed!');
    });
  }
});
