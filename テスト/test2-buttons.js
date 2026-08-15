// ============================================================
// テスト2：ボタンの有効／無効（disabled）
//
// 押しても意味がないボタンが、ちゃんとグレーになって押せなくなるか。
//   ・自分のその手が死んでいる
//   ・相手のその手が死んでいる
//   ・ゲームが終わっている
// この3つは doAttack の門番3つとまったく同じ条件。
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
  section("開幕");
  ok(buttonStates() === "有効 有効 有効 有効", "4つとも押せる（" + buttonStates() + "）");

  section("1手打ったあと");
  doAttack("right", "right");
  ok(person2.right === 2, "B右手が 1 + 1 = 2 になった");
  ok(buttonStates() === "有効 有効 有効 有効", "まだ4つとも押せる（" + buttonStates() + "）");

  section("Bの右手だけが死亡（31）※Aの番");
  person2.right = 31;
  attacker = person1; defender = person2;
  showBoard(person1, person2);
  ok(buttonStates() === "無効 有効 無効 有効",
     "「相手の右手」を狙う2つだけ無効（" + buttonStates() + "）");

  section("決着したあと");
  person1 = {name:"A", right:1, left:1};
  person2 = {name:"B", right:30, left:31};
  attacker = person1; defender = person2; gameOver = false;
  showBoard(person1, person2);
  doAttack("right", "right");           // 30 + 1 = 31 → B右も死亡
  ok(gameOver === true, "決着した");
  ok(el("message").textContent.includes("Bの負け"), "勝敗メッセージ: " + el("message").textContent);
  ok(buttonStates() === "無効 無効 無効 無効", "4つとも無効（" + buttonStates() + "）");

  section("リセットしたあと");
  reset();
  ok(buttonStates() === "有効 有効 有効 有効", "4つとも復活（" + buttonStates() + "）");
  ok(turnCount === 0 && gameOver === false, "手数と決着フラグも戻った");
`);

finish(sandbox);
