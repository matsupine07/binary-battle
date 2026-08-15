// ============================================================
// テストを全部まとめて実行する
//
//   node テスト/run-all.js
//
// コードをいじったあとは、まずこれを走らせる。
// 1つでもNGがあれば最後に「★失敗」と出る。
// ============================================================

const { execFileSync } = require("child_process");
const path = require("path");

const TESTS = [
  ["test1-fingers.js", "指の表示（回帰テスト）"],
  ["test2-buttons.js", "ボタンの有効／無効"],
  ["test3-turns.js",   "手数カウント"],
  ["test4-draw.js",    "引き分け"],
  ["test5-modes.js",   "モード切り替え"],
  ["test6-cpu.js",     "CPU対戦"],
];

let failed = 0;

for (const [file, name] of TESTS) {
  console.log("");
  console.log("============================================================");
  console.log(" " + file + "  … " + name);
  console.log("============================================================");
  try {
    const out = execFileSync(process.execPath, [path.join(__dirname, file)], {
      encoding: "utf8",
    });
    process.stdout.write(out);
  } catch (e) {
    if (e.stdout) process.stdout.write(e.stdout);
    if (e.stderr) process.stderr.write(e.stderr);
    failed++;
  }
}

console.log("");
console.log("============================================================");
if (failed === 0) {
  console.log(" ✅ 全テスト合格（" + TESTS.length + "本）");
} else {
  console.log(" ★ 失敗 " + failed + " 本 / 全 " + TESTS.length + " 本");
  process.exitCode = 1;
}
console.log("============================================================");
