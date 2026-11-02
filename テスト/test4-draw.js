// ============================================================
// テスト4：引き分け（200手）
//
// このゲームは、いつまでも終わらない対局がある（バランス実測で約3〜5%）。
// なので200手で引き分けにしている。
// ⭐200手目がちょうど決着の手なら、引き分けではなく勝ちが先。
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
finished = (async () => {
  section("200手で引き分け");
  go("human"); ply = 199;
  onSlot(0, 0); onSlot(1, 0); await settle();
  ok(ply === 200, "200手目");
  ok(result && result.draw === true, "引き分けになった");
  ok(result.text === "二進数バトル：ふたり対戦、200手で引き分けになりました", "コピーする文：" + result.text);
  ok(el("board").innerHTML.includes("200手たっても 決着しませんでした"), "画面にも出る");

  section("200手目が ちょうど決着なら、勝ちが先");
  reset(); h = [[3, 1], [28, 31]]; ply = 199;
  onSlot(0, 0); onSlot(1, 0); await settle();
  ok(result && result.win === 0 && !result.draw, "Aの勝ち（引き分けにしない）");

  section("199手目では、まだ引き分けにしない");
  reset(); ply = 198;
  onSlot(0, 0); onSlot(1, 0); await settle();
  ok(ply === 199 && result === null, "続く");
})();
`);

finish(sandbox);
