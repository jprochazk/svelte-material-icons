const { $, File } = require("./common");

(async function () {
  if (!(await File.exists("./build"))) {
    await File.createDir("./build");
  }
  await Promise.all([
    $.cp("./package.json", "./build/package.json"),
    $.cp("./MaterialDesign/LICENSE", "./build/LICENSE"),
    $.cp("./README.md", "./build/README.md"),
  ]);
})();
