const fs = require("fs");
const path = require("path");
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  fgBlack: "\x1b[30m",
  fgRed: "\x1b[31m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
  fgBlue: "\x1b[34m",
  fgMagenta: "\x1b[35m",
  fgCyan: "\x1b[36m",
  fgWhite: "\x1b[37m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

/**
 * Asynchronously execute a command
 * @param {string} input
 * @returns {Promise<{code: number|null, result: string}>}
 */
const $ = (command) =>
  new Promise((resolve, reject) => {
    const child = require("child_process").exec(command, (error) =>
      error ? reject(error) : resolve()
    );
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
class File {
  /** @type {string} */ path;
  /** @type {string} */ content;
  constructor(path, content) {
    this.path = path;
    this.content = content;
  }

  dir() {
    return path.dirname(this.path);
  }

  name(ext = false) {
    return path.basename(this.path, ext ? undefined : path.extname(this.path));
  }

  /**
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  static exists(filePath) {
    return new Promise((resolve) => {
      fs.stat(filePath, (error) => resolve(!error));
    });
  }

  /**
   * @param {string} filePath
   * @param {(file: File) => void} callback
   */
  static each(
    filePath,
    callback,
    recursive = true,
    stat = fs.statSync(filePath)
  ) {
    if (stat.isDirectory()) {
      fs.promises.readdir(filePath).then((files) => {
        for (let i = 0; i < files.length; ++i) {
          files[i] = path.join(filePath, files[i]);
          fs.promises.stat(files[i]).then((stat) => {
            File.each(files[i], callback, recursive, stat);
          });
        }
      });
    } else {
      fs.promises.readFile(filePath, "utf-8").then((content) => {
        callback(new File(filePath, content));
      });
    }
  }

  static async count(path) {
    if ((await fs.promises.stat(path)).isDirectory()) {
      return (await fs.promises.readdir(path)).length;
    } else {
      return 0;
    }
  }

  async write() {
    await fs.promises.writeFile(this.path, this.content, "utf-8");
  }

  /**
   * @param {string} path
   */
  static async createDir(path, recursive = true) {
    if (await File.exists(path)) return;
    await fs.promises.mkdir(path, { recursive });
  }
}
const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const root = __dirname;

/** @param {string} input */
const convertCase = (input) =>
  input
    .split("-")
    .map(
      (frag) =>
        frag.substring(0, 1).toUpperCase() + frag.substring(1).toLowerCase()
    )
    .join("");

/** @param {File} file */
const transformPath = (file) =>
  path.join(root, "build", convertCase(file.name()) + ".svelte");

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
  await File.createDir(out);

  const total = await File.count(src);
  let count = total;
  let handle = setInterval(() => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    if (!options.verbose)
      process.stdout.write(`${total - count}/${total} ${spinner.next().value}`);
    if (count === 0) {
      process.stdout.write(
        `\n${colors.fgGreen}Build successful${colors.reset}\n`
      );
      clearInterval(handle);
    }
  }, 50);

  File.each(src, (file) => {
    file.path = transformPath(file);
    file.content = transformContent(file);
    file
      .write()
      .then(() => {
        count -= 1;
        if (options.verbose)
          console.log(
            `Built ${colors.fgGreen}${file.name(true)}${colors.reset}`
          );
      })
      .catch((error) =>
        fail(`Failed to write ${file.name(true)}:\n${error.toString()}`)
      );
  });
}

const options = {
  verbose: process.argv.some((arg) => ["-v", "--verbose"].includes(arg)),
};
main(options);
