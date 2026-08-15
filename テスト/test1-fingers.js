// ============================================================
// テスト1：指の表示（回帰テスト）
//
// 0〜31 の全パターンで、指の名前と指の絵がどう出るかを書き出し、
// 保存してある基準（baseline-fingers.txt）と比べる。
//
// これは「変えていないはずのものが、本当に変わっていないか」を確かめるためのテスト。
// リファクタリングやモード追加のときに、いちばん頼りになる。
//
// 基準ファイルが無ければ、今の出力を基準として作る。
// わざと表示を変えたときは baseline-fingers.txt を削除してから走らせ直す。
// ============================================================

const fs = require("fs");
const path = require("path");
const { runGame } = require("./common");

const BASE = path.join(__dirname, "baseline-fingers.txt");

const sandbox = runGame(`
  const lines = [];
  for (let n = 0; n <= MODE().max; n++) {
    lines.push(n + " | " + handToFingers(n) + " | " + handHTML(n));
  }
  result = lines.join("\\n");
`);

const now = sandbox.result;

console.log("■ テスト1：指の表示（二進数モード・0〜31の全32パターン）");

if (!fs.existsSync(BASE)) {
  fs.writeFileSync(BASE, now, "utf8");
  console.log("   基準ファイルが無かったので、今の出力を基準として保存しました");
  console.log("   → " + BASE);
  console.log("");
  console.log("  → 次回からは、この基準と比べます");
} else {
  const before = fs.readFileSync(BASE, "utf8").split(/\r?\n/);
  const after = now.split(/\r?\n/);

  const diffs = [];
  const len = Math.max(before.length, after.length);
  for (let i = 0; i < len; i++) {
    if (before[i] !== after[i]) diffs.push(i);
  }

  console.log("   基準ファイルと比較しました");
  console.log("   差分: " + diffs.length + " 件");
  console.log("");

  if (diffs.length === 0) {
    console.log("  → 全部OK（表示は1文字も変わっていません）");
  } else {
    for (const i of diffs.slice(0, 5)) {
      console.log("   ★" + (i + 1) + "行目");
      console.log("     前: " + (before[i] || "(無し)").slice(0, 100));
      console.log("     後: " + (after[i] || "(無し)").slice(0, 100));
    }
    if (diffs.length > 5) console.log("   ... 他 " + (diffs.length - 5) + " 件");
    console.log("");
    console.log("  → ★表示が変わっています。意図した変更なら baseline-fingers.txt を削除して作り直してください");
    process.exitCode = 1;
  }
}
