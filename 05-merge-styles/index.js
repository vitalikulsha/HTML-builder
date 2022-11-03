const path = require('path');
const fs = require('fs');
const styleDir = path.join(__dirname, 'styles');
const writeStream = fs.createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));

fs.readdir(styleDir, { withFileTypes: true }, (err, files) => {
  if (err) throw err;
  files = files.filter(file => file.isFile())
    .map(file => path.join(styleDir, file.name))
    .filter(file => path.extname(file) === '.css');
  for (let file of files) {
    const readStream = fs.createReadStream(file, 'utf-8');
    let data = '';
    readStream.on('data', chunk => data += chunk);
    readStream.on('end', () => {
      writeStream.write(data + '\n\n');
    });
    readStream.on('error', error => console.log('File read error'));
  }
});