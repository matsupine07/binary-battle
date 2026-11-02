// ============================================================
// テスト3：計算と手数
//
//   ・足す。ちょうど31でたおれる。31を超えたら31を引く
//   ・たたくと1手。選んだだけ・押せない手を押しただけでは数えない
//   ・両手がたおれたら勝ち。決着のあとは押せない
// たたく処理は「揺れる」のを待つので、await settle() で最後まで進めてから確かめる
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
finished = (async () => {
  section("計算");
  ok(attackVal(3, 10) === 13, "3＋10＝13");
  ok(attackVal(3, 28) === 31, "3＋28＝31（たおれる数）");
  ok(attackVal(9, 24) === 2, "9＋24＝33 → 31を引いて 2");
  ok(attackVal(30, 30) === 29, "30＋30＝60 → 31を引いて 29");

  section("たたくと1手。相手の手が増えて、手番が変わる");
  go("human");
  onSlot(0, 0); onSlot(1, 1); await settle();
  ok(ply === 1, "1手になった");
  ok(h[1][1] === 2, "相手の右の手が 1＋1＝2");
  ok(turn === 1, "Bの番になった");

  section("選んだだけ・押せない手を押しただけでは、数えない");
  onSlot(1, 0); onSlot(1, 0);
  ok(ply === 1, "選んでやめただけ");
  h[0][0] = 31; render();
  onSlot(1, 1); onSlot(0, 0); await settle();
  ok(ply === 1, "たおれた手を押しただけ");

  section("ぴったり31で たおれて、両手がたおれたら勝ち");
  reset(); h = [[3, 1], [28, 31]];
  onSlot(0, 0); onSlot(1, 0); await settle();
  ok(h[1][0] === 31, "28 に 3 で 31（たおれた）");
  ok(result && result.win === 0, "Bの両手がたおれて、Aの勝ち");
  ok(result.text === "二進数バトル：ふたり対戦、1手で決着しました", "コピーする文：" + result.text);
  ok(el("board").innerHTML.includes("Aの勝ち！"), "画面に「Aの勝ち！」");

  section("決着のあとは、押せない");
  const p = ply;
  onSlot(0, 1); onSlot(1, 1); await settle();
  ok(ply === p, "決着のあとは数えない");

  section("はじめから");
  reset();
  ok(ply === 0 && turn === 0 && result === null && h.join() === "1,1,1,1", "全部もとにもどる");
})();
`);

finish(sandbox);
