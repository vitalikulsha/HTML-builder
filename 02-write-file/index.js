const path = require('path');
const fs = require('fs');
const { stdin, stdout } = process;
const writeStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));

stdout.write('Введите текст:\nДля завершения ввода введи exit или нажми ctrl + c\n');
stdin.on('data', data => {
  const text = data.toString().trim();
  if (text === 'exit') {
    process.exit();
  } else {
    writeStream.write(text + '\n');
  }
});

process.on('SIGINT', () => process.exit());
process.on('exit', () => console.log(`\nЗапись завершена, полный текст смотри в файле ${path.join(__dirname, 'text.txt')}`));