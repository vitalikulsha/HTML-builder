const path = require('path');
const fs = require('fs');

fs.mkdir(
  path.join(__dirname, 'files-copy'),
  { recursive: true },
  (err) => {
    if (err) throw err;
  }
);

fs.readdir(
  path.join(__dirname, 'files'),
  (err, files) => {
    if (err) throw err;
    for (let file of files) {
      fs.copyFile(
        path.join(__dirname, 'files', file),
        path.join(__dirname, 'files-copy', file),
        err => {
          if (err) throw err;
        })
    };
  });



