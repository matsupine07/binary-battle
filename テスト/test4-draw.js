// ============================================================
// テスト4：引き分け（MAX_TURNS）
//
// バランス実測で、約3〜5%の対局が本物の無限ループに入ると分かったための処理。
// 引き分けチェックは勝敗判定の“後ろ”に置いてあるので、
// ちょうど200手目で決着がついた場合は引き分けにならず勝敗が出る。
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
  section("引き分け直前まで進める");
  turnCount = MAX_TURNS - 2;
  showBoard(person1, person2);
  ok(turnCount === 198, "198手の時点（MAX_TURNS = " + MAX_TURNS + "）");

  doAttack("right", "right");
  ok(turnCount === 199 && gameOver === false, "199手目。まだ続く");

  section("200手目 → 引き分け");
  doAttack("right", "right");
  ok(turnCount === 200, "200手");
  ok(gameOver === true, "ゲーム終了になった");
  ok(el("message").textContent.includes("引き分け"), "メッセージ: " + el("message").textContent);
  ok(buttonStates() === "無効 無効 無効 無効", "ボタン全無効（" + buttonStates() + "）");

  section("引き分け後にボタンを押す");
  doAttack("left", "left");
  ok(el("message").textContent.includes("ゲームは終了しています"),
     "門番1が反応: " + el("message").textContent);

  section("リセット");
  reset();
  ok(turnCount === 0 && gameOver === false, "状態が戻った");
  ok(buttonStates() === "有効 有効 有効 有効", "ボタン復活（" + buttonStates() + "）");

  section("★200手目がちょうど決着だった場合（勝敗が優先されるか）");
  person1 = {name:"A", right:1, left:1};
  person2 = {name:"B", right:30, left:31};
  attacker = person1; defender = person2; gameOver = false;
  turnCount = MAX_TURNS - 1;
  showBoard(person1, person2);
  doAttack("right", "right");           // 30 + 1 = 31 → Bの負け。同時に200手目
  ok(turnCount === 200, "200手に到達している");
  ok(el("message").textContent.includes("Bの負け"),
     "引き分けではなく勝敗が出る: " + el("message").textContent);
`);

finish(sandbox);
