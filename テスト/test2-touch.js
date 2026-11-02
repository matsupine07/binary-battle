// ============================================================
// テスト2：手を押す
//
// たたき方は「自分の手を押す → 相手の手を押す」。
//   ・自分の手を押すと選ぶ。もう一度押すとやめる
//   ・押す前に、相手の手の上に結果（→ 13／ぴったり31！／あふれて 2）が出る
//   ・たおれた手は選べない。たおれた相手の手はたたけない
//   ・選ぶ前に相手の手を押しても、何も起きない
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
  go("human");

  section("はじめ");
  ok(turn === 0 && sel === -1, "Aの番・何も選んでいない");

  section("自分の手を押すと選ぶ。もう一度押すと、やめる");
  onSlot(0, 1);
  ok(sel === 1, "右の手を選んだ");
  ok(el("board").innerHTML.includes('class="slot mine sel"'), "選んだ手に印");
  ok((el("board").innerHTML.match(/slot can/g) || []).length === 2, "相手の手2つが「たたける」になる");
  onSlot(0, 1);
  ok(sel === -1, "もう一度押すと、やめる");

  section("押す前に、結果が出る");
  h = [[13, 1], [18, 20]]; sel = 0; render();
  ok(el("board").innerHTML.includes("ぴったり31！"), "13 で 18 をたたく → ぴったり31！");
  ok(el("board").innerHTML.includes("あふれて 2"), "13 で 20 をたたく → あふれて 2");
  h = [[3, 1], [10, 1]]; sel = 0; render();
  ok(el("board").innerHTML.includes("→ 13"), "3 で 10 をたたく → 13");

  section("たおれた手は選べない");
  h = [[31, 5], [1, 1]]; sel = -1; render();
  onSlot(0, 0);
  ok(sel === -1, "たおれた手を押しても、選ばれない");
  ok(msg === "たおれた手は 使えません", "理由を出す：" + msg);

  section("選ぶ前に相手の手を押しても、何も起きない");
  reset();
  onSlot(1, 0);
  ok(ply === 0 && sel === -1, "たたかない");

  section("たおれた相手の手は、たたけない");
  h = [[1, 1], [31, 2]];
  onSlot(0, 0); onSlot(1, 0);
  ok(ply === 0 && h[1][0] === 31, "たおれた手を押しても、たたかない");

  section("ふたりで：Bの番は、Bの手を選ぶ");
  reset(); turn = 1;
  onSlot(0, 0);
  ok(sel === -1, "Bの番に Aの手を押しても、選ばれない");
  onSlot(1, 0);
  ok(sel === 0, "Bの手なら選べる");
`);

finish(sandbox);
