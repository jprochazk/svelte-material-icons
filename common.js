const fs = require("fs");
const path = require("path");
const readline = require("readline");
let rli;

/** @param {string} message */
const prompt = (message) => {
  if (!rli) throw new Error("Prompt is not open");
  return new Promise((resolve, reject) => {
    rli.question(message, (value) => resolve(value));
    rli.on("SIGINT", () => process.exit(0));
  });
};
prompt.open = () => {
  rli = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
};
prompt.close = () => rli.close();

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
 * @param {boolean | undefined} capture Should stdout be captured
 * @returns {Promise<string>}
 */
const $ = (command, capture = false) =>
  new Promise((resolve, reject) => {
    const child = require("child_process").exec(command, (error, stdout) =>
      error ? reject(error) : resolve(stdout)
    );
    if (!capture) {
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    }
  });

class File {
  /** @type {string} */ path;
  /** @type {string} */ content;
  /**
   * @param {string} path
   * @param {string} content
   */
  constructor(path, content) {
    this.path = path;
    this.content = content;
  }

  dir() {
    return path.dirname(this.path);
  }

  /**
   * Get the filename without directories
   * @param {boolean} ext Include extension
   * @returns
   */
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
   * Trigger a callback for each file in a directory. Recursive.
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

  /**
   * Asynchronously count the number of files in a directory. Not recursive.
   * @param {string} path
   * @returns {Promise<number>}
   */
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

/**
 * @param {string} message
 */
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

/**
 * @param {string} from
 * @param {string} to
 */
async function copy(from, to) {
  await fs.promises.writeFile(
    to,
    await fs.promises.readFile(from, "utf-8"),
    "utf-8"
  );
}

module.exports = {
  $,
  colors,
  File,
  fail,
  copy,
  prompt,
};
