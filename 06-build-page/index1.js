const fs = require('fs');
const path = require('path');
const componentsPath = path.join(__dirname, 'components');
const htmlTemplate = path.join(__dirname, 'template.html');
const styles = path.join(__dirname, 'styles');
const assets = path.join(__dirname, 'assets');
const buildPath = path.join(__dirname, 'project-dist');

function buildProject(dest) {
  fs.mkdir(dest, (err) => {
    if (err) return console.error(err);

    //prepare and load html file
    createHtmlFile(htmlTemplate, dest);

    // prepare and load styles
    createStylesFile(styles, dest);

    // copy assets
    copyDir(assets, path.join(dest, 'assets'));
  });
}

// html
function createHtmlFile(filePath, dest) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return console.error(err);

    //load components
    fs.readdir(componentsPath, (err, componentsNames) => {
      if (err) return console.error(err);

      // inject components into a html-file & load it in build directory
      parsedHtmlFile(data, dest, componentsNames);
    });
  });
}

function parsedHtmlFile(html, dest, files) {
  //get all components code
  const components = {};

  files
    .map((component) => {
      return {
        name: `{{${path.parse(component).name}}}`,
        promise: fs.promises.readFile(
          path.join(componentsPath, component),
          'utf8'
        ),
      };
    })
    .reduce(
      (prev, cur, i) =>
        prev.then(() =>
          cur.promise.then((data) => (components[cur.name] = data))
        ),
      Promise.resolve()
    )
    .then(() => {
      //now all components ig ready
      // inject components in html
      for (const component in components) {
        html = html.replace(component, components[component]);
      }
      // write parsed html code
      fs.writeFile(path.join(dest, 'index.html'), html, (err, ok) => {
        if (err) console.error(err);
      });
    });
}

// css
function createStylesFile(src, dest) {
  //get all style-file names
  fs.readdir(src, (err, fileNames) => {
    if (err) return console.error(err);

    // bug footer styles
    // temp - load css according html(header, then article, then footer styles)
    // only for this project
    // TODO: create correct css rules or universal load order
    fileNames.sort((a, b) => {
      const nameA = a.split('.')[0],
        nameB = b.split('.')[0];

      if (nameA == 'header' || nameB == 'footer') return -1;
      if (nameA != 'header' || nameB != 'footer') return 1;
      return 0;
    });

    let cssCode = '';
    //read all css files and put data in cssCode
    fileNames
      .map((fileName) => fs.promises.readFile(path.join(src, fileName)))
      .reduce((prev, cur) => {
        return prev.then(() => {
          return cur.then((data) => {
            cssCode += data;
          });
        });
      }, Promise.resolve())
      .then(() => {
        // now all styles is prepared to write
        fs.writeFile(path.join(dest, 'style.css'), cssCode, (err) => {
          if (err) console.error(err);
        });
      });
  });
}

// assets
// copy directory
function copyDir(src, dest) {
  // create dest dir for copy
  fs.mkdir(dest, (err) => {
    if (err) throw err;

    // get all names for all files and dirs from src
    fs.readdir(src, { withFileTypes: true }, (err, files) => {
      if (err) throw err;

      // check type all files
      files.forEach((file) => {
        const from = path.join(src, file.name);
        const to = path.join(dest, file.name);

        if (file.isFile()) {
          // create file copy
          copyFile(from, to);
        } else if (file.isDirectory()) {
          // It's directory => recursive call this func with new src & dest
          copyDir(from, to);
        }
      });
    });
  });
}

function copyFile(from, to) {
  fs.readFile(from, (err, data) => {
    if (err) throw err;
    // write to copy-file in dest
    fs.writeFile(to, data, (err) => {
      if (err) throw err;
    });
  });
}

// remove old version if it exists
fs.rm(buildPath, { recursive: true }, () => {
  // create directory for build & load project inside
  buildProject(buildPath);
});