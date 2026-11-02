// ============================================================
// テスト6：CPU対戦
//
// CPUはいつもB。強さは「ちょうど31にしてたおせるなら必ずたおす、無ければでたらめ」。
//
// テストのしかけ：
//   CPUは setTimeout で「少し待ってから打つ」。
//   テストで本当に待つのは無駄なので、common.js の setTimeout は
//   予約を溜めるだけの偽物にしてある。runTimers()（と settle()）で好きなときに発火できる。
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
finished = (async () => {
  go("cpu");

  section("ちょうど31にできるときは、必ずたおす");
  let miss = 0;
  for (let i = 0; i < 50; i++) {
    h = [[20, 5], [11, 3]];
    const mv = cpuChoose();
    if (attackVal(h[1][mv.m], h[0][mv.t]) !== 31) miss++;
  }
  ok(miss === 0, "11 で 20 をたおす手を、50回とも選ぶ");

  section("たおれた手は、使わない・狙わない");
  let bad = 0;
  for (let i = 0; i < 200; i++) {
    h = [[31, 7], [31, 2]];
    const mv = cpuChoose();
    if (mv.m !== 1 || mv.t !== 1) bad++;
  }
  ok(bad === 0, "使えるのは 2 の手、狙えるのは 7 の手だけ（200回）");

  section("CPUの番は、人間が押せない");
  reset(); turn = 1;
  onSlot(1, 0); onSlot(0, 0);
  ok(sel === -1, "どの手を押しても選ばれない");

  section("CPUが考えているあいだに「はじめから」にしたら、CPUは打たない");
  reset(); turn = 1;
  cpuTurn();
  ok(pendingTimers() === 1, "CPUが待っている");
  reset(); await settle();
  ok(ply === 0 && turn === 0 && h.join() === "1,1,1,1", "CPUは打たなかった");

  section("CPUが考えているあいだに タイトルへもどっても、CPUは打たない");
  go("cpu"); turn = 1;
  cpuTurn();
  go(""); await settle();
  ok(ply === 0, "CPUは打たなかった");

  section("CPUと最後まで");
  go("cpu");
  let n = 0;
  while (!result && n < 400) {
    if (turn === 0 && !busy) {
      const ms = [];
      for (let m = 0; m < 2; m++) for (let t = 0; t < 2; t++) if (!isDead(h[0][m]) && !isDead(h[1][t])) ms.push([m, t]);
      const [m, t] = pick(ms);
      onSlot(0, m); onSlot(1, t);
    }
    await settle(); n++;
  }
  ok(result !== null, "決着か引き分けまで進んだ（" + ply + "手）");
  ok(result.text.startsWith("二進数バトル：CPU対戦、"), "コピーする文：" + result.text);
})();
`);

finish(sandbox);
