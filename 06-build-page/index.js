const path = require('path');
const fs = require('fs');

const projectPath = path.join(__dirname, 'project-dist');
const componentsPath = path.join(__dirname, 'components');
const templateHtmlPath = path.join(__dirname, 'template.html');
const targetHtmlPath = path.join(projectPath, 'index.html');
const targetCssPath = path.join(projectPath, 'style.css');
const stylesPath = path.join(__dirname, 'styles');
const targetAssetsPath = path.join(projectPath, 'assets');
const sourceAssetsPath = path.join(__dirname, 'assets');

fs.mkdir(
  projectPath,
  { recursive: true },
  (err) => {
    if (err) throw err;
  }
);

fs.readFile(templateHtmlPath, 'utf-8', (err, template) => {
  if (err) throw err;
  fs.readdir(componentsPath, (err, files) => {
    if (err) throw err;
    const components = {};
    files.map(file => {
      return {
        name: `{{${path.parse(file).name}}}`,
        promise: fs.promises.readFile(path.join(componentsPath, file), 'utf8'),
      };
    }).reduce((previous, current) => previous.then(() =>
      current.promise.then((data) => (components[current.name] = data))),
      Promise.resolve()
    ).then(() => {
      for (let component in components) {
        template = template.replace(component, components[component]);
      }
      fs.writeFile(targetHtmlPath, template, err => {
        if (err) throw err;
      });
    });
  })
})

fs.readdir(stylesPath, { withFileTypes: true }, (err, files) => {
  if (err) throw err;
  files = files.filter(file => file.isFile())
    .map(file => path.join(stylesPath, file.name))
    .filter(file => path.extname(file) === '.css');
  const writeStream = fs.createWriteStream(targetCssPath);
  for (let file of files) {
    const readStream = fs.createReadStream(file, 'utf-8');
    let data = '';
    readStream.on('data', chunk => data += chunk);
    readStream.on('end', () => {
      writeStream.write(data + '\n\n');
    });
    readStream.on('error', error => console.log(`File ${file} read error`));
  }
});

fs.mkdir(
  targetAssetsPath,
  { recursive: true },
  (err) => {
    if (err) throw err;
  }
);

function copyDir(source, target) {
  fs.readdir(
    source,
    { withFileTypes: true },
    (err, data) => {
      if (err) throw err;
      for (let item of data) {
        if (item.isFile()) {
          fs.copyFile(
            path.join(source, item.name),
            path.join(target, item.name),
            err => {
              if (err) throw err;
            });
        } else {
          fs.mkdir(
            path.join(target, item.name),
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          copyDir(path.join(source, item.name), path.join(target, item.name));
        }
      };
    });
}
copyDir(sourceAssetsPath, targetAssetsPath);