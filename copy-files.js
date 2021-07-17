const fs = require("fs");
const path = require("path");
const { copy } = require("./common");

(async function () {
  const root = (p) => path.join(__dirname, p);
  const build = (p) => path.join(__dirname, "build", p);
  const md = (p) => path.join(__dirname, "MaterialDesign", p);

  await copy(root("package.json"), build("package.json"));
  await copy(md("LICENSE"), build("LICENSE"));
  await copy(root("README.md"), build("README.md"));
})();
