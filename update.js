const { $, colors } = require("./common");

(async () => {
  const help = process.argv.some((arg) => ["-h", "--help"].includes(arg));
  if (help) {
    console.log(`
node update.js [-h | --help]

Script for automatically updating & merging 'MaterialDesign' submodule.

It:
1. Fetches latest commits
2. Checks for any new changes
3. Merges + commits them
`);
    process.exit(0);
  }

  const status = await $("git status", true);
  if (!status.includes("nothing to commit")) {
    console.log("Please commit or discard your changes first");
    process.exit(0);
  }

  console.log("Fetching remote...");
  $.cd("./MaterialDesign");
  console.log($.cwd());
  await $(`git fetch`, true);
  const log = await $(`git log --oneline master..origin/master`, true);
  if (log.length > 0) {
    console.log(`There are ${log.split("\n").length} new commits.`);
    const before = (await $(`git rev-parse --short HEAD`, true)).trim();
    await $(`git pull origin master`, true);
    const after = (await $(`git rev-parse --short HEAD`, true)).trim();
    $.cd("..");
    await $(`git add MaterialDesign`, true);
    await $(`git commit -m "auto-merged ${before}..${after}"`, true);
    console.log(
      `${colors.fgGreen}Successfully merged new commits${colors.reset} (${before}..${after})`
    );
  } else {
    $.cd("..");
    console.log(`${colors.fgGreen}Already up to date${colors.reset}`);
  }
})();
