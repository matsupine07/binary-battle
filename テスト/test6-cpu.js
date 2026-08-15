// ============================================================
// テスト6：CPU対戦
//
// CPUはいつもB（person2）を担当する。強さは「殺せるなら殺す、無ければランダム」。
//
// テストのしかけ：
//   CPUは setTimeout で「700ミリ秒待ってから打つ」。
//   テストで本当に待つのは無駄なので、common.js の setTimeout は
//   予約を溜めるだけの偽物にしてある。runTimers() で好きなときに発火できる。
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
  section("起動時は人間ふたり");
  ok(vsCPU === false, "vsCPU は false");
  ok(isCPUTurn() === false, "CPUの番ではない");
  ok(el("foe-human").className === "mode-on", "「人間ふたり」に印");
  ok(el("foe-cpu").className === "",          "「CPU」に印は無い");

  section("CPU対戦に切り替え");
  turnCount = 5; gameOver = true;          // 汚れた状態から
  setCPU(true);
  ok(vsCPU === true, "vsCPU が true");
  ok(turnCount === 0 && gameOver === false, "切り替え時にリセットされる");
  ok(attacker === person1, "先手は人間（A）");
  ok(isCPUTurn() === false, "Aの番なのでCPUの番ではない");
  ok(buttonStates() === "有効 有効 有効 有効", "人間は打てる（" + buttonStates() + "）");
  ok(el("foe-cpu").className === "mode-on", "「CPU」に印が移った");

  section("人間が1手打つ → CPUの番になる");
  doAttack("right", "right");
  ok(attacker === person2, "手番がBに移った");
  ok(isCPUTurn() === true, "CPUの番になった");
  ok(buttonStates() === "無効 無効 無効 無効",
     "★CPUの番は人間が押せない（" + buttonStates() + "）");
  ok(el("message").textContent.includes("考えています"),
     "メッセージ: " + el("message").textContent);
  ok(pendingTimers() === 1, "CPUの手が1件予約された");

  section("予約を発火 → CPUが打つ");
  const beforeTurns = turnCount;
  runTimers();
  ok(turnCount === beforeTurns + 1, "手数が1増えた（CPUが打った）");
  ok(attacker === person1, "手番が人間に戻った");
  ok(buttonStates() === "有効 有効 有効 有効", "ボタン復活（" + buttonStates() + "）");
  ok(pendingTimers() === 0, "予約は残っていない");

  section("★CPUは殺せる手があれば必ず殺す");
  person1 = {name:"A", right:30, left:1};
  person2 = {name:"B", right:1,  left:1};
  attacker = person2; defender = person1;   // Bの番
  gameOver = false; turnCount = 0;
  showBoard(person1, person2);
  const move = chooseCPUMove();
  ok(move[0] === "right" && move[1] === "right",
     "B右(1) で A右(30) を狙う＝31ちょうど（選んだ手: " + move + "）");
  cpuMove();
  ok(person1.right === 31, "A右手が31になって死亡した");

  section("★待っている間にリセットされたらCPUは打たない");
  reset();
  ok(attacker === person1 && turnCount === 0, "リセット済み");
  doAttack("right", "right");               // 人間が打つ → CPUの手が予約される
  ok(pendingTimers() === 1, "予約が1件");
  const turnsBefore = turnCount;
  reset();                                   // 待っている間にリセット！
  runTimers();                               // 予約はそのまま発火してくる
  ok(turnCount === 0, "CPUは打たなかった（手数 " + turnCount + "）");
  ok(person2.right === 1 && person2.left === 1, "盤面も動いていない");

  section("人間ふたりに戻す");
  setCPU(false);
  ok(vsCPU === false, "vsCPU が false");
  doAttack("right", "right");
  ok(attacker === person2, "手番はBに移る");
  ok(isCPUTurn() === false, "CPUの番にはならない");
  ok(buttonStates() === "有効 有効 有効 有効", "人間が打てる（" + buttonStates() + "）");
  ok(pendingTimers() === 0, "CPUの予約は入らない");
  ok(el("foe-human").className === "mode-on", "「人間ふたり」に印が戻った");

  section("5本指モードでもCPUが動く");
  setMode("normal");
  setCPU(true);
  doAttack("right", "right");
  ok(isCPUTurn() === true, "CPUの番");
  runTimers();
  ok(turnCount === 2, "人間1手＋CPU1手＝2手（" + turnCount + "）");
  ok(MODE().max === 5, "5本指モードのまま");
`);

finish(sandbox);
