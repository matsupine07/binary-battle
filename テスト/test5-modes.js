// ============================================================
// テスト5：モード切り替え（二進数モード ⇔ 5本指モード）
//
// どちらも指は5本。違うのは「指の数え方」だけ。
//   5本指モード（元ゲーム）… 指を1本ずつ数える。片手の最大は5
//   二進数モード          … 指を桁として使う（親1・人2・中4・薬8・小16）。最大は31
//
// 違いは MODES オブジェクトの中だけにある。
// fingerStates のコードは1文字も変えずに、両方のモードで動く。
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
  section("二進数モード（起動時）");
  ok(modeName === "binary", "起動時は二進数モード");
  ok(MODE().max === 31, "上限は31");
  ok(attack(20, 20) === 9,  "attack(20,20) = 40 → 31を引いて 9");
  ok(attack(30, 1)  === 31, "attack(30,1)  = 31 ちょうど（死亡）");
  ok(isDead(31) === true && isDead(5) === false, "死亡ラインは31");
  ok(handToFingers(13) === "薬指中指親指", "13 → 薬指中指親指");
  ok(fingersUp(13) === 3, "13 は指3本（8+4+1）");
  ok(fingersUp(31) === 5, "31 は指5本");
  ok(el("mode-binary").className === "mode-on", "二進数ボタンに印");
  ok(el("mode-normal").className === "",        "5本指ボタンは印なし");

  section("5本指モードへ切り替え（汚れた状態から）");
  person1.right = 20; turnCount = 7; gameOver = true;
  setMode("normal");
  ok(modeName === "normal", "モードが normal になった");
  ok(MODE().max === 5, "上限は5");
  ok(person1.right === 1 && person2.left === 1, "盤面がリセットされた");
  ok(turnCount === 0, "手数もリセットされた");
  ok(gameOver === false, "決着フラグもリセットされた");
  ok(attack(4, 3) === 2, "attack(4,3) = 7 → 5を引いて 2");
  ok(attack(4, 1) === 5, "attack(4,1) = 5 ちょうど（死亡）");
  ok(isDead(5) === true && isDead(31) === false, "死亡ラインは5");
  ok(handToFingers(3) === "3本", "3 →「3本」と表示（指の名前は出さない）");
  ok(fingersUp(3) === 3, "3 は指3本");
  ok(fingersUp(5) === 5, "5 は指5本（死亡）");
  ok(el("mode-normal").className === "mode-on", "5本指ボタンに印");
  ok(el("mode-binary").className === "",        "二進数ボタンは印なし");

  section("5本指モードで1手");
  doAttack("right", "right");
  ok(person2.right === 2, "B右手が2になった");
  ok(turnCount === 1, "手数1");
  ok(el("message").textContent === "次はBの番です", "手番が交代");

  section("5本指モードで決着まで");
  person1 = {name:"A", right:1, left:1};
  person2 = {name:"B", right:4, left:5};
  attacker = person1; defender = person2; gameOver = false; turnCount = 0;
  showBoard(person1, person2);
  doAttack("right", "right");           // 4 + 1 = 5 → B右も死亡
  ok(gameOver === true, "決着した");
  ok(el("message").textContent.includes("Bの負け"), "勝敗: " + el("message").textContent);
  ok(el("board").innerHTML.includes("5（死亡）"), "死亡表示が「5（死亡）」になっている");
  ok(buttonStates() === "無効 無効 無効 無効", "ボタン全無効");

  section("二進数モードへ戻す");
  setMode("binary");
  ok(MODE().max === 31, "上限が31に戻った");
  ok(handToFingers(13) === "薬指中指親指", "指の名前表示も戻った");
  ok(gameOver === false && turnCount === 0, "状態もリセット");
`);

finish(sandbox);
