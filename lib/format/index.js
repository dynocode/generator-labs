const { ESLint } = require('eslint');
const prettier = require('prettier');

const { readFile, writeFile } = require('../fs');

async function lintFix(formatPath) {
  const eslint = new ESLint({ fix: true });
  const results = await eslint.lintFiles([formatPath]);

  // Modify the files with the fixed code.
  await ESLint.outputFixes(results);

  // Format the results.
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);

  return resultText;
}

async function lintFixCode(code) {
  const eslint = new ESLint({ fix: true });
  const res = await eslint.lintText(code);
  if (!res || !res[0] || !res[0].output) {
    return false;
  }
  return res[0].output;
}

async function makePrettier(formatPath) {
  const file = (await readFile(formatPath)).toString('utf8');
  const formatted = prettier.format(file, {
    semi: true,
    singleQuote: true,
    parser: 'babel',
  });
  return writeFile(formatPath, formatted);
}

async function makePrettierCode(code) {
  return prettier.format(code, {
    semi: true,
    singleQuote: true,
    parser: 'babel',
  });
}

async function formatCode(code) {
  const stylePrettier = await makePrettierCode(code);
  if (!stylePrettier) {
    return code;
  }
  const styleLint = await lintFixCode(stylePrettier);
  if (!styleLint) {
    return stylePrettier;
  }
  return styleLint;
}

async function formatVMemFile(that, filePath) {
  const file = that.fs.store.get(filePath);
  const orgCode = file.contents.toString('utf8');
  const code = await formatCode(orgCode);
  file.contents = Buffer.from(code);

  that.fs.store.add(file);
}

module.exports = {
  makePrettier,
  makePrettierCode,
  lintFix,
  lintFixCode,
  formatCode,
  formatVMemFile,
};
