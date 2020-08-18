const path = require('path');
const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function getFilePathToAllFilesInDir(dirPath, excludeIndex = true, onlyFile = 'js') {
  try {
    const getAllFiles = await readdir(dirPath);
    return getAllFiles
      .filter((item) => {
        if (excludeIndex && item === 'index.js') {
          return false;
        }
        const fileType = item.substring((item.length - 1) - (onlyFile.length - 1));
        if (onlyFile && fileType !== onlyFile) {
          return false;
        }
        return true;
      })
      .map((item) => path.join(dirPath, item));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

module.exports = {
  getFilePathToAllFilesInDir,
  readdir,
  readFile,
  writeFile,
};
