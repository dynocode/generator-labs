function copyTpl(that, from, to, templateData) {
  const templatePath = that.templatePath(from);
  const destinationPath = that.destinationPath(to);
  const args = [
    templatePath,
    destinationPath,
  ];

  if (templateData) {
    args.push(templateData);
  }

  return that.fs.copyTpl(...args);
}

module.exports = copyTpl;
