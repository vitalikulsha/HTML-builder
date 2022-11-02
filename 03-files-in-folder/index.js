const path = require('path');
const fs = require('fs');
const folderPath = path.join(__dirname, 'secret-folder');

const fileList = fs.readdirSync(folderPath, err => {
  if (err) throw err;
}).map(file => path.join(folderPath, file))
  .filter(file => fs.lstatSync(file).isFile());

for (let file of fileList) {
  const fileExt = path.extname(file);
  const fileName = path.basename(file).slice(0, -fileExt.length);
  const fileSize = (fs.lstatSync(file).size / 1024).toFixed(2);
  console.log(`${fileName} - ${fileExt.slice(1)} - ${fileSize}kb`);
}
