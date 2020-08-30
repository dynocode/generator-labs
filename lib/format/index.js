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

async function makePrettier(formatPath) {
  const file = (await readFile(formatPath)).toString('utf8');
  const formatted = prettier.format(file, {
    semi: true,
    singleQuote: true,
    parser: 'babel',
  });
  return writeFile(formatPath, formatted);
}

module.exports = {
  makePrettier,
  lintFix,
}