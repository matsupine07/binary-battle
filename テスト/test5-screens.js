// ============================================================
// テスト5：画面の切りかえ
//
// 画面は3つ（タイトル・あそびかた・たいせん）。アドレスの # で決まる。
//   （なし）＝タイトル  #howto＝あそびかた  #cpu・#human＝たいせん
//   ・タイトルから入ると、はじめから
//   ・対戦の途中で あそびかた を見て もどると、続きから
//   ・相手（ひとりで／ふたりで）が変わると、はじめから
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
finished = (async () => {
  const showing = () => ["title", "howto", "game"].filter(k => !el("screen-" + k).hidden).join();

  section("開いたとき");
  ok(showing() === "title", "タイトルが出ている");

  section("ひとりで あそぶ");
  go("cpu");
  ok(location.hash === "#cpu", "# は cpu");
  ok(showing() === "game", "たいせんの画面");
  ok(vsCPU === true && el("mode-name").textContent === "ひとりで（CPU）", "CPUと");

  section("対戦の途中で あそびかた を見て、もどると続きから");
  onSlot(0, 0); onSlot(1, 0); await settle();
  const p = ply;
  ok(p === 2, "あなたとCPUで2手");
  go("howto");
  ok(showing() === "howto", "あそびかたの画面");
  location.hash = "#cpu"; show();   // ブラウザの「戻る」と同じ（popstate で show が走る）
  ok(showing() === "game" && ply === p, "続きから（" + ply + "手）");

  section("タイトルにもどって、もう一度入ると はじめから");
  go("");
  ok(showing() === "title", "タイトル");
  go("cpu");
  ok(ply === 0, "はじめから");

  section("相手が変わると はじめから");
  onSlot(0, 0); onSlot(1, 0); await settle();
  go("howto"); go("human");
  ok(vsCPU === false && ply === 0, "ふたりで に変わったので、はじめから");
  ok(el("mode-name").textContent === "ふたりで", "名前の表示も変わる");

  section("知らない # はタイトル");
  location.hash = "#nanika"; show();
  ok(showing() === "title", "タイトルが出る");
})();
`);

finish(sandbox);
