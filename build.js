const path = require("path");
const { File, fail, $, colors } = require("./common");
const root = __dirname;

/** @param {string} input */
const convertCase = (input) =>
  input
    .split("-")
    .map((frag) => frag.substring(0, 1).toUpperCase() + frag.substring(1).toLowerCase())
    .join("");

/** @param {File} file */
const transformPath = (file) => path.join(root, "build", convertCase(file.name()) + ".svelte");

/** @param {File} file */
const transformContent = (file) =>
  file.content
    .substring(file.content.indexOf("<svg"))
    .replace(/<svg (.*)><path/, "<svg $1 {...$$$$props} ><path")
    .replace(/id="[a-zA-Z\-]*"\s/, "");

const spinner = (function* spinner() {
  while (true) {
    yield "|";
    yield "/";
    yield "-";
    yield "\\";
  }
})();

/**
 * @param {{ verbose:boolean }} options
 */
async function main(options) {
  console.log("Starting build");

  const src = path.join(root, "MaterialDesign/svg");
  const out = path.join(root, "build");

  if (!(await File.exists(src))) {
    console.log("Source not found, initializing submodules");
    await $("git submodule update --init --recursive");
  }
  if (!(await File.exists(out))) {
    await File.createDir(out);
  }

  let indexSrc = "";

  const total = await File.count(src);
  let count = total;
  let interval = setInterval(async () => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    if (!options.verbose) process.stdout.write(`${total - count}/${total} ${spinner.next().value}`);
    if (count === 0) {
      process.stdout.write("\n");
      process.stdout.write(`Writing ${colors.fgBlue}index.js${colors.reset}...`);
      await new File("build/index.js", indexSrc).write();
      process.stdout.write(`${colors.fgGreen}Build successful${colors.reset}\n`);
      clearInterval(interval);
    }
  }, 50);

  File.each(src, (file) => {
    file.path = transformPath(file);
    file.content = transformContent(file);
    file
      .write()
      .then(() => {
        count -= 1;
        if (options.verbose) console.log(`Built ${colors.fgGreen}${file.name(true)}${colors.reset}`);
      })
      .catch((error) => fail(`Failed to write ${file.name(true)}:\n${error.toString()}`));

    const baseName = path.basename(file.path, path.extname(file.path));
    indexSrc += `export { default as ${baseName} } from "./${baseName}.svelte";\n`;
  });
}

const options = {
  verbose: process.argv.some((arg) => ["-v", "--verbose"].includes(arg)),
};
main(options);
