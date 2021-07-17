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

  console.log("Fetching remote...");
  await $(`cd MaterialDesign && git fetch`);
  const log = await $(
    `cd MaterialDesign && git log --oneline master..origin/master`
  );
  if (log.length > 0) {
    console.log(`There are ${log.split("\n").length} new commits.`);
    const before = (
      await $(`cd MaterialDesign && git rev-parse --short HEAD`)
    ).trim();
    await $(`cd MaterialDesign && git pull origin master`);
    const after = (
      await $(`cd MaterialDesign && git rev-parse --short HEAD`)
    ).trim();
    await $(
      `git add MaterialDesign && git commit -m "auto-merged ${before}..${after}"`
    );
    console.log(
      `${colors.fgGreen}Successfully merged new commits${colors.reset} (${before}..${after})`
    );
  } else {
    console.log(`${colors.fgGreen}Already up to date${colors.reset}`);
  }
})();
