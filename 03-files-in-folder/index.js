const path = require('path');
const fs = require('fs');
const folderPath = path.join(__dirname, 'secret-folder');

fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
  if (err) throw err;
  files = files.filter(file => file.isFile()).map(file => path.join(folderPath, file.name));
  for (let file of files) {
    const fileExt = path.extname(file);
    const fileName = path.basename(file).slice(0, -fileExt.length);
    fs.lstat(file, (err, stats) => {
      if (err) throw err;
      console.log(`${fileName} - ${fileExt.slice(1)} - ${(stats.size / 1024).toFixed(3)}kb`);
    });
  }
});