// ============================================================
// テスト3：手数カウント
//
// いちばん大事なのは「弾かれた攻撃は数えない」こと。
// +1 を門番の“後ろ”に置いたので、成立した攻撃だけが1手になる。
// 置く場所がそのまま「何を1手と数えるか」という仕様になっている。
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
  const shown = () => el("board").innerHTML.includes("手数：" + turnCount);

  section("開幕");
  ok(turnCount === 0, "手数0");
  ok(shown(), "盤面の表示と一致");

  section("成立する攻撃を2回");
  doAttack("right", "right");
  ok(turnCount === 1, "手数1");
  doAttack("left", "left");
  ok(turnCount === 2, "手数2");
  ok(shown(), "盤面の表示と一致");

  section("死んだ手で攻撃（門番2に弾かれる）");
  attacker.right = 31;
  showBoard(person1, person2);
  doAttack("right", "right");
  ok(turnCount === 2, "手数は増えない（" + turnCount + "）");
  ok(el("message").textContent === "その手は死んでいるので攻撃できません",
     "メッセージ: " + el("message").textContent);

  section("死んだ手を狙う（門番3に弾かれる）");
  defender.left = 31;
  showBoard(person1, person2);
  doAttack("left", "left");
  ok(turnCount === 2, "手数は増えない（" + turnCount + "）");
  ok(el("message").textContent === "相手のその手は死んでいます",
     "メッセージ: " + el("message").textContent);

  section("決着（成立するので +1）");
  person1 = {name:"A", right:1, left:1};
  person2 = {name:"B", right:30, left:31};
  attacker = person1; defender = person2; gameOver = false; turnCount = 0;
  showBoard(person1, person2);
  doAttack("right", "right");
  ok(turnCount === 1, "決着の一手も数える（" + turnCount + "）");

  section("決着後に押す（門番1に弾かれる）");
  doAttack("left", "left");
  ok(turnCount === 1, "手数は増えない（" + turnCount + "）");

  section("リセット");
  reset();
  ok(turnCount === 0, "手数0に戻った");
  ok(shown(), "盤面の表示と一致");
`);

finish(sandbox);
